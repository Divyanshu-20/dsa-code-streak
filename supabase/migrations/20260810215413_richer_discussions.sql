begin;

alter table public.comments
  alter column message drop not null,
  add column image_path text,
  add column code_body text,
  add column code_language text;

alter table public.comments
  drop constraint comments_message_check,
  add constraint comments_message_check check (message is null or char_length(trim(message)) between 1 and 1000),
  add constraint comments_image_path_check check (image_path is null or char_length(trim(image_path)) between 1 and 500),
  add constraint comments_code_body_check check (code_body is null or char_length(trim(code_body)) between 1 and 8000),
  add constraint comments_code_language_check check (code_language is null or char_length(trim(code_language)) between 1 and 30),
  add constraint comments_code_language_requires_code_check check (code_body is not null or code_language is null),
  add constraint comments_has_content_check check (message is not null or image_path is not null or code_body is not null);

drop policy "Members can create their own comments" on public.comments;

create policy "Members can create their own comments"
on public.comments for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.problems
    where problems.id = comments.problem_id
      and (select private.is_group_member(problems.group_id))
      and (
        comments.image_path is null
        or (
          split_part(comments.image_path, '/', 1) = problems.group_id::text
          and split_part(comments.image_path, '/', 2) = (select auth.uid())::text
        )
      )
  )
);

create policy "Group owners can delete comments"
on public.comments for delete
to authenticated
using (
  exists (
    select 1 from public.problems
    where problems.id = comments.problem_id
      and (select private.is_group_owner(problems.group_id))
  )
);

grant delete on public.comments to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('discussion-images', 'discussion-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "Group members can read discussion images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'discussion-images'
  and (storage.foldername(name))[1] in (
    select group_members.group_id::text from public.group_members
    where group_members.user_id = (select auth.uid())
  )
);

create policy "Group members can upload their discussion images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'discussion-images'
  and (storage.foldername(name))[1] in (
    select group_members.group_id::text from public.group_members
    where group_members.user_id = (select auth.uid())
  )
  and (storage.foldername(name))[2] = (select auth.uid())::text
);

create policy "Uploaders and group owners can delete discussion images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'discussion-images'
  and (
    (storage.foldername(name))[2] = (select auth.uid())::text
    or (storage.foldername(name))[1] in (
      select groups.id::text from public.groups
      where groups.owner_id = (select auth.uid())
    )
  )
);

commit;
