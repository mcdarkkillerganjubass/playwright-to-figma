# Native design capture and publication (experimental)

Use this workflow for explicitly requested editable screen contents. The skill runs Playwright and the deterministic converter through the connected Figma integration. Screenshot flow maps remain the default; no custom plugin is required.

## Capture

Copy `assets/flow-export.ts`, `assets/page-design.ts` and `assets/design-capture.ts` together into the host's test support directory. Enable `{design: true}` in the fourth FlowExport constructor argument and use semantic state IDs. Normal screenshot mode remains a version-1 manifest. Native mode writes a version-2 manifest with a relative `.design.json` reference beside each PNG.

The current design schema is `version: 2`, `converter: native-v2`. The Chromium adapter supplies measured pseudo boxes and native-control text quads through CDP; the browser function captures geometry, source paths, CSS typography, paints and embedded SVG. Actual font evidence and browser/protocol version are retained. Native-v2 requires Chromium and explicitly rejects unhandled frame documents. It captures only the rendered checkpoint, not a responsive component model.

Review the PNG, diagnostics and exported data together. Stable `data-figma-id` or `data-testid` attributes are preferred. Positional element/text/line keys remain unstable; known generated framework IDs are excluded. Do not assume arbitrary DOM IDs establish semantic identity across structural changes.

Mark important fixture/application regions with `data-figma-region="name"`. Their viewport-clipped integer rectangles are included in the design JSON's `regions` array for visual comparison. A separate JSON array of named rectangles is also accepted. Region names must be nonempty and unique. Regions should cover controls and content, not only large blank backgrounds.

## Render and refresh

Read the integration's Figma skills, then execute `renderDesign` from `assets/design-renderer.mjs` with `{builder: $fig, figma, design, containerId, previous, fontMap, fallbackFamily, verifiedKeys}`. First import requires an empty frame/section container. Supply the complete saved renderer result as `previous` for refresh. Persist maps outside this repository. Bound connector script/result sizes; transport payloads losslessly and return bounded ID lists rather than overflowing the connector with verbose fingerprint maps. Verify IDs against the document after the connector commits.

The renderer chooses available actual/declared font families first, followed by `fallbackFamily` (default Inter), and resolves the requested weight and italic style. Normal-width faces are preferred. Optional explicit `fontMap` entries are keyed by `family:weight:normal` or `family:weight:italic` with `{family,style}` values. Report substitutions. Source size, computed CSS line-height, letter spacing, alignment, decoration and transformed text are retained on the chosen family. Different glyph shapes and widths are accepted; text positioning, overlap and clipping still require visual checks. Explicit variable axes, complex shaping and writing modes are not generally supported.

`strict` defaults to true and stops before scene writes if the capture contains unsupported diagnostics. `strict: false` is for an explicitly labeled comparison preview only; it does not establish verified publication. Capture diagnostics are part of the export fingerprint. Automatic bitmap fallback is not implemented.

Compatible updates preserve retained nodes; unchanged imports make no scene writes. Narrow inset-outline cases become explicit inside strokes. SVG viewport resizing for identical xMidYMid/meet assets rescales the imported tree while retaining its IDs; changed SVG assets and unsupported aspect modes require migration. Parent/type changes, missing/moved mappings and ambiguous changed positional keys also require deliberate migration. Delete obsolete nodes only with verified keys; stop if they contain unmapped content.

The renderer operates inside one state container. Keep the surrounding scenario section, state wrappers, trigger anchors and connectors. Existing screenshot descendants need explicit migration before removal. Manual edits to generated properties can be overwritten. Comments on removed nodes can be lost. On partial failure inspect and recover before retrying; do not advance the baseline. No transactional rollback is promised.

## Visual acceptance and publication

Export the actual Figma state render at the source viewport dimensions and one-pixel CSS scale. Keep the full browser PNG outside the editable deliverable. Compare regions with explicit, calibrated tolerances:

```sh
python3 scripts/compare_render.py browser.png figma.png \
  --regions state.design.json --channel-tolerance 16 \
  --max-different-fraction 0.02 --diff difference.png
```

The numbers above illustrate configuration, not a universal acceptance threshold. The command returns JSON and exit 0 for pass, 1 for visual failure, 2 for invalid input. It records source/render hashes, dimensions and regional difference metrics. Accepted font substitutions still affect pixel comparison; inspect typography/geometry separately instead of hiding defects with a loose whole-image threshold. A render match does not prove editability, and node counts do not prove fidelity.

Use a distinct `--layout` key such as `branch-page/native-v2`. `publication.py inspect` includes the design digest, so unchanged pixels cannot hide native-tree changes. After visual and identity verification, `record` requires a complete `--node-map` keyed by state ID. Native-v2 additionally requires `--render-reports`, an object keyed by state ID containing passing `compare_render.py` results for the current browser PNGs. Unsupported capture diagnostics block recording even when a preview was rendered. The CLI cannot independently verify that supplied node IDs or render images came from Figma; the skill must verify those before recording.

## Feature coverage

| Feature | Current coverage |
| --- | --- |
| Text and forms | Editable per-line text, CSS size/line-height/weight/italic/spacing/alignment/decoration; measured single-fragment native text inputs; placeholders and password masking. Complex multi-fragment controls remain approximate. |
| Boxes | Solid fills, opacity, same-color borders, radii, simple shadows and inset outlines. |
| Pseudos and SVG | Measured Chromium pseudo boxes, simple generated text, inline SVG and URL-based monochrome SVG masks with simple size/position rules. Complex masks/repeat/compositing need further adapters. |
| Layout | Measured positions, translation transforms, scrolling and basic clipping. Nested stacking contexts and per-axis clipping are not a complete browser paint model. |
| Explicitly unsupported | Polygon clip paths, non-translation transforms, filters, background images/gradients, native appearances, shadow DOM and explicit variable axes are reported when detected. Image assets and automatic raster fallback are not yet implemented. |

`tests/fixtures/fidelity.html` covers common controls, tables, wrapped text, scrolling, overlays, SVG and unsupported effects without application-specific selectors or coordinates in the converter. Browser and renderer tests cover the observed failure patterns. Visual acceptance still requires actual Figma rendering.

Browser capture can fetch referenced SVG resources. Fixture/redaction policy applies to strings, form values, embedded assets and PNGs. Password text is masked; other visible or DOM data can still be sensitive.
