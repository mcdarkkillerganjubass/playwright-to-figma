# HTML to Figma reference research

Researched 2026-11-23. Scope: identify the supplied plugin and establish the public evidence for editable browser-to-Figma conversion. This is a source investigation, not a tested import or a reverse engineering of the plugin's implementation.

## Exact reference identity

The supplied reference is [HTML to Figma, Community ID 1595718080286284682](https://www.figma.com/community/plugin/1595718080286284682/html-to-figma). **The first-party identity bridge is Neil Studio's homepage:** its HTML to Figma entry links directly to Community ID `1595718080286284682`. This establishes Neil Studio as the product's publishing brand without relying on similarly named search results. The Community page itself failed to load in the research browser, so its current author profile, version, detailed description and permissions were not inspected. [Neil Studio homepage](https://neil.yoga/)

Official product documentation is [Neil Studio's HTML to Figma page](https://neil.yoga/plugins/html-to-figma); its text was available through the search index, although direct page fetch failed. The companion [HTML to Figma Helper listing](https://chromewebstore.google.com/detail/html-to-figma-helper/enhkpegkifdmplfjcbbmlfhagddcpgfl) names publisher **neil** and developer email `simreamtoo@gmail.com`. This supports the ecosystem connection; it does not independently establish the inaccessible Figma profile's exact display name.

## What the vendor advertises

These are **vendor-advertised capabilities, not independently verified results**:

| Area | Advertised behavior |
| --- | --- |
| Inputs | URL, local HTML file, pasted HTML with optional CSS, or a `.mopack` browser capture. |
| Output | Structured frames, editable text and images; supported colors and styles. |
| Layout | Auto Layout for compatible Flexbox and Grid layouts. |
| Capture | HTML to Figma Helper generates captures; supported h2d MoPack files can supply captured layout and styles directly. |
| Processing | Local files are read in the plugin; remote URLs/assets may use network requests and CORS proxies. Licensing also uses the network. |

Source: [official product page](https://neil.yoga/plugins/html-to-figma). The [Chrome Web Store description](https://chromewebstore.google.com/detail/html-to-figma-helper/enhkpegkifdmplfjcbbmlfhagddcpgfl) independently documents webpage export to HTML or Mopack for later Figma import. These descriptions do not document the MoPack schema or identify a public automation API.

No source repository, converter SDK, documented headless interface, public MoPack specification or supported Playwright integration was located in the first-party pages inspected or targeted searches. This is an investigation limit, not proof those resources do not exist. No plugin bundle or extension package was downloaded or analyzed; no claim about its actual DOM traversal, asset embedding, font fallback or rendering algorithm follows from this research.

## Avoiding name collisions

These are different products and must not be used as implementation evidence for Neil Studio's plugin:

| Product/source | Distinguishing evidence |
| --- | --- |
| Builder.io HTML to Figma | Its repository identifies Community ID `747985167520967365`, and says the project moved to Builder.io's extension. [Official repository](https://github.com/BuilderIO/figma-html) |
| Ervinou/YOOUMUU HTML to Figma | The author's portfolio links to ID `1582776449391753649`; describes its own TypeScript parser/converter and local execution. [Author's project page](https://www.ervinou.com/projects/html-to-figma/) |
| Jesse/html2design | Its site links to ID `1591359863857120491`, offering Pixel and Editable capture modes. [Product site](https://html2design.com/) |

The IDs above were obtained by following each product's own Community link. A matching name alone does not establish shared code or authorship.

## What official Figma APIs establish

Figma's Plugin API provides native `createFrame`, `createText`, `createRectangle`, `createVector`, image creation and node lookup methods. That makes programmatic editable construction technically available; it does not automatically convert HTML or CSS. [Plugin API reference](https://developers.figma.com/docs/plugins/api/figma/)

The document sandbox and browser UI are separate: the sandbox accesses the Figma scene while a plugin iframe accesses browser APIs, communicating through messages. **Architectural inference:** capture and conversion should exchange a serializable representation rather than assume Figma's document runtime can inspect the application's DOM directly. [How plugins run](https://developers.figma.com/docs/plugins/how-plugins-run/)

Fonts must be loaded before editing text properties that affect rendering. `loadFontAsync` only loads fonts already accessible to Figma; it does not download webfonts. Consequently, an imported editable text layer requires an explicit available-font mapping or a documented fallback, and matching browser typography cannot be assumed. [Font API documentation](https://developers.figma.com/docs/plugins/api/properties/figma-loadfontasync/)

The documented REST file endpoints retrieve file/node JSON and image representations; they do not document arbitrary scene-node creation. **Implementation conclusion:** a general native-layer importer needs a Plugin API execution path or a connector that actually exposes equivalent document writes; a REST token and exported node JSON alone are insufficient. Other REST resources can have writes, so this is specifically about arbitrary scene construction. [REST file endpoints](https://developers.figma.com/docs/rest-api/file-endpoints/), [REST introduction](https://developers.figma.com/docs/rest-api/)

## Public converters worth studying independently

1. **Builder.io historical converter:** the upstream repository is MIT-licensed but now announces migration to its extension. Its current package metadata names `@builder.io/html-to-figma`; this is evidence of packaging, not current support or compatibility. [Upstream repository](https://github.com/BuilderIO/figma-html), [package metadata](https://github.com/BuilderIO/figma-html/blob/master/package.json). An older public fork retains `lib`, `plugin`, `shared` and extension directories, and documents DOM input via `htmlToFigma(document.body)`. Its README explicitly calls conversion best effort, listing unsupported elements/CSS/media and font limitations. [Historical fork](https://github.com/lgs/html-figma)

2. **Concrete importer source:** the historical fork's `plugin/code.ts` receives layer messages, converts image byte arrays into Figma image fills, matches/loads available fonts and updates nodes. This is useful as a public protocol/importer example, not proof of Neil Studio internals or a recommendation to copy old code unchanged. [Source file](https://raw.githubusercontent.com/lgs/html-figma/master/plugin/code.ts)

3. **Independent local converter:** `rodnoycry/html-to-figma` describes rendering supplied HTML/CSS in a hidden iframe, reading computed styles/bounds into a serialized tree, then creating Figma nodes. Its documented mappings include conservative flex/grid conversion, text styles and SVG import; external images remain placeholders. It is MIT-licensed according to its repository. This is an explicit example of the capture → intermediate tree → native importer separation, with stated approximation limits. It has no established relationship to the reference plugin. [Repository and README](https://github.com/rodnoycry/html-to-figma)

None of these converters was installed or benchmarked. Before dependency reuse, pin a commit, read its actual license, inspect the relevant source, and test representative application states. The public evidence supports feasibility of the approach, not a promise of pixel parity or production readiness.

## Evidence gaps and proposed reference experiment

The reference's advertised editable output is a plausible target, but the following remain untested: typography fidelity, nested clipping/scrolling, fixed/sticky layers, pseudo-elements, SVG complexity, canvas, CSS transforms, shadow DOM/iframes, live form values, stable node identity on refresh and behavior after manual Figma edits. The vendor material does not establish support for those cases.

A useful authorized experiment would import one known page through the actual plugin, inspect whether representative text is editable, count native versus raster layers, inspect Flexbox/Grid structure, compare screenshots, and repeat after a small text/style change to check identity preservation. Capture a sample `.mopack` only through the documented Helper flow if schema investigation is needed; do not assume compatibility with another product's similarly named format.

## Project-specific feasibility and upgrade design

The recommendations below are engineering proposals based on the checked-in project, not claims about Neil Studio's implementation. No converter or live Figma import was implemented or benchmarked during this research.

### Current project evidence

| Area | Current behavior | Upgrade required |
| --- | --- | --- |
| Checkpoint capture | `assets/flow-export.ts:47–60` writes a viewport PNG plus URL and scroll. Browser access is already available. | Capture a normalized design tree and assets at the same checkpoint. |
| Identity | `capture(label, id)` and `transition({destinationId})` already accept explicit IDs; defaults remain ordinal. | Require semantic state IDs for refreshable design exports and introduce stable element keys. |
| Export validation and comparison | `scripts/publication.py:23–67` accepts only passed version-1 manifests and fingerprints screenshots plus state/edge metadata. | Add a versioned design artifact contract and validate/hash its tree, assets, capture settings, and converter version. |
| Published state | `scripts/publication.py:143–144` stores page/section IDs and pixel baselines. | Persist state and element-key → Figma-node-ID mappings with the verified publication. |
| Figma writing | `SKILL.md` specifies agent-assisted publication of an image rectangle inside each screen frame, with trigger anchors and connectors. | Add a native-layer renderer and reconciliation workflow through the connected Figma tool. |
| Refresh contract | `references/publication.md` requires retained descendant IDs and comment anchors to survive. | Update retained native nodes in place; a delete/reimport workflow cannot satisfy this contract. |

The docs' statement that the exporter does not yet provide explicit semantic state IDs is stale: the helper exposes explicit IDs today. It does not enforce their use or persist per-element Figma mappings.

### Recommended pipeline

1. Run the existing authored Playwright scenarios and destination assertions.
2. At each original checkpoint, collect visible text runs, computed style, geometry, hierarchy, clipping, stacking information, and image/SVG assets from that exact authenticated page state. Serialize only fields the renderer supports. Do not navigate to a fresh URL to recreate a modal or hover state.
3. Write `design.json`, content-addressed assets, and the existing PNG alongside the manifest. A proposed version-2 manifest references these artifacts and declares capture/converter versions. Keep version-1 screenshot mode supported.
4. Convert the intermediate design tree into native Figma frames, text, shapes, image fills, and vectors where feasible. Keep existing state frames, flow labels, trigger anchors, and connector behavior.
5. Reconcile by stable scenario, state, and element keys. Preserve IDs for retained compatible nodes, create genuinely new nodes, and remove obsolete generated nodes under the existing publication policy. A required node-type change needs explicit migration handling; it cannot always preserve that child's ID.
6. Export the Figma render and compare with the original checkpoint PNG. Record the baseline only after visual and identity verification.

[Playwright's page evaluation API](https://playwright.dev/docs/evaluating) can execute browser-side extraction and return serializable results. Browser APIs provide [resolved CSS values](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) and [viewport-relative bounds](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect). These establish access to the ingredients, not a complete rendering algorithm: text wrapping/ranges, inherited styles, pseudo-elements, transforms, paint order, scroll containers, and clipping still need deliberate handling.

[Figma's Plugin API](https://developers.figma.com/docs/plugins/) supports creating and modifying native nodes. Use the existing connected Figma executor, with capability checks for the required operations. The [public REST API](https://developers.figma.com/docs/rest-api/) does not expose a general scene-node creation endpoint, so posting arbitrary exported JSON to it is not the publishing solution.

The connected `generate_figma_design` tool discovered in this session offers live-page capture, but its contract treats that output as a layout reference and prescribes `use_figma` for final construction and updates. It was not executed and is not evidence of a portable, stable-ID converter suitable for this skill.

### Sensible initial scope

Start with one representative scenario containing a normal screen, a populated form, and a modal or tooltip. Support editable text, solid fills, borders, corner radii, basic shadows, images, and simple SVGs. Place nodes using measured geometry first. Add Auto Layout only for layouts that can be mapped confidently; browser Flexbox/Grid and Figma constraints do not have universally identical behavior.

Keep canvas/WebGL, video frames, inaccessible embedded content, and unsupported effects as clearly reported bitmap regions. Raster fallback is a feature-level escape hatch, not evidence that the whole screen was converted to editable layers. Fonts must be available in Figma and loaded before writing text; the [official API documentation](https://developers.figma.com/docs/plugins/) explicitly limits plugins to editor-accessible fonts. Track substitutions because different metrics change wrapping.

Capture and PNG generation must share a stabilized state: the existing PNG disables animations during screenshot capture, whereas an independently collected DOM can otherwise reflect a different animation time. Preserve intended hover state and coordinate space. Capture visible form values explicitly; raw HTML alone may omit current property state. Bundle required assets rather than assuming URLs will remain accessible or carry the browser's authenticated session. Apply fixture/masking policy to text, form values, URLs, and assets as well as PNGs.

### Comparison and update policy

Keep the current PNG comparator for screenshot publications. Design publications need a separate canonical fingerprint over supported node properties, content, asset hashes, converter configuration, and version. Pixel equivalence alone cannot establish design-tree equivalence: the same pixels may be represented by editable text or a flattened image. A matching screenshot must not suppress a required structural update.

Use app-provided export keys (for example dedicated stable attributes or suitable stable test IDs) where possible. DOM positions and CSS selectors are weak identity across insertions. Missing or ambiguous mappings should be reported rather than silently deleting/recreating retained layers. A developer change to the generated mockup can overwrite manual edits in Figma under the existing ownership policy; designer-owned variants should live separately.

This project is currently a portable skill with a copied TypeScript helper and Python comparison scripts, not a packaged Node service. A converter dependency would need browser bundling, distribution/versioning, license review, and deliberate migration of helpers copied into host repositories. Avoid silently adding a server or a required browser extension when Playwright already owns the live page.

### Proof-of-concept acceptance gates

- Every supported visible text string is a native editable text layer; supported shapes are native nodes. Report all raster fallback regions and font substitutions.
- The normal, populated-form, and overlay checkpoints match their original captured state; evaluate exported Figma images with a separately chosen, documented visual tolerance. The current 10-pixel browser-noise budget is not an appropriate assumed cross-renderer tolerance.
- An unchanged rerun performs no Figma writes and does not advance the baseline.
- A text/style change updates the existing node; adding a sibling does not renumber retained semantic elements.
- Section, retained state-frame, trigger-anchor, connector, and compatible element-node IDs survive an update. Verify with a real descendant-anchored comment in the trial file.
- Unsupported content and failed captures leave the last verified publication intact; partial Figma writes follow the existing inspect/recover policy.

Recommendation: proceed with a bounded native-layer proof of concept. Functional feasibility is high; visual fidelity, semantic Auto Layout, and safe repeated reconciliation need measured validation. Full design-system components and token bindings are a separate later capability, not an automatic consequence of HTML conversion. Existing PNG-only exports cannot supply the lost structure; rerun their scenarios for the new mode.
