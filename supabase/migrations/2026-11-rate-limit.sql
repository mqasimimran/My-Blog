begin;
-- One transaction per allowance. Serialize contenders for the same action and identifier.
create or replace function public.consume_rate_limit(p_identifier text, p_action text, p_max integer, p_minutes integer)
returns boolean language plpgsql volatile security invoker set search_path = '' as $$
begin
  if nullif(p_identifier,'') is null or nullif(p_action,'') is null
      or p_max is null or p_minutes is null or p_max < 1 or p_minutes < 1 then
    return false;
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_identifier), pg_catalog.hashtext(p_action));
  if (select count(*) from public.rate_limit_log
      where identifier = p_identifier and action = p_action
        and created_at >= clock_timestamp() - make_interval(mins => p_minutes)) >= p_max then
    return false;
  end if;
  insert into public.rate_limit_log(identifier, action, created_at) values (p_identifier, p_action, clock_timestamp());
  return true;
end $$;
revoke all on function public.consume_rate_limit(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text,text,integer,integer) to service_role;
grant select, insert, delete on public.rate_limit_log to service_role;
-- The client portfolio lists published designs by date. Older installations can
-- install the limiter independently of the optional client gallery.
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='designs' and column_name='client_id') then
    create index if not exists designs_client_recent on public.designs(client_id, created_at desc) where published;
  end if;
end $$;
notify pgrst,'reload schema';
commit;
