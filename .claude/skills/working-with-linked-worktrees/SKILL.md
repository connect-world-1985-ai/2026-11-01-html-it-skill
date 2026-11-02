---
name: working-with-linked-worktrees
description: Use only when the user explicitly invokes working-with-linked-worktrees by name. Do not use it because a repository, branch, or worktree situation merely matches.
---

# working-with-linked-worktrees

## Role question

Ask whether this chat is the integration checkout (the primary folder, where topic branches merge back) or a topic in a linked worktree. A topic may be an idea, a bugfix, or other work. Ask this on every invocation, even when the memory file already has a role.

The invocation itself is not a reason to run git. The first question is the role. Do not ask whether to load the memory file instead of asking the role.

Between invocations, keep the role from this session's selection (`managing-session-memory` -> Session Selections): the `## Worktree role` block in this session's memory file, or the role held in context when no memory file exists yet. If that file has a Remaining cleanup entry whose still to do is not none, state those open entries once when the file is loaded. Then continue the chat's normal work. Do not delete anything because of that reminder. Do not ask again until the user invokes the skill.

On an invocation, ask the role first. If Remaining cleanup still to do is not none, state those open entries before offering another finish. The reminder does not delete anything.

## Topic procedure

Ask what the job is. Propose a short slug. Wait for the user to accept or change it. Ask for the branch prefix. Do not assume `feature/`. The folder is `.worktrees/<slug>`. The branch is `<prefix>/<slug>`.

Ask which repositories this job touches. Use that same slug and branch name in each selected repository. Leave every other repository alone.

Ask where the branch starts: the primary checkout's current branch, or another branch or commit the user names. Ask this every time. When the user names a branch, that name is the start point. Do not substitute `HEAD`.

Do not create the worktree after only one of these answers. A repository choice does not replace the slug, the prefix, or the start point.

If `.gitignore` has no `.worktrees/` line, add it and show `git diff -- .gitignore`. Do not commit. Confirm the rule with:

```bash
git check-ignore -v .worktrees/
```

`git check-ignore -v .worktrees` does not match a pattern that ends in `/`. A check-ignore result is not a substitute for the diff.

Create the linked worktree only after the slug, the prefix, the repositories, and the start point are chosen, and after any `.gitignore` diff has been shown:

```bash
git -c core.longpaths=true worktree add -b <prefix>/<slug> .worktrees/<slug> <start>
```

Do not write git config. `<start>` is `HEAD` only when the user chose the primary checkout's current branch. `git worktree add` checks out a clean tree. It does not bring uncommitted files.

Then show every uncommitted path. Copy only the paths the user selects into the new linked worktree. After those copies are in the linked worktree, restore those paths in the primary checkout. List the dirty paths you left. Do not restore the primary copies before the linked worktree has them. Do not commit or push.

Then record the role as a session selection, without asking (see Memory role block). Its memory location is that linked worktree. Continue the chat's work in the linked worktree.

Leftover cleanup is not available in a topic role. If the user asks to scan or clean leftovers, do not remove a worktree, delete a branch, or delete a remote branch. Say that cleanup belongs to the integration role in the primary checkout.

## Integration procedure

Stay in the primary checkout. Do not create a worktree, merge, fetch, switch branches, or clean up because the user chose this role. "Integration checkout" means this folder and its current branch. It does not mean the remote default branch. Record the role as a session selection, without asking (see Memory role block). Its memory location is the primary checkout. After the integration role is chosen, ask once and wait:

- Scan leftovers
- Continue with this chat

Continue does not scan. If the user later asks in words to scan or clean leftover linked worktrees, topic branches, or remote topic branches, run the Leftover scan section. Do not start a scan because leftovers exist. On this invocation, if Remaining cleanup still to do is not none, state those open entries before offering another finish. Then do the chat's normal work.

Merge only when the user later asks. Ask which topic branch. Merge it into the branch already checked out in the primary checkout. If the merge conflicts, tell the user a conflict exists, then resolve it by reading both sides. A rename on one side and a body change on the other are both readable: keep the new name and the new body. Do not leave conflict markers. Do not leave the merge paused for the user to pick a side.

If one side cannot be understood, stop and name the undecided part. Do not guess. Do not run `git merge --abort`.

