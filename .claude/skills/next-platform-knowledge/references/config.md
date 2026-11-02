# Per-user configuration protocol

Resolves machine-specific paths for the medavis .next platform. Developers differ in install locations and tool versions, so paths are NOT hardcoded — they are asked once and stored, then reused.

## Where settings live

`~/.next-platform-knowledge/config.md` (Windows: `C:\Users\<you>\.next-platform-knowledge\config.md`).

## Settings (keys)

| Key | Meaning | Example (DO NOT assume — ask the user) |
|---|---|---|
| `git_root` | Root dir holding the cloned .next repos | `d:/git` |
| `old_java_home` | A JDK 11.x install (OLD/javax stack) | `C:/Program Files/Amazon Corretto/jdk11.0.21_9` |
| `old_maven_home` | A Maven 3.6.x install (OLD stack) | `D:/apache/apache-maven-3.6.3` |
| `new_java_home` | A JDK 21.x install (NEW/Jakarta stack) | `C:/Program Files/Amazon Corretto/jdk21.0.8_9` |
| `new_maven_home` | A Maven 3.9.x install (NEW stack) | `D:/apache/apache-maven-3.9.11` |
| `appserver_home` | Local WildFly install dir | `D:/medavis/applicationserver` |
| `path_confirm_mode` | `remember` (default) or `confirm-each-run` | `remember` |

## `git_root` resolution — runs FIRST, in EVERY session, regardless of context

`git_root` is special: it is needed for **any** .next work, not only Maven / jboss-cli commands — locating a project's git dir, running `git fetch` / `git log` / `git show`, reading `pom.xml` from a branch, branch/tag verification, release checks, etc. all depend on it. Therefore it is resolved **before any other step**, in **every** session that touches the .next platform.

This resolution MUST NOT be skipped based on context the surrounding IDE / harness happens to provide. Specifically:

- **Do NOT infer `git_root` from the IDE workspace paths / open folders / attached project list.** A workspace may list multiple cloned repos, but their common parent is not guaranteed to be the user's `.next` git root (the workspace may be a subset, reordered, or include non-.next repos). Workspace paths are a *hint*, never a *substitute* for the stored `git_root`.
- **Do NOT infer `git_root` from the current working directory.**
- **Do NOT carry `git_root` over from a previous session in memory.** Memory is not the config file; re-resolve from `config.md` each session.

Resolution steps (run on first .next reference in the session, before any git/dir-based action):

1. Read `~/.next-platform-knowledge/config.md`.
2. **`git_root` present and the directory exists on disk** → use it. State what you will use and proceed (unless `path_confirm_mode = confirm-each-run`, in which case ask the user to confirm first).
3. **Config file missing, key absent, or directory does not exist** → ask the user (question channel) for their `.next` git root. The workspace paths / cwd may be offered to the user as a *suggested* value, but the user must confirm or supply the value. Write the confirmed value to `config.md` (creating `~/.next-platform-knowledge/` on first run) before proceeding.
4. **Override anytime:** if the user wants a different root this run, ask for it and re-store it.

## Version hints (fixed requirements — these are NOT paths)

- **OLD stack** (javax / JavaEE 8): **JDK 11.x** + **Maven 3.6.x** + WildFly 21.
- **NEW stack** (Jakarta EE 10): **JDK 21.x** + **Maven 3.9.x** + WildFly 36 (+ `-Parquillian-cube`).
- Exact patch versions do NOT matter — store whatever path the developer has.

## Toolchain resolution protocol (run before any Maven / jboss-cli command)

`git_root` was already resolved above. The keys below (`*_java_home`, `*_maven_home`, `appserver_home`) are resolved only when a Maven / jboss-cli / local-server command is about to run.

1. Determine the **required stack** (old vs new) for the current project/branch — detection method in `integration-tests-prerequisites.md` → Stack Detection.
2. State the requirement hint (e.g., "NEW stack → needs JDK 21.x + Maven 3.9.x").
3. Read `~/.next-platform-knowledge/config.md`; look up the stack's `*_java_home` and `*_maven_home`.
4. **Verify each path exists on disk.**
   - **Present & valid:** if `path_confirm_mode = remember` → state what you will use and proceed; if `confirm-each-run` → ask the user to confirm or override first.
   - **Missing or invalid:** ask the user (question channel) for that toolchain's path (with the version hint), then write it to the config file.
5. **Override anytime:** if the user wants a different JDK/Maven this run, ask for the path and re-store it.
6. Build the command's `export JAVA_HOME=… && export PATH=<maven_home>/bin:$JAVA_HOME/bin:$PATH` from the **resolved** paths — never from the example paths in the reference files.

## First-time setup

If the config file does not exist, create `~/.next-platform-knowledge/` and write the file as you collect values. **`git_root` is collected on the first .next session regardless of task type** (see the `git_root` resolution section above). Toolchain keys (`*_java_home`, `*_maven_home`, `appserver_home`) are collected only when the current task needs them — a developer who only does new-stack work is never asked for a JDK 11.

## Format of the stored config file (human-editable)

```
# next-platform-knowledge config
git_root: d:/git
new_java_home: C:/Program Files/Amazon Corretto/jdk21.0.8_9
new_maven_home: D:/apache/apache-maven-3.9.11
appserver_home: D:/medavis/applicationserver
path_confirm_mode: remember
```
(Keys are absent until first needed.)
