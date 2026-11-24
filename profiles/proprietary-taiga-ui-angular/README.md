# Proprietary Taiga UI Angular package

`package.mjs` is the external entry point. It bundles a browser detector with the sibling generated mapping profile. Copy this directory and `../proprietary-taiga-ui-angular.json` together when distributing this package. The detector reads existing Taiga markup and never writes application attributes.

Usage from an external Playwright runner:

```js
import ds from './profiles/proprietary-taiga-ui-angular/package.mjs';
import {applyDesignSystemPackage} from './assets/design-system-adapter.mjs';
import {resolveDesignSystem} from './assets/design-system-mapping.mjs';

const annotated = await applyDesignSystemPackage(page, capturedDesign, ds);
const mapping = resolveDesignSystem(annotated, ds.profile);
// Pass annotated and mapping to renderDesign.
```

To use another DS, supply another version-1 package with `detect` and `profile`. `detect` must be a self-contained browser function returning semantic identities indexed by DOM source path. Core capture, resolver and renderer contain no Taiga selectors.

Initial detector coverage: explicit existing `tuiButton` attributes and icon names exposed by `tui-icon[icon]`. Unsupported markup stays native. Token inference, hidden icon names and other component detectors require additional verified rules; this package does not claim complete detection coverage.