After the merge succeeds, do not push, remove the worktree, or delete a branch until the user chooses. Offer exactly these choices and wait:

- Finish this topic
- Something else
- Do nothing yet

**Finish this topic** stops at the first failure. Do not delete anything when a failure happens before the delete step. Do not use `git worktree remove --force` or `git branch -D`.

Before the push, if the primary checkout's current branch is not the integration branch recorded as this session's selection (the `## Worktree role` block, or the role held in context), stop and name both branches. Delete nothing. If no role was recorded, the branch checked out when the integration role was chosen is the integration branch.

1. The merge is already a commit on the integration branch in the primary checkout. A fast-forward counts. Do not create another commit. If the merge is uncommitted, or the linked worktree has uncommitted files, stop and name those paths.
2. Push the integration branch to its upstream. If it has no upstream, stop and ask which remote to push to. If the push is rejected, stop. Do not delete anything. Do not use `--force`. When an upstream exists, the push is:

```bash
git push
```

After that push succeeds, require:

```bash
git merge-base --is-ancestor HEAD @{u}
```

If that test fails, stop. Do not delete anything. `@{u}` is the remote integration branch that received the push.
3. Resolve the server topic branch before any delete:

```bash
git ls-remote --heads <remote> refs/heads/<prefix>/<slug>
```

Treat the server branch as present only when one printed line is exactly `refs/heads/<prefix>/<slug>`. Ignore every other printed ref. Do not delete those other names. If no line is that exact ref, the remote topic branch is absent. Say so, and skip the remote delete later. If that exact ref is present, fetch it and require this test to exit 0:

```bash
git fetch <remote> <prefix>/<slug>
git merge-base --is-ancestor <remote>/<prefix>/<slug> @{u}
```

If that test fails, stop and name the remote commits that are not in the integration branch. Do not remove the worktree, do not delete the local topic branch, and leave the remote topic branch in place.
4. Then, from the primary checkout, only after the tests above passed. Remove the worktree, then delete the local branch only when its tip is contained in `HEAD`:

```bash
git worktree remove .worktrees/<slug> && git merge-base --is-ancestor <prefix>/<slug> HEAD && git branch -d <prefix>/<slug>
```

Do not use `git branch -D`. Run the remote delete only when step 3 found the server branch and `git merge-base --is-ancestor <remote>/<prefix>/<slug> @{u}` exited 0:

```bash
git push <remote> --delete <prefix>/<slug> && git fetch <remote> --prune
```

When the remote topic branch does not exist, skip that delete and say that it was absent. `<remote>` is the remote the integration branch was pushed to.

**Something else** does only the action the user names.

**Do nothing yet** does not push and does not delete.

After every choice, including a finish that stops, record the Remaining cleanup entry below (written or held; see Remaining cleanup). Write it in the primary checkout only.

## Leftover scan

Run this section only for the integration role, in the primary checkout, on the integration branch. Do not push the integration branch. Do not write git config. Do not use `git worktree remove --force` or `git branch -D`. The only allowed push in this section is `git push <remote> --delete <prefix>/<slug>` after the remote-integration ancestor test passes.

If the primary checkout's current branch is not the integration branch recorded as this session's selection (the `## Worktree role` block, or the role held in context), stop and name both branches. Delete nothing. If no role was recorded, the branch checked out when the integration role was chosen is the integration branch.

Look at linked worktrees other than the primary checkout, including ones this skill did not create. For each one, look at its folder, the branch checked out there, and that branch's remote topic branch. Also look at prunable worktree registrations whose folders are gone, and at Remaining cleanup entries in the primary checkout. Do not treat every other local branch in the clone as a leftover.

Classify each leftover on its own. Show a safe list and a leave list, with the reason for each leave, and wait. Clean only the safe list after the user says so. If the user stops, delete nothing. One failed leftover does not decide the others.

A worktree folder is safe to remove when it is not the primary checkout, it is not locked, its status is clean, and the commit checked out there is contained in the integration branch. Remove it from the primary checkout with `git worktree remove` and no `--force`.

A local topic branch is safe to delete when it is not the integration branch, it is not `main`, it is not `master`, it is not the remote's default branch, it is not checked out anywhere, and this test exits 0 while the current branch is the integration branch:

```bash
git merge-base --is-ancestor <prefix>/<slug> HEAD
```

