# Source

- **Origin:** https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/web-artifacts-builder
- **Repository:** https://github.com/anthropics/skills
- **Commit:** `ca45fc496a3436251f191354091d557da31c15b5` (branch `main`, committed 2026-10-28)
- **Retrieved:** 2026-11-01
- **License:** Apache License 2.0, in the upstream file `LICENSE.txt` (copied here unchanged). The appendix states `Copyright 2026 Anthropic, PBC.` `SKILL.md` points at `LICENSE.txt` with `license: Complete terms in LICENSE.txt`.
- **Redistribution:** Apache 2.0 allows copying and distribution when the license is included. This folder was copied for that reason. It is official Anthropic source, and it is not MIT.
- **What was copied:** the whole `skills/web-artifacts-builder/` folder at that commit:
  - `SKILL.md`
  - `LICENSE.txt`
  - `scripts/init-artifact.sh`
  - `scripts/bundle-artifact.sh`
  - `scripts/shadcn-components.tar.gz` (upstream archive of shadcn/ui component sources used by the init script; the archive itself has no separate license file)

`SOURCE.md` was added by this research collection. It is not part of the upstream tree. Every other file in this folder is an unchanged copy of that commit.

**Official Anthropic** skill. It initializes a React artifact and bundles it to one `bundle.html`. Other folders in `anthropics/skills` were not vendored.
