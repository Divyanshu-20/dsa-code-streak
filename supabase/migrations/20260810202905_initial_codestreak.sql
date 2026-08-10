begin;

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 60),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  owner_id uuid not null references public.profiles(id),
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.problems (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  url text not null check (url ~* '^https?://'),
  platform text not null default 'LeetCode' check (char_length(trim(platform)) between 1 and 60),
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  problem_date date not null,
  note text check (note is null or char_length(trim(note)) between 1 and 500),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint problems_group_id_problem_date_key unique (group_id, problem_date)
);

create table public.completions (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (problem_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(trim(message)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index group_members_user_id_idx on public.group_members(user_id);
create index problems_group_date_idx on public.problems(group_id, problem_date desc);
create index completions_problem_id_idx on public.completions(problem_id);
create index completions_user_id_idx on public.completions(user_id);
create index comments_problem_created_idx on public.comments(problem_id, created_at);

create function private.is_group_member(target_group uuid, target_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = target_group and user_id = target_user
  );
$$;

create function private.is_group_owner(target_group uuid, target_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.groups
    where id = target_group and owner_id = target_user
  );
$$;

create function private.shares_group_with(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members mine
    join public.group_members theirs on theirs.group_id = mine.group_id
    where mine.user_id = auth.uid() and theirs.user_id = target_user
  );
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(new.email, '@', 1), ''), 'Member'),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, display_name, avatar_url)
select
  id,
  coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(email, '@', 1), ''), 'Member'),
  nullif(raw_user_meta_data ->> 'avatar_url', '')
from auth.users
on conflict (id) do nothing;

create function public.set_problem_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger problems_set_updated_at
  before update on public.problems
  for each row execute procedure public.set_problem_updated_at();

create function public.create_group(group_name text)
returns setof public.groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  created_group public.groups;
  generated_code text;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if char_length(trim(group_name)) not between 2 and 80 then
    raise exception 'Group name must contain 2 to 80 characters';
  end if;

  loop
    generated_code := upper(encode(extensions.gen_random_bytes(6), 'hex'));
    begin
      insert into public.groups (name, owner_id, invite_code)
      values (trim(group_name), current_user_id, generated_code)
      returning * into created_group;
      exit;
    exception when unique_violation then
      -- Generate another random invite code.
    end;
  end loop;

  insert into public.group_members (group_id, user_id)
  values (created_group.id, current_user_id);

  return next created_group;
end;
$$;

create function public.join_group(code text)
returns setof public.groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  matched_group public.groups;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into matched_group
  from public.groups
  where invite_code = upper(trim(code));

  if matched_group.id is null then
    raise exception 'Group not found';
  end if;

  insert into public.group_members (group_id, user_id)
  values (matched_group.id, current_user_id)
  on conflict (group_id, user_id) do nothing;

  return next matched_group;
end;
$$;

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.problems enable row level security;
alter table public.completions enable row level security;
alter table public.comments enable row level security;

create policy "Shared group members can read profiles"
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or (select private.shares_group_with(id)));

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "Members can read their groups"
on public.groups for select
to authenticated
using ((select private.is_group_member(id)));

create policy "Owners can update their groups"
on public.groups for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "Owners can delete their groups"
on public.groups for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "Members can read group membership"
on public.group_members for select
to authenticated
using ((select private.is_group_member(group_id)));

create policy "Members may leave and owners may remove members"
on public.group_members for delete
to authenticated
using (
  (user_id = (select auth.uid()) and not (select private.is_group_owner(group_id)))
  or (select private.is_group_owner(group_id))
);

create policy "Members can read group problems"
on public.problems for select
to authenticated
using ((select private.is_group_member(group_id)));

create policy "Owners can create group problems"
on public.problems for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.is_group_owner(group_id))
);

create policy "Owners can update group problems"
on public.problems for update
to authenticated
using ((select private.is_group_owner(group_id)))
with check (
  created_by = (select auth.uid())
  and (select private.is_group_owner(group_id))
);

create policy "Owners can delete group problems"
on public.problems for delete
to authenticated
using ((select private.is_group_owner(group_id)));

create policy "Members can read group completions"
on public.completions for select
to authenticated
using (
  exists (
    select 1 from public.problems
    where problems.id = completions.problem_id
      and (select private.is_group_member(problems.group_id))
  )
);

create policy "Members can create their own completion"
on public.completions for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.problems
    where problems.id = completions.problem_id
      and (select private.is_group_member(problems.group_id))
  )
);

create policy "Members can delete their own completion"
on public.completions for delete
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.problems
    where problems.id = completions.problem_id
      and (select private.is_group_member(problems.group_id))
  )
);

create policy "Members can read group comments"
on public.comments for select
to authenticated
using (
  exists (
    select 1 from public.problems
    where problems.id = comments.problem_id
      and (select private.is_group_member(problems.group_id))
  )
);

create policy "Members can create their own comments"
on public.comments for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.problems
    where problems.id = comments.problem_id
      and (select private.is_group_member(problems.group_id))
  )
);

revoke all on all tables in schema public from anon;
grant select, update on public.profiles to authenticated;
grant select, update, delete on public.groups to authenticated;
grant select, delete on public.group_members to authenticated;
grant select, insert, update, delete on public.problems to authenticated;
grant select, insert, delete on public.completions to authenticated;
grant select, insert on public.comments to authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_problem_updated_at() from public, anon, authenticated;
revoke all on function public.create_group(text) from public, anon;
revoke all on function public.join_group(text) from public, anon;
grant execute on function public.create_group(text) to authenticated;
grant execute on function public.join_group(text) to authenticated;

revoke all on function private.is_group_member(uuid, uuid) from public, anon;
revoke all on function private.is_group_owner(uuid, uuid) from public, anon;
revoke all on function private.shares_group_with(uuid) from public, anon;
grant execute on function private.is_group_member(uuid, uuid) to authenticated;
grant execute on function private.is_group_owner(uuid, uuid) to authenticated;
grant execute on function private.shares_group_with(uuid) to authenticated;

comment on function public.create_group(text) is 'Creates a private group and atomically adds the authenticated owner as a member.';
comment on function public.join_group(text) is 'Atomically joins the authenticated user to the private group identified by an invite code.';

commit;
