---
name: playwright-to-figma
description: Run explicitly marked Playwright scenarios and publish or refresh screenshot flow maps in Figma Design, updating only changed scenarios. Use for test-to-Figma maps and repeat publication; ordinary test runs do not imply publication.
---

# Playwright → Figma Design

Turn authored test checkpoints into editable screenshot flow maps. Use the current project's publication instructions as the destination/layout authority. This skill contains no project-specific Figma links or scenario logic.

## Resolve the task

Read the project's agent instructions and any publication document they explicitly reference. Resolve the Figma Design file, layout policy, selected tests and test command. For an explicitly supplied external instructions file, read that file instead of inventing a second configuration. Ask only for missing destination or material layout choices. Never infer a destination from an unrelated prior chat.

Default layout when the project does not override it: page per branch, section per stable scenario ID, horizontal screenshots inside a section, sections stacked vertically. A new Figma file requires explicit creation intent. Reuse the target file when one is supplied. Scope local state by canonical project path, target file, layout grouping and stable scenario ID.

Keep test code and assertions in the application repository. For adding export checkpoints, read [references/export.md](references/export.md); the reusable helper is [assets/flow-export.ts](assets/flow-export.ts). Installing this skill alone does not modify application tests. Respect the project's planning workflow before code changes.

## Run and compare

Run only requested scenarios and check the test runner's exit status. Inspect successful exports, not arbitrary PNGs or partial results. A test failure leaves its last published map unchanged; report it as not refreshed.

Assign a stable scenario ID in the authored test or publication instructions; do not silently use a mutable display title as identity. Discover the actual branch, including detached-head ambiguity, rather than inventing it.

Use the bundled comparison helper:

```sh
python3 <skill>/scripts/publication.py inspect <recording.json> \
  --project-root <repository> --file-key <figma-file-key> \
  --scope <layout-group-or-branch> --scenario-id <stable-id>
```

It validates the manifest, local images and trigger bounds, then compares exact PNG bytes plus visible state/transition metadata with the last publication fingerprint. Commit SHA, retry, output directory and execution timing do not invalidate a map. PNG metadata or dynamic content can still cause false changes: prefer stable fixture data and explicit screenshot masking in tests. Do not describe equality as proof of complete behavioral equivalence.

If unchanged, verify the recorded page and section still exist in the target Figma file, then leave the document untouched. If missing, regenerate. A changed layout must use a changed `--layout` key, even when images are identical. Read [references/publication.md](references/publication.md) before first publication, replacement, or recovery.

## Publish through connected Figma tools

Use the agent's available Figma integration, loading its required skills and creating a file session where supported. The CLI compares and records local state; it does not authenticate to Figma or publish on its own. If the integration cannot create required objects, report the specific unsupported operation rather than substituting a flattened diagram.

Figma Design deliverable: one frame per screenshot, an image-filled rectangle at its native viewport dimensions, transparent child rectangles at trigger bounds, editable attached connectors and labels. Screenshot bitmaps are intentional. For null triggers connect the frames without inventing a button anchor.

Use a user-supplied or observed connector template. Cloning a pasted FigJam connector and changing endpoints was demonstrated through one connected Figma tool; standard public Plugin API support and cross-file transfer are not guaranteed. Probe capability on isolated test copies, preserving the original template. If the target file has no usable template, ask the user to paste one there. Do not promise clipboard replay.

On refresh, create a temporary replacement, upload assets and verify image/trigger/connector counts, label text and endpoint IDs. Preserve the old section until replacement is verified. Replacement of generated section contents is allowed only when the user/project has authorized it; manual edits inside are lost. Preserve the section's location, account for changed dimensions without overlapping unrelated sections, and remove only the precisely identified old generated section. On failure leave the original and record no new baseline. Do not delete scenarios merely because a filtered run omitted them.

Verify an attachment by moving/restoring a test frame when connector behavior is new or uncertain; otherwise reuse established evidence. Render the completed section for visual QA. After success record the returned fingerprint and actual object IDs:

```sh
python3 <skill>/scripts/publication.py record <recording.json> \
  --project-root <repository> --file-key <figma-file-key> \
  --scope <layout-group-or-branch> --scenario-id <stable-id> \
  --fingerprint <verified-fingerprint> --page-id <page-id> --section-id <section-id>
```

Local state defaults to `~/.codex/skill-data/playwright-to-figma/`; use `--state-dir` for another agent/environment. It stores publication identity, fingerprint and node IDs, not destination rules or credentials. The same storage must be used across runs; lost state requires explicit adoption of an existing section or creating a new section, never guessing what to delete.

Report tests passed/failed, updated/unchanged/not-refreshed scenarios and Figma links. State capability limits, especially where publication still needs the agent rather than one shell command.
