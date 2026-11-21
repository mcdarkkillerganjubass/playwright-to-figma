# Export contract and test authoring

The prototype helper uses TypeScript, Node.js and the host repository's `@playwright/test`; it adds no runtime dependency. It requires a Git checkout and fixed viewport. Copy/adapt the helper into the host test support directory when authorized, so tests do not depend on one person's absolute skill installation path. Future changes to the bundled helper do not automatically update copied helpers; migrate deliberately when the export contract changes.

```ts
const flow = new FlowExport(page, testInfo, 'Readable scenario title');
await flow.capture('Draft');
await flow.transition({
    trigger: publishButton,
    label: 'Publish',
    destination: 'Confirmation',
    action: () => publishButton.click(),
    ready: () => expect(confirmButton).toBeVisible(),
});
await flow.finish();
```

The author controls checkpoints and asserts expected destination states. Setup actions are omitted. `trigger` is optional for an explicitly authored external event. Use a stable scenario ID separately for publication identity; the current prototype manifest has a human-readable title, not an immutable ID.

Version 1 manifest: `scenario`, `status` (`recording`, `passed`, `failed`), `viewport` (`width`, `height`), `provenance`, `states` (`id`, `label`, relative `image`, sanitized `url`, `scroll`), `transitions` (`from`, `to`, `label`, `trigger`: viewport CSS bounding box or null).

Images use viewport screenshots with `scale: 'css'`; PNG size must equal viewport dimensions. The helper scrolls a trigger into view, performs trial actionability, captures source, verifies stable bounds, performs action, waits for the assertion, and captures destination. Source is recaptured before each outgoing action. Linear sequences only; concurrent calls and graph branching need additional design. Wait assertions are not replaced by arbitrary sleeps.

Results use `testInfo.outputPath`; a future Playwright run may clear them. Keep artifacts until publication completes. Query strings, URL credentials and fragments are omitted from JSON, but visible secrets may still be in screenshots. Use fictional fixture data or explicit masks before publication. Full standalone TypeScript checks require the host's Node type declarations.
