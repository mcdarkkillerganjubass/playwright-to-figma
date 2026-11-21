"""Validate an export, compare it with published state, and record verified publication IDs."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import struct
import tempfile
from urllib.parse import urlsplit


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def fingerprint(manifest_path, layout):
    path = Path(manifest_path).resolve(strict=True)
    data = json.loads(path.read_text())
    if data.get('version') != 1 or data.get('status') != 'passed':
        raise ValueError('Only a passed version-1 export can be published')
    viewport = data['viewport']
    width, height = viewport['width'], viewport['height']
    if any(type(v) is not int or v <= 0 for v in (width, height)):
        raise ValueError('Viewport dimensions must be positive integers')
    states, ids = [], set()
    for state in data['states']:
        sid = state['id']
        if not isinstance(sid, str) or not sid or sid in ids:
            raise ValueError('State IDs must be nonempty and unique')
        ids.add(sid)
        image = (path.parent / state['image']).resolve(strict=True)
        if not image.is_relative_to(path.parent):
            raise ValueError('Image must remain inside the export directory')
        png = image.read_bytes()
        if len(png) < 33 or png[:8] != b'\x89PNG\r\n\x1a\n' or png[12:16] != b'IHDR':
            raise ValueError('Expected a PNG image')
        if struct.unpack('>II', png[16:24]) != (width, height):
            raise ValueError('PNG dimensions must match viewport CSS pixels')
        states.append({'id': sid, 'label': state['label'], 'route': urlsplit(state['url']).path,
                       'scroll': state['scroll'], 'png': hashlib.sha256(png).hexdigest()})
    if not states:
        raise ValueError('Export must contain states')
    edges = []
    for edge in data['transitions']:
        if edge['from'] not in ids or edge['to'] not in ids:
            raise ValueError('Transition refers to missing state')
        box = edge['trigger']
        if box is not None:
            values = [box[k] for k in ('x', 'y', 'width', 'height')]
            if any(type(v) not in (int, float) or not math.isfinite(v) for v in values):
                raise ValueError('Trigger geometry must be finite')
            x, y, w, h = values
            if x < 0 or y < 0 or w <= 0 or h <= 0 or x + w > width or y + h > height:
                raise ValueError('Trigger is outside the viewport')
        edges.append({k: edge[k] for k in ('from', 'to', 'label', 'trigger')})
    return digest({'layout': layout, 'scenario': data['scenario'], 'viewport': viewport,
                   'states': states, 'transitions': edges})


def execute(args):
    value = fingerprint(args.manifest, args.layout)
    identity = {'project': str(Path(args.project_root).resolve(strict=True)), 'fileKey': args.file_key,
                'scope': args.scope, 'scenarioId': args.scenario_id}
    directory = Path(args.state_dir).expanduser().resolve()
    state_path = directory / (digest(identity) + '.json')
    previous = json.loads(state_path.read_text()) if state_path.exists() else None
    result = {'identity': identity, 'fingerprint': value,
              'changed': previous is None or previous['fingerprint'] != value,
              'previous': previous, 'statePath': str(state_path)}
    if args.command == 'record':
        if not args.page_id or not args.section_id or args.fingerprint != value:
            raise ValueError('Recording requires verified page/section IDs and the current fingerprint')
        record = {**identity, 'fingerprint': value, 'pageId': args.page_id, 'sectionId': args.section_id}
        directory.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(mode='w', dir=directory, delete=False, encoding='utf-8') as stream:
            temporary = Path(stream.name)
            json.dump(record, stream, ensure_ascii=False, indent=2)
            stream.write('\n')
        try:
            temporary.replace(state_path)
        finally:
            temporary.unlink(missing_ok=True)
        result['recorded'] = record
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['inspect', 'record'])
    parser.add_argument('manifest')
    parser.add_argument('--project-root', required=True)
    parser.add_argument('--file-key', required=True)
    parser.add_argument('--scope', required=True)
    parser.add_argument('--scenario-id', required=True)
    parser.add_argument('--layout', default='branch-page/horizontal-v1')
    parser.add_argument('--state-dir', default='~/.codex/skill-data/playwright-to-figma')
    parser.add_argument('--fingerprint')
    parser.add_argument('--page-id')
    parser.add_argument('--section-id')
    args = parser.parse_args()
    try:
        print(json.dumps(execute(args), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, TypeError, OSError, struct.error) as error:
        parser.exit(1, f'Publication state error: {error}\n')


if __name__ == '__main__':
    main()
