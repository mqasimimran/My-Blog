-- Apply to an existing site before deploying the updated application.
begin;

-- Previously published items may have exposed their preview URLs. Rotate once.
create or replace function public.rotate_preview_on_unpublish() returns trigger
language plpgsql as $$
begin
  if old.published and not new.published then new.preview_token := gen_random_uuid()::text; end if;
  return new;
end $$;

do $$
declare t text; cols text;
begin
  foreach t in array array['projects','designs','articles'] loop
    select string_agg(quote_ident(column_name), ',') into cols from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name <> 'preview_token';
    execute format('revoke select on public.%I from public, anon, authenticated', t);
    execute format('revoke select (preview_token) on public.%I from public, anon, authenticated', t);
    execute format('grant select (%s) on public.%I to anon, authenticated', cols, t);
    if not exists (select from pg_trigger where tgrelid = format('public.%I',t)::regclass and tgname = 'rotate_preview') then
      execute format('update public.%I set preview_token = gen_random_uuid()::text', t);
      execute format('create trigger rotate_preview before update of published on public.%I for each row execute function public.rotate_preview_on_unpublish()', t);
    end if;
  end loop;
end $$;

alter table public.orders add column if not exists stock_reserved boolean not null default false;

-- Product availability, discount use, inventory reservation and the order commit together.
create or replace function public.place_shop_order(payload jsonb) returns uuid
language plpgsql set search_path = public as $$
declare
  o orders := jsonb_populate_record(null::orders, payload);
  p products;
  d record;
  amount numeric := 0;
  reserved boolean;
begin
  select * into p from products where id = o.product_id and active for update;
  if not found then raise exception 'Product unavailable' using errcode = 'P0001'; end if;
  reserved := p.type = 'physical' and p.stock_quantity is not null;
  if reserved then
    if p.stock_quantity <= 0 then raise exception 'Out of stock'; end if;
    update products set stock_quantity = stock_quantity - 1 where id = p.id;
  end if;
  if o.discount_code is not null then
    select * into d from redeem_discount(o.discount_code);
    if not found then raise exception 'Discount is no longer available'; end if;
    amount := round(least(p.price, case when d.kind = 'percent' then p.price*d.value/100 else d.value end),2);
  end if;
  if o.product_price is distinct from p.price - amount then raise exception 'Price changed. Refresh checkout.'; end if;
  insert into orders (id, order_number, product_id, product_name, product_price, discount_code, discount_amount,
    amount_local, currency_local, customer_name, customer_email, payment_method, customer_transaction_id, status,
    payment_proof, payment_provider, stock_reserved)
  values (coalesce(o.id, gen_random_uuid()), o.order_number, p.id, p.name, p.price - amount, o.discount_code, amount,
    o.amount_local, o.currency_local, o.customer_name, o.customer_email, o.payment_method, o.customer_transaction_id,
    o.status, o.payment_proof, o.payment_provider, reserved) returning id into o.id;
  return o.id;
end $$;

create or replace function public.release_order_stock() returns trigger language plpgsql set search_path = public as $$
begin
  if old.stock_reserved and new.status in ('rejected','refunded') then
    update products set stock_quantity = stock_quantity + 1 where id = old.product_id;
    new.stock_reserved := false;
  end if;
  return new;
end $$;
drop trigger if exists release_order_stock on public.orders;
create trigger release_order_stock before update of status on public.orders
  for each row execute function public.release_order_stock();

create or replace function public.claim_shop_order(order_id uuid) returns jsonb
language plpgsql set search_path = public as $$
declare o orders; p products;
begin
  select * into o from orders where id = order_id for update;
  if not found then return jsonb_build_object('status',404,'error','Order not found'); end if;
  if o.status = 'paid' then return jsonb_build_object('alreadyPaid',true,'order',to_jsonb(o)); end if;
  if o.status not in ('pending_verification','awaiting_card') then
    return jsonb_build_object('status',409,'error','Order is no longer pending');
  end if;
  -- Older pending orders predate stock reservations.
  if not o.stock_reserved then
    select * into p from products where id = o.product_id for update;
    if p.type = 'physical' and p.stock_quantity is not null then
      if p.stock_quantity <= 0 then return jsonb_build_object('status',409,'error','Out of stock'); end if;
      update products set stock_quantity = stock_quantity - 1 where id = p.id;
      o.stock_reserved := true;
    end if;
  end if;
  update orders set status = 'paid', verified_at = now(), download_token = gen_random_uuid()::text,
    stock_reserved = o.stock_reserved where id = order_id returning * into o;
  return jsonb_build_object('alreadyPaid',false,'order',to_jsonb(o));
