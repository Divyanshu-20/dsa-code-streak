begin;

alter table public.completions rename to problem_check_ins;
alter table public.problem_check_ins rename column completed_at to created_at;

alter table public.problem_check_ins rename constraint completions_pkey to problem_check_ins_pkey;
alter table public.problem_check_ins rename constraint completions_problem_id_fkey to problem_check_ins_problem_id_fkey;
alter table public.problem_check_ins rename constraint completions_user_id_fkey to problem_check_ins_user_id_fkey;
alter table public.problem_check_ins rename constraint completions_problem_id_user_id_key to problem_check_ins_problem_id_user_id_key;
alter index public.completions_problem_id_idx rename to problem_check_ins_problem_id_idx;
alter index public.completions_user_id_idx rename to problem_check_ins_user_id_idx;

alter table public.problem_check_ins add column status text;
update public.problem_check_ins set status = 'solved';
alter table public.problem_check_ins alter column status set not null;
alter table public.problem_check_ins
  add constraint problem_check_ins_status_check
  check (status in ('attempted', 'needs_help', 'solved'));
alter table public.problem_check_ins
  add column updated_at timestamptz not null default now();

create trigger problem_check_ins_set_updated_at
  before update on public.problem_check_ins
  for each row execute procedure public.set_problem_updated_at();

drop policy if exists "Members can read published problem completions" on public.problem_check_ins;
drop policy if exists "Members can complete published problems" on public.problem_check_ins;
drop policy if exists "Members can undo published problem completions" on public.problem_check_ins;
drop policy if exists "Members can read group completions" on public.problem_check_ins;
drop policy if exists "Members can create their own completion" on public.problem_check_ins;
drop policy if exists "Members can delete their own completion" on public.problem_check_ins;

create policy "Members can read published problem check-ins"
on public.problem_check_ins for select
to authenticated
using (
  exists (
    select 1 from public.problems
    where problems.id = problem_check_ins.problem_id
      and problems.publish_at <= now()
      and (select private.is_group_member(problems.group_id))
  )
);

create policy "Members can create their own problem check-ins"
on public.problem_check_ins for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.problems
    where problems.id = problem_check_ins.problem_id
      and problems.publish_at <= now()
      and (select private.is_group_member(problems.group_id))
  )
);

create policy "Members can update their own problem check-ins"
on public.problem_check_ins for update
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.problems
    where problems.id = problem_check_ins.problem_id
      and problems.publish_at <= now()
      and (select private.is_group_member(problems.group_id))
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.problems
    where problems.id = problem_check_ins.problem_id
      and problems.publish_at <= now()
      and (select private.is_group_member(problems.group_id))
  )
);

create policy "Members can delete their own problem check-ins"
on public.problem_check_ins for delete
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.problems
    where problems.id = problem_check_ins.problem_id
      and problems.publish_at <= now()
      and (select private.is_group_member(problems.group_id))
  )
);

revoke all on table public.problem_check_ins from anon, authenticated;
grant select, delete on table public.problem_check_ins to authenticated;
grant insert (problem_id, user_id, status) on table public.problem_check_ins to authenticated;
grant update (status) on table public.problem_check_ins to authenticated;

comment on table public.problem_check_ins is
  'One honest daily status per member and published problem. A missing row means not started.';
comment on column public.problem_check_ins.status is
  'Member-reported state: attempted, needs_help, or solved.';

commit;
