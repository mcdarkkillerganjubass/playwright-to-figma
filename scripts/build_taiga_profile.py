"""Join a source catalog with exported Figma assets; retain ambiguous/missing identities."""
import argparse
import json
import re
from pathlib import Path


def kebab(value):
    value = re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', value)
    return re.sub(r'[^a-z0-9-]+', '-', value.lower()).strip('-')


def icon_identity(name):
    match = re.fullmatch(r'tui-ic-(small|medium)(-pragmatic)?\s*/\s*(.+)', name.strip())
    if match:
        size, pragmatic, icon = match.groups()
        return f"@tui.{'pragmatic' if pragmatic else 'fancy'}.{size}.{icon}"
    for prefix, namespace in [('tui-ic-fixed-color', 'fixed.color'), ('tui-ic-service', 'service'),
                              ('tui-emoji', 'emoji'), ('tui-logo', 'logo'),
                              ('tui-logo-square', 'logo.square'), ('tui-logo-siteheader', 'logo.siteheader'),
                              ('tui-flags', 'flags')]:
        match = re.fullmatch(re.escape(prefix) + r'\s*/\s*(.+)', name.strip())
        if match:
            return '@tui.' + namespace + '.' + (match[1].lower() if namespace == 'flags' else match[1])
    match = re.fullmatch(r'tui-illustrations-([\w-]+)\s*/\s*(Light|Dark)\s*/\s*(.+)', name.strip())
    if match:
        group, theme, icon = match.groups()
        return f'@tui.illustrations.{group}.{icon}-{theme.lower()}'
    return None


