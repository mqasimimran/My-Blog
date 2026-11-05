-- Run against a local database with setup.sql applied. Every fixture is rolled back.
begin;
do $$
declare
  suffix text := gen_random_uuid()::text;
  product uuid;
  purchase uuid;
  payload jsonb;
  discount text := upper(suffix);
  link text;
  invoice uuid;
  result jsonb;
begin
  insert into products(name, slug, type, price, stock_quantity)
    values ('Inventory test', suffix, 'physical', 10, 1) returning id into product;
  insert into discount_codes(code, kind, value, max_uses) values (discount, 'amount', 1, 1);
  payload := jsonb_build_object('product_id', product, 'product_price', 9, 'discount_code', discount,
    'order_number', suffix, 'customer_name', 'Local test', 'customer_email', 'fixture@example.invalid',
    'customer_transaction_id', suffix, 'payment_method', 'manual', 'status', 'pending_verification');

  begin
    perform place_shop_order(payload || '{"product_price":7}');
    raise exception 'Accepted a stale price' using errcode = 'XX000';
  exception when raise_exception then null;
  end;
  assert (select used_count from discount_codes where code = discount) = 0, 'Failed checkout consumed a discount';
  purchase := place_shop_order(payload);
  assert (select stock_quantity from products where id = product) = 0, 'Stock was not reserved';
  begin
    perform place_shop_order(payload || jsonb_build_object('order_number', suffix || '-2'));
    raise exception 'Sold reserved inventory' using errcode = 'XX000';
  exception when raise_exception then null;
  end;
  assert claim_shop_order(purchase)->>'alreadyPaid' = 'false';
  assert claim_shop_order(purchase)->>'alreadyPaid' = 'true';
  update orders set status = 'refunded', download_token = null where id = purchase;
  assert claim_shop_order(purchase)->>'status' = '409', 'Refunded purchase was fulfilled again';
  assert (select stock_quantity from products where id = product) = 1;

  insert into proposals(number, client_name, title, status) values (suffix, 'Local test', 'Test', 'sent')
    returning public_token into link;
  result := accept_proposal(link, 'Local test', suffix);
  assert result->>'public_token' is not null;
  assert accept_proposal(link, 'Local test', suffix) is null, 'Proposal was accepted twice';
  select invoice_id into invoice from proposals where public_token = link;
  update invoices set repeat_monthly = true, repeat_next = '2024-01-31' where id = invoice;
  assert repeat_invoice(invoice, '2024-01-31') is not null;
  assert repeat_invoice(invoice, '2024-01-31') is null, 'Recurring invoice was created twice';
  assert (select repeat_next from invoices where id = invoice) = date '2024-02-29';
  assert repeat_invoice(invoice, '2024-02-29') is not null;
  assert (select repeat_next from invoices where id = invoice) = date '2024-03-31';

  insert into projects(title, slug, published) values ('Preview test', suffix, true) returning preview_token into link;
  update projects set published = false where slug = suffix;
  assert (select preview_token from projects where slug = suffix) <> link;
  assert not has_column_privilege('anon', 'projects', 'preview_token', 'select');
  assert not has_function_privilege('anon', 'claim_shop_order(uuid)', 'execute');
end $$;
rollback;
