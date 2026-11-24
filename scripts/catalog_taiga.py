"""Inventory installed Angular Taiga assets and report explicit Figma mapping gaps."""
import argparse
import json
import re
from pathlib import Path


def catalog(package_root, profile):
    root = Path(package_root)
    if not root.is_dir():
        raise ValueError('Expected node_modules/@taiga-ui directory')
    packages, components, icons, tokens = {}, {}, {}, {}
    declaration = re.compile(r'ɵɵ(Component|Directive)Declaration<\s*(\w+),\s*"([^"]+)"')
    excluded_packages = {}
    for package in sorted(root.iterdir()):
        manifest = package / 'package.json'
        if not manifest.is_file():
            continue
        meta = json.loads(manifest.read_text())
        if meta['name'].startswith('@taiga-ui/addon-'):
            excluded_packages[meta['name']] = {'version': meta['version'], 'reason': 'addon-package'}
            continue
        packages[meta['name']] = meta['version']
        for path in sorted(package.rglob('*.d.ts')):
            for declaration_kind, symbol, selector in declaration.findall(path.read_text()):
                identity = f"{meta['name']}:{symbol}"
                entry = components.setdefault(identity, {'symbol': symbol, 'declarationKinds': [], 'selectors': [], 'sources': []})
                if declaration_kind not in entry['declarationKinds']:
                    entry['declarationKinds'].append(declaration_kind)
                if selector not in entry['selectors']:
                    entry['selectors'].append(selector)
                source = path.relative_to(root).as_posix()
                if source not in entry['sources']:
                    entry['sources'].append(source)
        # Include component-local tokens, overrides and dark/mobile definitions.
        for suffix in ('*.less', '*.css', '*.mjs'):
            for path in sorted(package.rglob(suffix)):
                source = path.relative_to(root).as_posix()
                for token in set(re.findall(r'(--tui-[\w-]+)\s*:', path.read_text())):
                    tokens.setdefault(token, {'sources': []})['sources'].append(source)
        if package.name in ('icons', 'tds-icons'):
            for path in sorted((package / 'src').rglob('*.svg')):
                relative = path.relative_to(package / 'src').with_suffix('').as_posix()
                name = '@tui.' + relative.replace('/', '.')
                icons.setdefault(name, {'sources': []})['sources'].append(path.relative_to(root).as_posix())
    for name, entry in components.items():
        # Only explicit profile names and literal directive selectors establish matches.
        selectors = ','.join(entry['selectors'])
        identities = set(re.findall(r'\[([^\]=]+)\]', selectors)) | {entry['symbol']}
        if name in profile.get('components', {}):
            identities = {name}
        matches = {identity: profile.get('components', {})[identity] for identity in sorted(identities)
                   if identity in profile.get('components', {})}
        matches = {name: asset for name, asset in matches.items() if asset.get('status') != 'unresolved'}
        entry['status'] = 'mapped' if matches else 'unresolved'
        entry['figma'] = matches
    for category, entries in [('icons', icons), ('tokens', tokens)]:
        for name, entry in entries.items():
            asset = profile.get(category, {}).get(name)
            if category == 'tokens' and asset is None:
                asset = profile.get('textStyles', {}).get(name)
            if asset and asset.get('status') == 'unresolved':
                asset = None
            entry.update(status='mapped' if asset else 'unresolved', figma=asset)
    groups = {'components': components, 'icons': icons, 'tokens': tokens}
    coverage = {name: {'total': len(entries), 'mapped': sum(e['status'] == 'mapped' for e in entries.values())}
                for name, entries in groups.items()}
    return {'version': 1, 'profileId': profile['id'], 'packages': packages, 'excludedPackages': excluded_packages,
            'complete': False, 'coverage': coverage,
            'limitations': ['Installed-package inventory, not a Figma library export.',
                            'Addon packages are intentionally excluded.',
                            'The downstream profile keeps visual component declarations and mapped visual directives; unmatched directives are ignored.',
                            'Tokens include literal declarations in LESS, CSS and compiled JavaScript styles; dynamically generated names require runtime evidence.',
                            'Mapped identities do not establish complete variant/property coverage.',
                            'Full Figma source files are required to audit missing and duplicate counterparts.'],
            **{name: dict(sorted(entries.items())) for name, entries in groups.items()}}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--package-root', required=True, type=Path)
    parser.add_argument('--profile', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    result = catalog(args.package_root, json.loads(args.profile.read_text()))
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result['coverage']))
