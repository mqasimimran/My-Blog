-- Called inside the restore transaction after the public schema is restored.
-- Only Storage URLs for the original project are rewritten.
create function pg_temp.rebase_storage_links(source_prefix text, target_prefix text)
returns void language plpgsql as $$
declare col record;
begin
  for col in
    select c.relname, a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) as sql_type
    from pg_catalog.pg_attribute a join pg_catalog.pg_class c on c.oid=a.attrelid
    where c.relnamespace='public'::regnamespace and c.relkind in ('r','p')
      and a.attnum>0 and not a.attisdropped and a.attgenerated=''
      and a.atttypid in ('text'::regtype,'varchar'::regtype,'json'::regtype,'jsonb'::regtype,'text[]'::regtype,'varchar[]'::regtype)
  loop
    execute format('update public.%I set %I=replace(%I::text,$1,$2)::%s where strpos(%I::text,$1)>0',
      col.relname,col.attname,col.attname,col.sql_type,col.attname) using source_prefix,target_prefix;
  end loop;
end $$;
select pg_temp.rebase_storage_links(:'source_storage', :'target_storage');
