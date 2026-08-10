create or replace function public.create_group(group_name text)
returns setof public.groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_email text;
  created_group public.groups;
  generated_code text;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select lower(email)
  into current_user_email
  from auth.users
  where id = current_user_id;

  if current_user_email is distinct from 'media.divy4nshu@gmail.com' then
    raise exception using
      errcode = '42501',
      message = 'Only the central admin can create groups';
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

revoke all on function public.create_group(text) from public, anon;
grant execute on function public.create_group(text) to authenticated;

comment on function public.create_group(text) is
  'Creates a private group only when called by the authenticated central admin.';
