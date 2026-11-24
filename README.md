# Playwright → Figma

Reusable agent skill for publishing authored Playwright scenarios as editable screenshot flow maps in regular Figma Design.

Experimental **editable screen contents** are available through the skill: opt-in Playwright DOM/style capture plus a deterministic native-layer renderer executed through the connected Figma integration. See [native design workflow](references/native-design.md). An isolated design-system mapping catalog is available; Angular semantic capture, DS-instance rendering and Auto Layout inference are not yet connected. Inspect capture warnings and compare the rendered mockup with its PNG before accepting it.

- `SKILL.md`: agent workflow, project-specific routing and in-place refresh preserving comment anchors.
- `assets/flow-export.ts`: reusable opt-in Playwright helper for application tests.
- `assets/page-design.ts`, `assets/design-capture.ts`, `assets/design-renderer.mjs`: experimental browser capture and native-layer reconciliation.
- `assets/design-system-mapping.mjs`, `profiles/`: isolated semantic mapping plans with an optional `proprietary-taiga-ui-angular` profile. See [mapping contract](references/design-system-mapping.md); host capture adapters and DS-instance rendering are not yet connected.
- `profiles/proprietary-taiga-ui-angular-summary.md`: human-readable coverage report showing mapped assets, gaps and native-render fallback behavior.
- `scripts/compare_render.py`: regional browser/Figma render comparison with explicit tolerances.
- `scripts/publication.py`: export validation and bounded pixel-noise comparison with the last verified publication.
- `references/`: export contract and publication/recovery details.

This is an agent-assisted workflow, not an unattended Figma service. Python 3.9+ is required for the comparison helper; host projects provide Node.js and Playwright. A connected Figma integration must support the necessary edits. Connector cloning in regular Design was verified with one integration; portability to other agents remains unverified.

## Install and update

Clone this repository into the skill directory supported by your agent. For Codex, the default directory is `~/.codex/skills/playwright-to-figma`. Keep a clean working copy; update with `git pull --ff-only` after reviewing upstream changes. Versioned Git tags can be used when a team needs a fixed version.

Set the target Figma file and organization rules in the application's agent instructions or a separately supplied local publication document. No project-specific destination or private data is shipped here. Publication history defaults to `~/.codex/skill-data/playwright-to-figma/`; this is local state, not another configuration source.

Run the comparison self-check:

```sh
python3 -m unittest discover -s scripts -p 'test_*.py'
```

For development of native capture/import, install dev dependencies with `npm install`, install a Playwright Chromium browser with `npx playwright install chromium`, then run `npm test` and `npm run typecheck`. The host application continues to supply its own Playwright installation; these dev dependencies are for this repository's checks.

The comparison uses exact metadata and a small pixel-noise budget: at most 10 differing pixels across the scenario, RGB delta at most 1/255 and identical alpha. It compares with the last publication without advancing the baseline on skipped runs; it does not prove complete semantic behavior. Stabilize dynamic content in tests. A normal test run alone does not publish anything; invoke the skill through an agent with access to the project and the intended Figma file.

Refresh policy: preserve retained section and descendant node IDs; replace image fills in place. Delete obsolete states, connectors and trigger anchors instead of archiving them; comments on deleted nodes may be lost. Structural refreshes need stable semantic state IDs or an explicitly verified mapping.
