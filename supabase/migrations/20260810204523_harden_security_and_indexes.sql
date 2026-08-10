begin;

-- Supabase's project-level auto-RLS event trigger uses this helper internally.
-- It is not an application RPC and should not be callable through the Data API.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

create index if not exists groups_owner_id_idx on public.groups(owner_id);
create index if not exists problems_created_by_idx on public.problems(created_by);
create index if not exists comments_user_id_idx on public.comments(user_id);

commit;
