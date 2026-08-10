begin;

alter table public.problems
  drop constraint problems_group_id_problem_date_key;

comment on table public.problems is
  'Problems assigned to a private group. A group may have multiple problems on the same date.';

commit;
