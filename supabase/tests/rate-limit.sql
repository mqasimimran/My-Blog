-- Run against a disposable database with the release migration applied.
begin;
do $$ begin
  if has_function_privilege('anon','public.consume_rate_limit(text,text,integer,integer)','EXECUTE')
    or has_function_privilege('authenticated','public.consume_rate_limit(text,text,integer,integer)','EXECUTE') then
    raise exception 'Public clients may not reserve server-side budgets';
  end if;
end $$;
set local role service_role;
do $$
declare subject text := gen_random_uuid()::text;
begin
  if not public.consume_rate_limit(subject,'test',1,1) then raise exception 'First claim failed'; end if;
  if public.consume_rate_limit(subject,'test',1,1) then raise exception 'Budget overrun'; end if;
  if not public.consume_rate_limit(subject,'other',1,1) then raise exception 'Actions must have separate budgets'; end if;
  if public.consume_rate_limit(subject,'test',null,1) then raise exception 'Invalid budget accepted'; end if;
end $$;
rollback;
