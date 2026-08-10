begin;

drop policy "Members may leave and owners may remove members"
on public.group_members;

create policy "Members may leave and owners may remove members"
on public.group_members for delete
to authenticated
using (
  (
    user_id = (select auth.uid())
    and not (select private.is_group_owner(group_id))
  )
  or (
    (select private.is_group_owner(group_id))
    and user_id <> (select auth.uid())
  )
);

comment on policy "Members may leave and owners may remove members"
on public.group_members is
  'Members may leave a group. The group owner may remove another member but cannot remove their own required owner membership.';

commit;