def build(source, seed, exports):
    output = {**seed, 'description': 'Versioned Angular proprietary Taiga UI catalog with explicit mapping gaps.',
              'sourcePackages': source['packages'], 'complete': False,
              'figmaScope': sorted({e['fileKey'] for e in exports}),
              **{category: {} for category in ('components', 'icons', 'tokens', 'textStyles')}}
    index = {category: {} for category in ('components', 'icons', 'tokens', 'textStyles')}
    all_assets = []
    variant_options = {}
    for export in exports:
        for row in export.get('components', []):
            for name, value in row.get('variantProperties', {}).items():
                variant_options.setdefault((export['fileKey'], row['parentId']), {}).setdefault(name, set()).add(value)
    for export in exports:
        for field in ('components', 'variables', 'styles'):
            for row in export.get(field, []):
                asset = {**row, 'fileKey': export['fileKey'], 'library': export['library']}
                all_assets.append(asset)
                if field == 'components':
                    # Variants remain in the exported catalog; component-set roots are mapping targets.
                    if row.get('parentType') == 'COMPONENT_SET':
                        continue
                    identity = icon_identity(row['name'])
                    category = 'icons' if identity else 'components'
                    identity = identity or row['name'].strip()
                elif field == 'variables':
                    category = 'tokens'
                    syntax = row.get('codeSyntax', {}).get('WEB', '')
                    match = re.fullmatch(r'var\((--tui-[\w-]+)\)', syntax.strip())
                    identity = match[1] if match else '--tui-' + '-'.join(kebab(x) for x in row['name'].split('/'))
                else:
                    if row.get('type') in ('PAINT', 'EFFECT'):
                        category = 'tokens'
                        identity = '--tui-' + '-'.join(kebab(x) for x in row['name'].split('/'))
                        index[category].setdefault(identity, []).append(asset)
                        continue
                    if row.get('type') != 'TEXT':
                        continue
                    category = 'textStyles'
                    name = re.sub(r'^Desktop/', '', row['name'])
                    name = re.sub(r'^Heading (\d+)$', r'Heading H\1', name)
                    identity = '--tui-typography-' + kebab(name)
                index[category].setdefault(identity, []).append(asset)

    def resolve(category, identity, figma_name=None):
        known = seed.get(category, {}).get(identity)
        candidates = index[category].get(figma_name or identity, [])
        # Prefer an explicitly inspected mapping when it still exists in these source exports.
        chosen = next((c for c in all_assets if known and c['key'] == known.get('key')), None)
        if chosen is None and len(candidates) == 1:
            chosen = candidates[0]
        if chosen is None:
            return {'status': 'unresolved', 'reason': 'ambiguous' if candidates else 'no-exact-match',
                    'candidates': [{'key': c['key'], 'fileKey': c['fileKey'], 'name': c['name']} for c in candidates]}
        kind = {'COMPONENT_SET': 'component_set', 'COMPONENT': 'component', 'TEXT': 'text_style',
                'PAINT': 'paint_style', 'EFFECT': 'effect_style'}.get(chosen['type'], 'variable')
        entry = {'type': kind, 'key': chosen['key'], 'library': chosen['library'], 'fileKey': chosen['fileKey'],
                 'nodeId': chosen['id'], 'figmaName': chosen['name'],
                 'evidence': 'inspected' if known and known.get('key') == chosen['key'] else 'exact-name-convention'}
        options = variant_options.get((chosen['fileKey'], chosen['id']), {})
        if options:
            entry['variantOptions'] = {name: sorted(values) for name, values in sorted(options.items())}
            rules = {}
            for name, values in options.items():
                translations = {value: value for value in sorted(values)}
                if name == 'size':
                    translations.update({code: figma for code, figma in
                                         {'xs': 'extraSmall', 's': 'small', 'm': 'medium', 'l': 'large', 'xl': 'extraLarge'}.items()
                                         if figma in values})
                rules[name] = {'name': name, 'values': translations}
            entry['properties'] = rules
        if known and known.get('key') == chosen['key']:
            for field in ('properties', 'props'):
                if field in known:
                    entry[field] = {**entry.get(field, {}), **known[field]}
        return entry

    visual_source_ids = []
    excluded_source_components = {}
    for identity, entry in source['components'].items():
        symbol = entry['symbol']
        figma_name = kebab(re.sub(r'(?:Component|Directive)$', '', symbol))
        direct_target = resolve('components', identity, figma_name)
        selectors = ','.join(entry['selectors'])
        declaration_kinds = entry.get('declarationKinds', ['Component'])
        component_on_visible_host = ('Component' in declaration_kinds and
                                     not all(part.strip().startswith(('ng-template', 'ng-container'))
                                             for part in selectors.split(',')))
        mapped_visual_directive = 'Directive' in declaration_kinds and direct_target.get('status') != 'unresolved'
        if not component_on_visible_host and not mapped_visual_directive:
            excluded_source_components[identity] = {'reason': 'nonvisual-or-unmapped-directive',
                                                     'symbol': symbol, 'selectors': entry['selectors']}
            continue
        visual_source_ids.append(identity)
        aliases = {identity, symbol}
        for selectors in entry['selectors']:
            # Compound selectors mention base directives too; a loading helper must
            # not overwrite the mapping of the button it decorates.
            names = re.findall(r'\[([\w-]+)\]', selectors) + re.findall(r'(?:^|,)\s*(tui-[\w-]+)', selectors)
            aliases.update(name for name in names if kebab(name) == figma_name)
            if figma_name == 'tui-button' and 'tuiIconButton' in names:
                aliases.add('tuiIconButton')
        for alias in sorted(aliases):
            target = 'tui-button' if alias == 'tuiIconButton' else figma_name
            output['components'][alias] = resolve('components', alias, target)
    for category in ('icons', 'tokens'):
        for identity in source[category]:
            if category == 'tokens' and identity.startswith('--tui-typography-'):
                output['textStyles'][identity] = resolve('textStyles', identity)
            else:
                output[category][identity] = resolve(category, identity)
    # Keep inspected mappings even if the package scanner cannot observe a generated token.
    for category in index:
        for identity in seed.get(category, {}):
            output[category].setdefault(identity, resolve(category, identity, 'tui-button' if identity == 'tuiButton' else None))
        output[category] = dict(sorted(output[category].items()))
    output['coverage'] = {category: {'total': len(entries), 'mapped': sum(e.get('status') != 'unresolved' for e in entries.values())}
                          for category, entries in ((k, output[k]) for k in index)}
    output['visualSourceComponentIds'] = visual_source_ids
    output['excludedSourceComponents'] = excluded_source_components
    output['sourceCoverage'] = {'components': {'total': len(visual_source_ids),
        'mapped': sum(output['components'][identity].get('status') != 'unresolved' for identity in visual_source_ids)},
        'icons': output['coverage']['icons'],
        'tokensIncludingTypography': {'total': len(source['tokens']),
            'mapped': sum(output['tokens'].get(identity, output['textStyles'].get(identity, {})).get('key') is not None
                          for identity in source['tokens'])}}
    return output, all_assets


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--seed', required=True, type=Path)
    parser.add_argument('--figma', required=True, nargs='+', type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    result, _ = build(json.loads(args.source.read_text()), json.loads(args.seed.read_text()),
                      [json.loads(p.read_text()) for p in args.figma])
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result['coverage']))
