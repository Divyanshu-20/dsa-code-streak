# Acceptance Criteria

The prototype is ready to share only when all required items below pass on the deployed URL. Discussion is built last but, once included, its criteria must also pass.

## Authentication and access

- [ ] A new user can sign in with Google from the primary login action.
- [ ] Email/password remains available as a fallback for existing accounts.
- [ ] An invite URL survives the Google redirect and returns the user to the intended join flow.
- [ ] An email-provider rate limit shows a helpful Google fallback instead of a raw backend error.
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
- [ ] The owner can remove another member after confirmation; the removed member loses group access but keeps their sign-in account.
- [ ] A regular member cannot remove another member, and the owner cannot remove their own required membership, through the UI or direct API calls.

## Today's problems

- [ ] The owner can publish one or more problems for a chosen date with valid required fields.
- [ ] After publishing one problem, the owner can add another for the same date from the dashboard.
- [ ] Members can see all of today's problems and safely open each external URL in a new tab.
- [ ] A regular member cannot create, edit, or delete a problem through UI or direct API calls.
- [ ] The owner can edit a problem and the saved values persist after refresh.
- [ ] The owner can delete after confirmation; related completions/comments are removed.
- [ ] If no problem exists today, the dashboard shows a useful empty state.

## Automated roadmap

- [ ] The canonical roadmap contains Day 13-102, exactly 90 schedule days, and 126 official problems.
- [ ] Day 13 contains the official Sum 1..N drill alongside any existing manual problem.
- [ ] Regular members cannot read or complete a future roadmap problem through direct API calls.
- [ ] The dashboard changes dates at midnight in Asia/Kolkata and rechecks after a background tab becomes active.
- [ ] URL-free drills show a complete in-app prompt; linked problems continue to open safely in a new tab.
- [ ] Rest, revision, and zero-problem mock days show their roadmap instructions instead of the generic empty state.
- [ ] Running the roadmap installer again updates official content without duplicating schedule days or problems.

## Completion

Given a signed-in group member and one or more posted problems:

- [ ] Selecting **Mark done** creates exactly one completion for that user/problem.
- [ ] The control changes to a clear completed state while preventing duplicate clicks.
- [ ] Daily check-in count and that member's completed-problems status update correctly.
- [ ] Refresh preserves the completed state.
- [ ] Undo removes only the current user's completion and updates the view.
- [ ] A user cannot create, change, or delete another user's completion through direct API calls.
- [ ] Errors show a useful message and the UI returns to the database's real state.

## Daily progress

- [ ] The dashboard shows completed check-ins divided by current members multiplied by today's problem count.
- [ ] Every current member has a clear completed-problems count for today.
- [ ] Counts are derived from membership and completion records, not manually stored totals.
- [ ] Two test accounts see the same result after refresh.

## Seven-day heatmap

- [ ] Rows represent current group members and columns represent the last seven calendar dates.
- [ ] Completed, partly completed, incomplete, and no-problem dates are visually distinct.
- [ ] Data is derived from problems and completions.
- [ ] The heatmap is readable without horizontal breakage at approximately 390 px width.
- [ ] Empty or partially populated weeks render without errors.

## Open discussion

- [ ] A group member can read chronological posts for a group problem.
- [ ] A member can post text between 1 and 1000 trimmed characters, a code section up to 8000 characters, an image, or a supported combination.
- [ ] Image attachments accept only JPG, PNG, WebP, or GIF files up to 5 MB and remain in a private bucket.
- [ ] Code sections preserve whitespace, show their selected language, and can be copied.
- [ ] Empty submissions are rejected and duplicate pending submissions are prevented.
- [ ] Author name and timestamp are shown.
- [ ] The group owner can delete any discussion post after confirmation; regular members cannot delete another member's post.
- [ ] A non-member cannot read posts or discussion images, post content, or upload images through direct API calls.
- [ ] No replies, reactions, editing, mentions, or non-image file attachments are added.

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
