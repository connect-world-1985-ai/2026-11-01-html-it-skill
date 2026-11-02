# Apache stack (companion to Step 1)

This file is `apache-stack.md`. Load **only** when `SKILL.md` Step 1 named set includes apache-dist with
`a>=2` **or** `medavis-apache.portable`. Facts (layers, schemes, pins):
`next-platform-knowledge/references/apache-portal-stack.md`.

Do **not** load for: solution-only, p4m-only, apache-dist `a==1`, or “this
is a Portal master-cut” with no apache names.

## Trigger (repeat of orchestrator — keep in sync)

1. Inspect named product ids and versions.
2. apache-dist present and `a==1` → stop; treat apache-dist as a normal Maven named product (old packaging). No extra rows from this file.
3. apache-dist `a>=2` OR id `medavis-apache.portable` → this file is in play (any RQG kind).

## Extra rows (not Maven `*.version`)

Mail trio (advertised):

| Product | If named | If missing after trigger |
|---|---|---|
| apache-dist | user version | UNRESOLVED this-ship; Flag INVESTIGATE |
| medavis-apache.portable | user version | UNRESOLVED; Flag INVESTIGATE |
| medavis.solution | user version | UNRESOLVED; Flag INVESTIGATE |

Merge these into the compare-stack confirmation table when a compare-to exists. **Always** add them to the Step 6 gated set, including master-cut with compare-to declined (no HARD STOP table) — Aspects 2/3 analog still need the rows. Do not invent Chocolatey timestamps or solution revs.

**Pin row medavis.apache** (always, when this file is in play):

- This-ship from solution psd1 `RequiredVersion` at the gated solution ref if solution this-ship is resolved. Path: `medavis.solution/medavis.solution.psd1`.
- Second cell / note: nupkg-bundled version from Chocolatey/Nexus package description when reachable. Else UNRESOLVED. Unreachable metadata is **not** Aspect 2 FAIL.
- Both resolved and different → Flag INVESTIGATE (user decides HOLD vs accept). Do not require the user to name `1.0.58`.

Git dirs: identity map #25/#22/#32/#33. Chocolatey this-ship ref is **not** tag `2.4.68.26082810`. Code lives at `packages/portable/medavis-apache.portable` inside `d:\git\chocolatey`. Missing clone of `chocolatey` or `medavis.apache` → Flag `UNREACHABLE`, keep the row, do not drop it (`compare-stack.md` §3 same rule).

## Aspect 1

- apache-dist 2.x: Maven tags / line tip as `compare-stack.md` if compare-to resolved.
- medavis.solution: git log only if a compare-to **ref** was confirmed; do not invent previous-`c` from `2.6.1101` using .next digit rules.
- medavis-apache.portable: `git log <range> -- packages/portable/medavis-apache.portable`. SKIP unless the user supplied a compare-to commit/date. Do not treat `yyMMddHH` as a git tag.
- medavis.apache: SKIP unless the user supplied a compare-to (no tags). Pin check is Aspect 2, not a fake log range.

Same optional `requesting-code-review` handoff as patch Aspect 1.

## Aspect 2 (alignment analog — not same-train digits)

PASS/FAIL on:

- apache-dist this-ship is 2.x **when that this-ship is resolved**. If apache-dist is missing after a Chocolatey-only trigger, the row stays `UNRESOLVED` / INVESTIGATE — that is **not** Aspect 2 FAIL. FAIL only if apache-dist is named (or otherwise resolved) and `a==1` while this file is in play via Chocolatey.
- Chocolatey version matches `httpd.yyMMddHH` when named (do not parse it as .next `a.b.c.d`).
- Pin consistency when **both** pins are resolved.
- Compare-to for apache-dist 2.x is **not** the last 1.x tag. UNRESOLVED previous-`c` stays UNRESOLVED.

Do **not** FAIL because `2.6.1101` ≠ `2.4.68.26082810` ≠ `2.0.0.3`. Do **not** FAIL because a nupkg description was unreachable.

Do **not** apply patch/master-cut “matching train digits” / own-version `a.b.0.d` to these extra rows. Accept solution `2.6.rev` and Chocolatey `httpd.yyMMddHH` as legal this-ship versions for this stack.

## Aspect 3 analog

- apache-dist: Maven SNAPSHOT / next-train as `master-cut.md` / `patch-release.md`.
- Chocolatey, medavis.apache: **SKIP** (no next-train SNAPSHOT scheme).
- solution: do not demand `2.7.0.1-SNAPSHOT`. SKIP analog unless the user asked a specific next-publish check.

## Aspect 4

Orchestrator rule unchanged (master-cut always SKIP). Patch: run merge-back only on repos that have `release/*`. SKIP medavis.apache and medavis-apache.portable when they do not follow `release/YYYY-MM-a.b.x.x`.

## Common mistakes

| Mistake | Reality |
|---|---|
| Same-train digits across the mail trio | Independent schemes. |
| Expanding from solution-only or p4m-only | Trigger is apache-dist 2.x or Chocolatey name. |
| Treating `1.45.0.1` as the four-layer stack | 1.x = old single-repo; do not load this file. |
| Inferring new stack from master-cut kind | Discriminator is the named version. |
| Defaulting 2.x compare-to to last 1.x (`1.47.0.1`) | Era mix. UNRESOLVED, do not invent. |
| Dropping Chocolatey row when `d:\git\chocolatey` is missing | UNREACHABLE, keep the row. |
| Inventing Chocolatey compare-to from `26082810` | Not a git tag. SKIP Aspect 1. |
| HOLD because nupkg metadata was unreachable | UNRESOLVED / INVESTIGATE, not FAIL. |
| Maven-walking medavis.apache | Not a `*.version` property. |
| Rejecting `2.4.68.26082810` as invalid `a.b.c.d` | Legal Chocolatey version for this stack. |
| Wiring extra rows only into the confirmation table | They also join Step 6 when Aspect 1 is SKIP. |
