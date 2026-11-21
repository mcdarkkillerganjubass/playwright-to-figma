"""Validate an export, compare it with published state, and record verified publication IDs."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import struct
import tempfile
import zlib
from urllib.parse import urlsplit

from png_pixels import decode_png


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


MAX_NOISE_PIXELS = 10
MAX_RGB_DELTA = 1


def load_export(manifest_path, layout):
    path = Path(manifest_path).resolve(strict=True)
    data = json.loads(path.read_text())
    if data.get('version') != 1 or data.get('status') != 'passed':
        raise ValueError('Only a passed version-1 export can be published')
    viewport = data['viewport']
    width, height = viewport['width'], viewport['height']
    if any(type(v) is not int or v <= 0 for v in (width, height)):
        raise ValueError('Viewport dimensions must be positive integers')
    states, ids, images = [], set(), {}
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
        images[sid] = png
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
    payload = {'layout': layout, 'scenario': data['scenario'], 'viewport': viewport,
               'states': states, 'transitions': edges}
    metadata = {**payload, 'states': [{k: v for k, v in state.items() if k != 'png'} for state in states]}
    return digest(payload), digest(metadata), images, (width, height)


def fingerprint(manifest_path, layout):
    return load_export(manifest_path, layout)[0]


def noise_difference(images, previous, directory, dimensions):
    total = 0
    for sid, png in images.items():
        key = previous.get('pixelBaselines', {}).get(sid)
        if not isinstance(key, str) or len(key) != 64 or any(c not in '0123456789abcdef' for c in key):
            return None
        path = directory / 'pixels' / (key + '.rgba.zlib')
        if not path.is_file():
            return None
        width, height, current = decode_png(png)
        if (width, height) != dimensions:
            raise ValueError('PNG dimensions changed')
        decoder = zlib.decompressobj()
        try:
            baseline = decoder.decompress(path.read_bytes(), len(current) + 1)
        except zlib.error as error:
            raise ValueError('Invalid published pixel baseline') from error
        if len(baseline) != len(current) or not decoder.eof or decoder.unused_data or hashlib.sha256(baseline).hexdigest() != key:
            raise ValueError('Published pixel baseline is corrupt')
        if baseline == current:
            continue
        for i in range(0, len(current), 4):
            a, b = current[i:i+4], baseline[i:i+4]
            if a == b:
                continue
            if a[3] != b[3] or any(abs(a[c]-b[c]) > MAX_RGB_DELTA for c in range(3)):
                return None
            total += 1
            if total > MAX_NOISE_PIXELS:
                return None
    return total


def execute(args):
    value, metadata, images, dimensions = load_export(args.manifest, args.layout)
    identity = {'project': str(Path(args.project_root).resolve(strict=True)), 'fileKey': args.file_key,
                'scope': args.scope, 'scenarioId': args.scenario_id}
    directory = Path(args.state_dir).expanduser().resolve()
    state_path = directory / (digest(identity) + '.json')
    previous = json.loads(state_path.read_text()) if state_path.exists() else None
    result = {'identity': identity, 'fingerprint': value,
              'changed': previous is None or previous['fingerprint'] != value,
              'previous': previous, 'statePath': str(state_path)}
    if result['changed'] and previous and previous.get('metadataFingerprint') == metadata:
        difference = noise_difference(images, previous, directory, dimensions)
        if difference is not None:
            result.update(changed=False, reason='within-noise-budget', differingPixels=difference)
    if args.command == 'record':
        if not args.page_id or not args.section_id or args.fingerprint != value:
            raise ValueError('Recording requires verified page/section IDs and the current fingerprint')
        directory.mkdir(parents=True, exist_ok=True)
        pixels = directory / 'pixels'
        pixels.mkdir(exist_ok=True)
        baselines = {}
        for sid, png in images.items():
            width, height, rgba = decode_png(png)
            if (width, height) != dimensions:
                raise ValueError('PNG dimensions changed')
            key = hashlib.sha256(rgba).hexdigest()
            baselines[sid] = key
            destination = pixels / (key + '.rgba.zlib')
            if not destination.exists():
                with tempfile.NamedTemporaryFile(dir=pixels, delete=False) as stream:
                    temporary = Path(stream.name)
                    stream.write(zlib.compress(rgba))
                try:
                    temporary.replace(destination)
                finally:
                    temporary.unlink(missing_ok=True)
        record = {**identity, 'fingerprint': value, 'metadataFingerprint': metadata,
                  'pixelBaselines': baselines, 'pageId': args.page_id, 'sectionId': args.section_id}
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