Delete it with `git branch -d` only after that test. Do not use `git branch -D`. `git branch -d` by itself is not that test: a branch merged only to its own upstream is still deleted.

A remote topic branch is safe to delete only when it is not `main`, not `master`, not the remote's default branch, and not the integration branch's upstream (`@{u}`). Put those refs on the leave list. It is also safe only when the integration branch has an upstream, the fetch succeeds, and the remote topic tip is contained in the remote integration branch:

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u}
git fetch <remote> <prefix>/<slug>
git fetch <remote> <integration-branch>
git merge-base --is-ancestor <remote>/<prefix>/<slug> <remote>/<integration-branch>
```

`<remote>/<integration-branch>` is the upstream from the first command. If the integration branch has no upstream, or the fetch fails, leave every remote topic branch and say why. Still judge local folders and branches. A dirty worktree or an unmerged local branch does not block a remote delete that passed this test. Delete a safe remote topic branch with `git push <remote> --delete <prefix>/<slug>` only after that ancestor test passes. Do not run that delete for `main`, `master`, the remote's default branch, or `@{u}`. Then `git fetch <remote> --prune`. If the server branch stays, the remote-tracking bookmark stays.

After the user accepts or stops, update Remaining cleanup as a session selection (see Remaining cleanup). Do not commit it unless the user asks. A leftover that was fully cleaned has still to do none. A leftover that stays records the reason.

## Memory role block

Record the role as a session selection (`managing-session-memory` -> Session Selections), without asking. Its memory location is the checkout whose role it records, unless this session already created a memory file elsewhere (`managing-session-memory` -> Memory Location). When this session has a memory file, write the section into it. When it has none, hold the role in context; it is written when the session's memory file is created. Never create a memory file only to hold the role, and do not keep the role in a second file.

The section is a record of the checkout this session used. Write it that way. A later reader must not treat a removed worktree path as the place to edit.

Commit the session memory, role section included, only when the user asks, the same as any other session memory. A topic session memory may merge onto the integration branch.

```markdown
## Worktree role

This section records the checkout this session used.

- **Role**: integration | topic
- **Checkout**: <absolute path of this checkout>
- **Branch**: <branch checked out here>
- **Slug**: <slug or n/a>
- **Topic branch**: <prefix/slug or n/a>
- **Start point**: <branch or commit the topic started from, or n/a>
- **Repositories**: <selected absolute paths, or n/a>
- **Recorded**: <date>
```

## Remaining cleanup

Remaining cleanup is a session selection (`managing-session-memory` -> Session Selections). Write it only in the primary checkout, in the one integration session memory that holds this primary checkout's Worktree role section. Update that same file in place. When that file does not exist yet, hold the entry in context; it is written when the integration session's memory file is created. When this session's memory file is inside a linked worktree, never write the entry there: keep it held, and the Termination Gate names it as lost either way (removing that worktree would delete the record; the leftover scan finds the leftovers from git). Never create a memory file only to hold Remaining cleanup. Do not start a new Remaining cleanup file for a later chat. Do not write this section in a linked worktree. Commit it only when the user asks. Update that topic's existing entry when the same topic is cleaned up later.

- **Topic branch**: <prefix/slug>
- **Linked worktree**: <absolute path>
- **Integration branch**: <branch>
- **Integration push**: not pushed | pushed to <remote>/<branch>
- **Local topic branch**: still present | deleted
- **Remote topic branch**: still present | absent | deleted
- **Remote-tracking bookmark**: still present | pruned
- **Choice**: finish this topic | something else | do nothing yet | leftover scan
- **Still to do**: <steps, or none>
- **Recorded**: <date>

Do nothing yet sets still to do to: push the integration branch; remove the linked worktree; delete the local topic branch; delete the remote topic branch when it exists.

Something else records the action the user asked for. Still to do is whatever of those four steps was not done.

A completed finish sets still to do to none. A finish that stops records the remaining step and the reason it stopped.

A leftover scan records the safe items the user accepted and the leave items with their reasons. Still to do is none only when that topic was fully cleaned.

On the next invocation of this skill in that checkout, show every entry whose still to do is not none before offering another finish. When a later session loads that memory file, state those open entries once, then continue the chat's normal work. Do not delete anything because of that reminder.
