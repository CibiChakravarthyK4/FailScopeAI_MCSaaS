# Working Process

Full detail behind the condensed "Working Process" section in the root `CLAUDE.md`.

## 1. One prompt at a time

The user gives numbered prompts (Prompt 1, Prompt 2, ...). Work on one prompt at a time. Never start the next one until told to, even if the next step seems obvious.

## 2. Claude does its own testing

For every feature or fix:
- Write or update tests covering positive, negative, boundary and failure cases.
- Run lint, typecheck, `pytest` and `vitest` (exact commands in `CLAUDE.md` "Local development").
- For UI changes, screenshot at 1440px, 1024px and 390px and confirm `document.documentElement.scrollWidth === document.documentElement.clientWidth` at each width (no horizontal overflow).
- Show the real results (actual pass/fail counts, actual output) - never just assert "tests pass" without showing the run.

If no browser/screenshot tool is available in the session, say so plainly instead of skipping the check silently, and ask for a screenshot or for the check to be done another way.

## 3. Nothing is "finished" without proof

Do not mark a task finished unless its tests actually ran and passed in this session. If a test fails, or a step was skipped (for example, no browser tool available), say so plainly in the response - don't imply success.

## 4. Random UI checks from the user

The user may send a screenshot at any time as a spot check. When that happens: validate it against `CLAUDE.md`'s design rules (two colours, no gradients, `docs/design-system.md`'s layout rules) and give a list of changes needed, each phrased as a ready-to-use prompt for the next fix.

## 5. Task update format (end of every response)

Every response ends with exactly this structure:

```
FINISHED: (what was completed, and the tests that prove it)
PENDING: (numbered, in the suggested build order)
BLOCKED / NEEDS A HUMAN: (decisions, real company details, keys, etc.)
```

- **FINISHED** names the actual test runs/results, not just a claim.
- **PENDING** is numbered and ordered the way the work should actually be tackled next.
- **BLOCKED / NEEDS A HUMAN** covers anything that needs a decision, a real fact (company details, pricing), or a credential/key that can't be invented.

## 6. Everything else in CLAUDE.md still applies

C01-C08, the Definition of Done (`docs/testing.md`), no invented facts, and no old product name in user-facing text all still apply on top of this process - this section changes *how* work is sequenced and reported, not the standing engineering rules.
