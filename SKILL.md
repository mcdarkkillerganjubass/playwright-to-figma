---
name: playwright-to-figma
description: Run explicitly marked Playwright scenarios and publish or refresh screenshot flow maps in Figma Design, updating only changed scenarios. Use for test-to-Figma maps and repeat publication; ordinary test runs do not imply publication.
---

# Playwright → Figma Design

Turn authored test checkpoints into editable screenshot flow maps. Use the current project's publication instructions as the destination/layout authority. This skill contains no project-specific Figma links or scenario logic.

## Resolve the task

Read the project's agent instructions and any publication document they explicitly reference. Resolve the Figma Design file, layout policy, selected tests and test command. For an explicitly supplied external instructions file, read that file instead of inventing a second configuration. Ask only for missing destination or material layout choices. Never infer a destination from an unrelated prior chat.

Default layout when the project does not override it: page per branch, with newly created branch pages inserted at the top of the Figma page list; section per stable scenario ID, horizontal screenshots inside a section, sections stacked vertically. A new Figma file requires explicit creation intent. Reuse the target file when one is supplied. Scope local state by canonical project path, target file, layout grouping and stable scenario ID.

Keep test code and assertions in the application repository. For adding export checkpoints, read [references/export.md](references/export.md); the reusable helper is [assets/flow-export.ts](assets/flow-export.ts). Installing this skill alone does not modify application tests. Respect the project's planning workflow before code changes.

## Run and compare

Before publishing, verify checkpoint quality: actions occur inside their recorded transitions, each destination has a meaningful visible assertion, and earlier screenshots remain immutable. UI actions carry the actual locator's viewport bounds; external waits use null triggers and frame-to-frame connectors. Hover checkpoints retain the pointer and assert the tooltip before capture. Never substitute dummy 1×1 trigger anchors. Inspect the PNGs for transient or duplicate states even when tests pass. Use semantic IDs or an explicit verified migration mapping when refreshing older ordinal exports.

Run only requested scenarios and check the test runner's exit status. Inspect successful exports, not arbitrary PNGs or partial results. A test failure leaves its last published map unchanged; report it as not refreshed.

Assign a stable scenario ID in the authored test or publication instructions; do not silently use a mutable display title as identity. Discover the actual branch, including detached-head ambiguity, rather than inventing it.

Use the bundled comparison helper:

```sh
python3 <skill>/scripts/publication.py inspect <recording.json> \
  --project-root <repository> --file-key <figma-file-key> \
  --scope <layout-group-or-branch> --scenario-id <stable-id>
```

It validates the manifest, image dimensions and trigger bounds. Exact fingerprints provide a fast equality check. When bytes differ but state/transition metadata is identical, compare decoded pixels to the last published baseline: at most 10 differing pixels across the whole scenario, RGB channel differences at most 1/255, and identical alpha. Larger differences, dimensions, labels, states, transitions and trigger geometry require an update. PNG compression/metadata alone does not count as a visual change. Commit SHA, retry, output directory and execution timing are excluded. Stabilize dates and fixture data in tests. Do not describe equality as proof of complete behavioral equivalence.

If unchanged, verify the recorded page and section still exist in the target Figma file, then leave the document and publication baseline untouched. Noise-only inspections must not advance the pixel baseline, preventing cumulative drift. If missing, regenerate. A changed layout must use a changed `--layout` key, even when images are identical. Read [references/publication.md](references/publication.md) before first publication, in-place refresh, or recovery.

## Publish through connected Figma tools

Use the agent's available Figma integration, loading its required skills and creating a file session where supported. The CLI compares and records local state; it does not authenticate to Figma or publish on its own. If the integration cannot create required objects, report the specific unsupported operation rather than substituting a flattened diagram.

Figma Design deliverable: one frame per screenshot, an image-filled rectangle at its native viewport dimensions, transparent child rectangles at trigger bounds, editable attached connectors and labels. Screenshot bitmaps are intentional. For null triggers connect the frames without inventing a button anchor.

Use a user-supplied or observed connector template. Cloning a pasted FigJam connector and changing endpoints was demonstrated through one connected Figma tool; standard public Plugin API support and cross-file transfer are not guaranteed. Probe capability on isolated test copies, preserving the original template. If the target file has no usable template, ask the user to paste one there. Do not promise clipboard replay.

On refresh, preserve the existing section and the IDs of existing screen frames, image layers, trigger shapes and connectors. Update image fills, geometry, connector endpoints and labels in place. As the final mutation, resize the same section to fit the complete published content: include every current and archived descendant plus a consistent padding margin, and shrink unused width/height when safe. Preserve the section's top-left position unless the project layout explicitly says otherwise. Re-check that no child, trigger, connector label or comment anchor lies outside the resized bounds. Comment pins can refer to descendant node IDs, so keeping only the outer section while recreating its children is insufficient. Never delete/recreate objects as a shortcut or recreate comment threads under another author.

Match scenarios and states by stable semantic IDs, not order, coordinates or mutable display labels. Retain an explicit ID-to-node mapping in local publication state or verify an unambiguous existing mapping. The bundled prototype uses ordinal state IDs; it does not establish identity across insertion/removal of states. For ambiguous structural changes, stop the affected update and obtain an explicit mapping or migrate the exporter to semantic IDs before changing existing objects.

Create objects only for genuinely new states or transitions. Delete generated states, transitions and trigger anchors absent from the refreshed scenario; do not archive them. Comments attached to deleted nodes may be lost. Preserve IDs and comments on retained objects. Fit the section after structural changes. Preserve unrelated content and scenarios omitted by a filtered run.

Preflight the export and load assets before applying an in-place update. Save affected node IDs and prior image hashes/properties for recovery. Check images, labels, endpoint IDs and stable node identities after updating. On partial failure inspect and recover the known objects where possible, report any partial update, and leave the published baseline unchanged. Do not claim transactional replacement: the available tools may apply mutations incrementally. Manual diagram edits to generated properties can be overwritten; comment threads and their anchored objects must be preserved.

Verify an attachment by moving/restoring a test frame when connector behavior is new or uncertain; otherwise reuse established evidence. Render the completed section for visual QA. After success record the returned fingerprint and actual object IDs:

```sh
python3 <skill>/scripts/publication.py record <recording.json> \
  --project-root <repository> --file-key <figma-file-key> \
  --scope <layout-group-or-branch> --scenario-id <stable-id> \
  --fingerprint <verified-fingerprint> --page-id <page-id> --section-id <section-id>
```

Local state defaults to `~/.codex/skill-data/playwright-to-figma/`; use `--state-dir` for another agent/environment. It stores publication identity, fingerprints, node IDs and compressed published pixel baselines, not destination rules or credentials. Legacy records use exact comparison until enriched from their verified, exactly matching published export; never adopt a new screenshot as the old baseline merely to suppress an update. The same storage must be used across runs; lost state requires explicit adoption of an existing section or creating a new section, never guessing what to delete.

Report tests passed/failed, updated/unchanged/not-refreshed scenarios and Figma links. State capability limits, especially where publication still needs the agent rather than one shell command.
