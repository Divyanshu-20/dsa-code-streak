# User Flows

## 1. New member joins

`Open shared link -> Continue with Google -> Enter/accept invite code -> Join group -> Dashboard`

1. User opens the deployed link or invite link.
2. If signed out, the app offers Google as the primary one-tap option and email/password as a fallback.
3. After Google redirects back, the app restores the original invite destination.
4. The app shows the invite code from the link or asks the user to enter one.
5. User confirms joining.
6. The app creates one membership if it does not already exist.
7. User lands on the group dashboard.

Failure states:

- Invalid or expired-looking code: show "Group not found" and allow retry. Codes need not actually expire in V1.
- Existing member: do not duplicate membership; open the dashboard.
- Database error: show a retryable message and do not pretend the join succeeded.
- Email-provider rate limit: explain that Google sign-in is available immediately instead of exposing a raw backend error.

## 2. Admin creates a group

`Sign in -> Create group -> Enter name -> Create -> Copy invite link -> Dashboard`

1. User enters a group name.
2. App creates the group with the user as owner.
3. App also creates the owner's membership.
4. App displays a copyable invite code/link.

## 3. Admin publishes today's problems

`Dashboard -> Add problem -> Enter fields -> Publish -> Dashboard -> Add another problem (optional)`

Required fields: title, valid external URL, difficulty, and date. Platform defaults to LeetCode. Note is optional.

After publishing, the dashboard keeps an **Add another problem** action available. Each problem can be edited or deleted independently.

## 4. Member completes today's problems

`Dashboard -> Open problem externally -> Return -> Mark done -> See updated progress`

1. Member opens the external problem link in a new tab.
2. Member returns after solving it.
3. Member selects **Mark done**.
4. App creates the member's completion record once.
5. That problem's button becomes **Completed** and the daily check-in count/member status update.
6. Refresh preserves the completed state.
7. Selecting **Undo** removes only that member's completion after confirmation or a clear second action.

## 5. Member views daily progress

The dashboard shows:

- All of today's problems or a clear "No problem posted" state.
- `completed problem check-ins / (total active members × today's problem count)`.
- A completed-problems count for every group member.

Members cannot edit other members' statuses.

## 6. Member views seven-day progress

`Dashboard -> Progress -> Seven-day heatmap`

- Rows represent current group members.
- Columns represent the last seven calendar dates, including today.
- A date where every posted problem is completed is shown as completed.
- A date where some posted problems are completed is shown as partly completed.
- A date where no posted problems are completed is shown as incomplete.
- A date without a posted problem is shown as no problem, not as a failure.
- Values are calculated from `problems` and `completions`.

## 7. Member discusses a problem

`Open problem details -> Read comments -> Add short text -> Post`

- Comments are plain text, chronological, and linked to one problem.
- Empty or whitespace-only comments are rejected.
- The app shows author name and timestamp.
- No replies, reactions, attachments, editing, or mentions.
- This flow is implemented only after flows 1-6 work.

## 8. Admin edits or deletes a problem

Only the group owner sees admin actions.

- Edit: open the existing values, validate changes, save, and return to the dashboard.
- Delete: warn that related completions and comments will also be deleted, require confirmation, then show the empty state.

## 9. Sign out

`Account menu -> Sign out -> Login`

The session ends and protected group pages no longer reveal group data.
