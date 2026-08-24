# Database and Security

Use Supabase PostgreSQL. Apply all schema changes through a migration that can be rerun in a fresh project. Enable Row Level Security on every application table before the app is shared.

## Tables

### `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text not null`
- `avatar_url text null`
- `created_at timestamptz not null default now()`

Create or upsert a profile for each authenticated user. A simple auth-user trigger is acceptable.

### `groups`

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `owner_id uuid not null references profiles(id)`
- `invite_code text not null unique`
- `created_at timestamptz not null default now()`

### `group_members`

- `group_id uuid not null references groups(id) on delete cascade`
- `user_id uuid not null references profiles(id) on delete cascade`
- `joined_at timestamptz not null default now()`
- Primary key: `(group_id, user_id)`

The owner must also have a membership row.

### `problems`

- `id uuid primary key default gen_random_uuid()`
- `group_id uuid not null references groups(id) on delete cascade`
- `title text not null`
- `url text null` (required only when `prompt` is null)
- `platform text not null default 'LeetCode'`
- `difficulty text not null check (difficulty in ('Basic', 'Easy', 'Medium', 'Hard'))`
- `problem_date date not null`
- `note text null`
- `prompt text null`
- `schedule_day_id uuid null references schedule_days(id) on delete cascade`
- `source text not null check (source in ('manual', 'roadmap'))`
- `display_order smallint not null`
- `publish_at timestamptz not null`
- `created_by uuid not null references profiles(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- Multiple problems may share the same `(group_id, problem_date)`.

### `schedule_days`

- One row per roadmap day and group, uniquely identified by both `(group_id, day_number)` and `(group_id, schedule_date)`.
- Stores week/day metadata, day kind, topic, milestone, instructions, and `publish_at`.
- Roadmap problems reference the schedule day; rest, revision, and zero-problem mock days still have schedule metadata.

### `problem_check_ins`

- `id uuid primary key default gen_random_uuid()`
- `problem_id uuid not null references problems(id) on delete cascade`
- `user_id uuid not null references profiles(id) on delete cascade`
- `status text not null check (status in ('attempted', 'needs_help', 'solved'))`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- Unique constraint: `(problem_id, user_id)`

No row means the member has not started that problem. Existing completion rows migrate to `solved`.

### `comments`

- `id uuid primary key default gen_random_uuid()`
- `problem_id uuid not null references problems(id) on delete cascade`
- `user_id uuid not null references profiles(id) on delete cascade`
- `message text not null check (char_length(trim(message)) between 1 and 1000)`
- `created_at timestamptz not null default now()`

## Useful indexes

- `group_members(user_id)`
- `problems(group_id, problem_date desc)`
- `problem_check_ins(problem_id)`
- `problem_check_ins(user_id)`
- `comments(problem_id, created_at)`

Do not add derived heatmap or daily-summary tables.

## Required Row Level Security behavior

Policies may use small `security definer` membership helper functions if needed to avoid policy recursion. Set a safe `search_path` on such functions.

### Profiles

- Authenticated users may read profiles only when needed to display members of a group they share.
- A user may update only their own profile.

### Groups

- A member may read a group they belong to.
- An authenticated user may create a group with themselves as owner.
- Only the owner may update or delete the group.

### Group members

- Members may read membership rows for their own groups.
- A user may insert only a membership for themselves and only when the supplied invite code identifies the group. Prefer a small database function/RPC for atomic invite-code joining if direct insert cannot be secured cleanly.
- A user may remove only their own membership. Prevent or handle the owner leaving in V1.
- Only the owner may remove another member.

### Problems

- Group owners may preview their group's schedule. Other members may read a problem only after `publish_at <= now()`.
- Only the group owner may insert, update, or delete problems for that group.
- `created_by` must equal the authenticated user on insert.

### Problem check-ins

- Group members may read check-ins only for published problems in their group.
- A user may insert, update, or delete only their own check-in and only for a published problem in a group they belong to.
- Client inserts may set only `problem_id`, `user_id`, and `status`; client updates may change only `status`.
- No user may create, change, or delete another user's check-in.

### Comments

- Group members may read comments for problems in their group.
- A user may insert only their own comment inside a group they belong to.
- Deleting or editing comments is not required. If deletion is added, allow only the author or group owner.

## Integrity checks

- Attempting a duplicate group membership fails harmlessly.
- Attempting a duplicate check-in fails harmlessly.
- A non-member cannot read a group through direct API calls, not just through hidden UI.
- A member cannot create a problem by calling Supabase directly.
- A user cannot create, change, or delete another user's check-in.
- Deleting a problem removes its check-ins and comments.
- Heatmap and four-state daily counts are query results, never independent stored state.

## Data handling

- Store timestamps in UTC and format them in the `Asia/Kolkata` community timezone.
- Store daily assignment as `date`, not a timestamp.
- Store midnight publication as `timestamptz`; midnight India time is 18:30 UTC on the preceding date.
- Generate invite codes with sufficient randomness; do not use sequential IDs.
- Never expose or use the Supabase service-role key in frontend code.
