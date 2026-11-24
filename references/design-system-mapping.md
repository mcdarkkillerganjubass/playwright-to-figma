# Isolated design-system mapping

## Complete-catalog requirement

The target is coverage of every component, icon and token in the selected installed Taiga UI versions, with all identified Figma counterparts and explicit gaps. The generated profile includes all inventoried identities, but resolved/verified coverage remains partial; it must not be advertised as a completely verified mapping.

Generate the versioned source inventory and coverage report independently of the resolver:

```sh
python3 scripts/catalog_taiga.py \
  --package-root /path/to/application/node_modules/@taiga-ui \
  --profile profiles/proprietary-taiga-ui-angular.json \
  --output profiles/proprietary-taiga-ui-angular.catalog.json
```

The catalog records installed package versions, Angular component/directive selectors, SVG icon identities and literal CSS token declarations, including source locations. Every entry is `mapped` or `unresolved`; a mapped identity does not prove variant coverage. Internal Angular directives can have no visual Figma equivalent. Dynamically generated CSS token names are not covered by literal declaration scanning. The catalog therefore explicitly keeps `complete: false` until compiled-style coverage, full Figma library exports, duplicates, property translations and intentional nonvisual exceptions are audited.

A subscribed-library search is insufficient to prove an exhaustive Figma inventory. The user-selected scope is exactly TUI Desktop (`Uk889X4h9hvbPD0J75fTaw`), TUI Assets (`R1oI4T6X9CHxl2x55MDypT`) and TUI Foundations (`gGt4PaQxQhX7ozPVImsgL5`). Other libraries are excluded. Source snapshots in `profiles/figma/` preserve all inspected components, variants, variables and styles, including legacy/draft pages; the name-convention join must not silently choose between duplicates. Do not fill missing keys with guessed names or create copies of the design system to conceal gaps.

`assets/design-system-mapping.mjs` is a pure resolver. The caller supplies a profile; the resolver has no default library, file path, network access or Figma dependency. `profiles/proprietary-taiga-ui-angular.json` is the optional generated TUI catalog profile. It contains no Nitro-local components. Library names are informational; asset keys identify the actual targets.

## Usage

```js
import {readFile} from 'node:fs/promises';
import {resolveDesignSystem} from './assets/design-system-mapping.mjs';

const profile = JSON.parse(await readFile(profilePath, 'utf8'));
const mapping = resolveDesignSystem(design, profile);
```

To use another Figma library, copy the JSON, change its `id`, keys and property translations, and pass the new path. There is no implicit merge with the shipped profile: the supplied file completely controls mapping. To compose profiles, merge their categories explicitly in the caller before resolving.

## Host adapter contract

The host adapter must enrich captured layers with semantic identities, for example:

```js
layer.semantic = {
    component: 'tuiButton',
    props: {size: 's', appearance: 'primary'},
    icon: '@tui.pragmatic.small.plus',
    textStyle: '--tui-typography-body-m',
    tokens: {fills: '--tui-text-primary'}
};
```

The browser capture now supports this opt-in metadata directly through `data-figma-*` or `data-tui-*` attributes. Use `data-figma-component`, `data-figma-prop-*`, `data-figma-icon`, `data-figma-text-style` and `data-figma-token-*`. The capture never guesses a DS identity from CSS appearance; without these attributes, the layer remains native-only.

These identities are not inferred by the generic DOM capture today. An Angular adapter must read runtime attributes, icon references and source token evidence. Angular directive names and template bindings are not guaranteed to survive in rendered DOM; computed RGB values do not retain CSS token identity. Do not guess identities from similar appearance.

`props` contains Figma-facing component properties only, translated using the profile's `properties` rules. A rule has a target `name` and optional exact `values` translations. Properties without a `values` table pass their value through (useful for verified text/boolean property names). `props` on a profile component supplies explicit defaults. Unknown properties or values produce warnings and prevent that component from resolving; missing assets also produce warnings. In particular, `action-grayscale` is intentionally not aliased to `flat-grayscale` without verification.

## Output and rendering boundary

The returned object contains `profileId`, a map indexed by captured layer key, and structured `warnings`. Each resolved asset retains its type and Figma key. Neither input is mutated. Unannotated layers remain unmapped and can use native rendering.

Every annotated layer explicitly declares `fallback: 'native'`. Missing/ambiguous component or icon mappings must use the existing DOM-measured native rendering, without an instance binding. Missing token/style mappings retain captured literal values. An unavailable library asset must also fall back to native rendering. A mapping gap is a warning, not a screen-wide failure. Do not bind the nearest asset, delete the content, or replace the UI with a screenshot. An unknown component property makes that component unresolved as a whole, so its captured descendants must remain available for native rendering. This fallback policy does not override pre-existing errors for invalid captures or unsupported browser features.

This is a mapping-plan module, not a Figma publisher. The renderer accepts this output as `mapping`: when a layer has a resolved component and the builder exposes `instance`, it creates the Figma instance, applies mapped properties, and suppresses mapped descendants. If the builder cannot create instances, the layer stays native and the result records a fallback warning. Token and text-style bindings are attempted through `builder.getVar` and `builder.getStyle`; supported fill, stroke, radius and opacity bindings replace literal properties, while unsupported or unavailable bindings preserve native values and emit warnings.

## Rebuild and override

`proprietary-taiga-ui-angular.json` is generated. Edit `proprietary-taiga-ui-angular.overrides.json` for inspected mappings and property translations, then rebuild:

```sh
python3 scripts/build_taiga_profile.py \
  --source profiles/proprietary-taiga-ui-angular.catalog.json \
  --seed profiles/proprietary-taiga-ui-angular.overrides.json \
  --figma profiles/figma/*.json \
  --output profiles/proprietary-taiga-ui-angular.json
```

The profile contains every inventoried code component (including qualified identities and aliases), icon and literal CSS token. Unresolved entries are explicit, not omitted. `coverage` counts lookup identities; `sourceCoverage` counts source components once. `evidence: exact-name-convention` is a deterministic candidate association, not visual verification. `evidence: inspected` identifies the small set checked against the reference design. Missing exact names do not prove a visual counterpart does not exist under another name. Multiple exact candidates remain ambiguous unless an inspected override selects one.

Component variants remain in the Figma snapshots. Their observed variant options generate exact property rules and size translations only when the corresponding target size exists. Text/boolean/instance-swap component properties still require inspection before rendering. Hidden/unpublished library assets can have keys in a source file; availability for cross-file import must be checked by the eventual DS renderer. Color-mode values and alias graphs are not exported by this key catalog. Font aliases are represented by text styles rather than a guessed replacement family.

## Execution model

Playwright, catalog generation, mapping resolution and `renderDesign` are deterministic code. Playwright and the local catalog scripts run without an AI agent. Today `renderDesign` receives the Figma API and builder from the agent-invoked `use_figma` integration; it is not a standalone authenticated Figma client. There is no autonomous end-to-end publisher in this repository. To make AI involvement optional after launch, add a non-AI executor (for example, a Figma plugin) with the required rendering operations and artifact transport. Keep the renderer and replaceable mapping profiles independent of that executor.