end $$;

create table if not exists public.billing_numbers (prefix text primary key, last_number bigint not null);
alter table public.billing_numbers enable row level security;
revoke all on public.billing_numbers from public, anon, authenticated;
grant select, insert, update on public.billing_numbers to service_role;

create or replace function public.next_billing_number(series text) returns text
language plpgsql set search_path = public as $$
declare prefix_text text := series || '-' || extract(year from current_date)::int || '-';
  n bigint; suffix text;
begin
  if series not in ('INV','PRO') then raise exception 'Unknown numbering series'; end if;
  execute format('select coalesce(max(substring(number from %L)::bigint),0) from %I',
    '^' || prefix_text || '([0-9]+)$', case series when 'INV' then 'invoices' else 'proposals' end) into n;
  insert into billing_numbers as b (prefix,last_number) values (prefix_text,n+1)
    on conflict (prefix) do update set last_number = greatest(b.last_number+1, excluded.last_number)
    returning last_number::text into suffix;
  return prefix_text || lpad(suffix,greatest(3,length(suffix)),'0');
end $$;

create or replace function public.accept_proposal(proposal_token text, signer text, fingerprint text) returns jsonb
language plpgsql set search_path = public as $$
declare p proposals; inv invoices;
begin
  select * into p from proposals where public_token = proposal_token and status = 'sent' for update;
  if not found or p.valid_until < current_date then return null; end if;
  insert into invoices (number, client_name, client_email, currency, items, discount, tax_percent, notes, status, due_date, sent_at)
    values(next_billing_number('INV'),p.client_name,p.client_email,p.currency,p.items,p.discount,p.tax_percent,
      'For proposal ' || p.number || ': ' || p.title,'sent',current_date + 14,now()) returning * into inv;
  update proposals set status = 'accepted', accepted_at = now(), signed_name = signer, signed_ip_hash = fingerprint,
    invoice_id = inv.id where id = p.id;
  update messages set stage = 'won' where id = p.lead_id;
  return jsonb_build_object('number',inv.number,'public_token',inv.public_token);
end $$;

alter table public.invoices add column if not exists repeat_anchor_day integer;
create or replace function public.repeat_invoice(source_id uuid, scheduled date) returns jsonb
language plpgsql set search_path = public as $$
declare src invoices; copy invoices; month_start date; anchor integer;
begin
  select * into src from invoices where id = source_id and repeat_monthly and repeat_next = scheduled
    and scheduled <= current_date for update;
  if not found then return null; end if;
  anchor := coalesce(src.repeat_anchor_day, extract(day from scheduled)::int);
  month_start := (date_trunc('month', scheduled) + interval '1 month')::date;
  insert into invoices (number,client_name,client_email,client_address,currency,items,discount,tax_percent,notes,status,
    issue_date,due_date,sent_at,repeated_from)
    values(next_billing_number('INV'),src.client_name,src.client_email,src.client_address,src.currency,src.items,
      src.discount,src.tax_percent,src.notes,'sent',current_date,current_date + 14,now(),src.id) returning * into copy;
  update invoices set repeat_anchor_day = anchor, repeat_next = least(month_start + (anchor - 1),
    (month_start + interval '1 month - 1 day')::date) where id = src.id;
  return to_jsonb(copy);
end $$;

revoke all on function public.place_shop_order(jsonb), public.claim_shop_order(uuid), public.next_billing_number(text),
  public.accept_proposal(text,text,text), public.repeat_invoice(uuid,date) from public,anon,authenticated;
grant execute on function public.place_shop_order(jsonb), public.claim_shop_order(uuid), public.next_billing_number(text),
  public.accept_proposal(text,text,text), public.repeat_invoice(uuid,date) to service_role;
commit;
