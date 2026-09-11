---
name: polish-commit
description: Review the last commit (or a given ref) for correctness bugs, duplicated code and logic, and over-written comments; fix everything found; then add or update the unit tests for whatever that commit added or changed. Use after landing a feature commit, when asked to "review the previous commit", "clean up the last commit", or "add the tests for what I just committed".
---

# Polish a commit

The pass this project runs after every feature commit. Work lands first and is
reviewed second, on purpose: the test rule in `CLAUDE.md` says not to write tests
while making a change, because tests written against unreviewed behaviour just
get rewritten. This skill is the second half of that rule.

## Target

`$ARGUMENTS` is a git ref, or empty for `HEAD`.

```bash
git log --oneline -3
git show --stat <ref>
```

If the working tree is dirty, say so and ask whether to review the commit or the
uncommitted changes - do not silently review the wrong thing.

## 1. Review

Run `/code-review <ref> high` for correctness. It runs in the background; carry
on with the passes below while it works, then fold its findings in.

Correctness is the half a tool is good at. Do these three yourself, because they
are judgement calls and this project cares about all three:

**Duplicated logic.** The commonest shape here is a helper added in one module
while an older function elsewhere already walks the same structure by hand -
they do not look alike, so grep for the *data* being traversed rather than for
similar code. Check whether a new helper makes an existing block redundant, and
whether the same guard is now written twice.

**Comments.** `CLAUDE.md` is explicit: `//`, a line or two, and only where the
code cannot say it. A longer one has to earn it - a protocol quirk, a value read
out of another program's source, a workaround whose reason is invisible. Cut:

- Narration of what the code already says.
- Design-decision essays in a component. The *why* of a layout belongs in a
  doc comment on a hoisted constant, not in three paragraphs of JSX.
- Anything that restates the JSDoc directly above it.
- Reasons that were true of an earlier draft and no longer describe the code.

**Altitude.** A function that grew past its point, a `validateX` that should
delegate the way its siblings do, a component that should have been two.

## 2. Fix

Apply everything. Keep behaviour changes separate from tidying in your report,
and call out anything that changes what the app does rather than how it reads -
especially a validation rule getting stricter or looser.

## 3. Tests

Now write them, following `CLAUDE.md`'s Tests section:

- One `__tests__/` folder inside the module; file named for the file it tests,
  never `index.test.ts`.
- One root `describe` per file named for the module path, one nested `describe`
  per function named exactly as exported.
- `import { describe, expect, it, jest } from '@jest/globals'` - no ambient
  globals. Mock the filesystem with `jest.mock('node:fs/promises')`.
- Name each `it` for the behaviour, not the mechanism.
- Where the commit fixed a bug, say so in a comment above the test that guards
  it, so nobody deletes it as redundant later.

Cover every function the commit added or changed. In scope: `src/shared`,
`src/core`, the CLI's pure helpers, the renderer's pure helpers, the settings
store. Out of scope and not worth arguing about: React components,
`createWindow`, `registerHandlers`.

Two traps that fail at parse time rather than as an assertion - neither is
obvious from the error:

- Nothing testable may import `react-router`.
- `src/cli/constants.ts` cannot be imported; mock it.

## 4. Verify

```bash
npm run check     # typecheck both projects + lint
npm test
```

Both must pass. If anything under `src/core/` moved, `npm run dry` must still
reproduce the same `out/race.ini` - diff it against a copy taken before the
change, and if it legitimately differs, say exactly which keys and why.

## Report

Lead with what changed behaviour, then the tidying, then the tests added. Name
findings you deliberately did not act on and why. If the review found nothing
worth fixing, say that plainly rather than inventing work.
