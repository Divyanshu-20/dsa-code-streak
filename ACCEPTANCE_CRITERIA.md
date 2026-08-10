# Acceptance Criteria

The prototype is ready to share only when all required items below pass on the deployed URL. Discussion is built last but, once included, its criteria must also pass.

## Authentication and access

- [ ] A new user can sign in using the configured authentication method.
- [ ] Refreshing the page preserves a valid session.
- [ ] Signing out prevents protected pages from showing group data.
- [ ] A non-member cannot read a group's data through the UI or direct Supabase requests.
- [ ] No service-role or other private key appears in browser code or the repository.

## Create and join group

- [ ] An authenticated user can create a group and becomes its owner and member.
- [ ] The owner can copy an invite code/link.
- [ ] Another authenticated user can join using the valid invite.
- [ ] An invalid code shows a clear error and creates no membership.
- [ ] Joining twice does not create duplicate membership rows.

## Today's problem

- [ ] The owner can publish one problem for a chosen date with valid required fields.
- [ ] A second problem for the same group/date is prevented and the owner is guided to edit.
- [ ] Members can see today's problem and safely open its external URL in a new tab.
- [ ] A regular member cannot create, edit, or delete a problem through UI or direct API calls.
- [ ] The owner can edit a problem and the saved values persist after refresh.
- [ ] The owner can delete after confirmation; related completions/comments are removed.
- [ ] If no problem exists today, the dashboard shows a useful empty state.

## Completion

Given a signed-in group member and a posted problem:

- [ ] Selecting **Mark done** creates exactly one completion for that user/problem.
- [ ] The control changes to a clear completed state while preventing duplicate clicks.
- [ ] Daily completed count and that member's status update correctly.
- [ ] Refresh preserves the completed state.
- [ ] Undo removes only the current user's completion and updates the view.
- [ ] A user cannot create, change, or delete another user's completion through direct API calls.
- [ ] Errors show a useful message and the UI returns to the database's real state.

## Daily progress

- [ ] The dashboard shows completed members divided by current group members.
- [ ] Every current member has a clear completed/not completed status for today's problem.
- [ ] Counts are derived from membership and completion records, not manually stored totals.
- [ ] Two test accounts see the same result after refresh.

## Seven-day heatmap

- [ ] Rows represent current group members and columns represent the last seven calendar dates.
- [ ] Completed, incomplete, and no-problem dates are visually distinct.
- [ ] Data is derived from problems and completions.
- [ ] The heatmap is readable without horizontal breakage at approximately 390 px width.
- [ ] Empty or partially populated weeks render without errors.

## Minimal discussion

- [ ] A group member can read chronological comments for a group problem.
- [ ] A member can post plain text between 1 and 1000 trimmed characters.
- [ ] Empty submissions are rejected and duplicate pending submissions are prevented.
- [ ] Author name and timestamp are shown.
- [ ] A non-member cannot read or post comments through direct API calls.
- [ ] No replies, reactions, attachments, editing, or mentions are added.

## Quality and deployment

- [ ] Sign-in, join, dashboard, completion, progress, and sign-out work on the Vercel production URL.
- [ ] Direct loading of a protected route behaves correctly.
- [ ] Loading, empty, validation, and error states are clear.
- [ ] Core screens are usable at approximately 390 px and at desktop width.
- [ ] Lint/type checks and the production build pass for the generated stack.
- [ ] All application tables have Row Level Security enabled with tested policies.
- [ ] No out-of-scope feature has been added.

## Share decision

If any access-control, completion-persistence, or production-deployment criterion fails, do not share the app yet. Cosmetic issues may be recorded and fixed after the first user test if they do not block the core loop.
