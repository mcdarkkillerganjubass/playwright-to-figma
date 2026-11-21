# Publication rules and recovery

Project instructions own destination and grouping. A minimal block may specify a Figma Design URL and overrides such as “pages by product area, sections by scenario; branch in section details.” No Figma URL, private repository identity or local publication history belongs in the shared skill repository.

Comparison identity includes canonical project root, Figma file key, grouping scope and stable scenario ID. The `--layout` key defaults to `branch-page/horizontal-v1`; set a different stable key when the project's layout differs or its generation policy changes. Pass identical arguments to inspect and record. Layout and target changes invalidate comparison intentionally. Never save tokens in the state directory.

First publication: inspect successful export, resolve/create the intended page, create section, upload screenshots, create anchors and connector copies, verify, then record the baseline. The script returns `changed: true` when no baseline exists.

Unchanged: check the actual mapped page/section still exist. If present, do not re-upload images or write to Figma. If absent, regenerate and update IDs. The fingerprint does not check manual edits made in Figma; generated content is owned by the publisher under the project's replacement policy.

Changed: build a staging section without disturbing the old one, validate it, place it at the prior section's position, then delete the old generated section and record new IDs. Old comments/manual edits may be lost; the replacement policy must already permit this. Preserve unrelated sections and content. A fixed vertical gap may require shifting only managed following sections when height changes; never silently rearrange manual content.

A tool call may partially mutate the file before failing. Inspect the affected objects before retrying. Prefer completing/removing the known staging section over creating duplicates. If old-section removal or baseline recording fails, report the exact remaining objects and keep a recovery note; never claim a completed refresh while the baseline is stale. Serial publication is the supported mode; coordinate another publisher instead of racing it.

The script compares exact PNG bytes with SHA-256, not decoded pixels or semantic behavior. It includes state labels, sanitized route paths, scroll positions, edge labels and trigger bounds. It excludes provenance and volatile output paths. Dynamic UI and PNG encoding differences can invalidate comparisons; make capture deterministic first. No visual-tolerance slider or “AI detects behavior changes” guarantee is included.

Codex discovery normally uses a skill folder containing SKILL.md. Other agents may need a different installation location or wrapper. Python comparison and TypeScript export are portable; Figma connector capabilities must be checked for each integration. A Git repository distributes versions; it does not force updates on colleagues.
