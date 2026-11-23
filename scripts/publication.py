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
    if data.get('version') not in (1, 2) or data.get('status') != 'passed':
        raise ValueError('Only a passed version-1 or version-2 export can be published')
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
        if data['version'] == 2:
            design_path = (path.parent / state['design']).resolve(strict=True)
            if not design_path.is_relative_to(path.parent):
                raise ValueError('Design must remain inside the export directory')
            design = json.loads(design_path.read_text())
            if (design.get('version'),design.get('converter')) not in ((1,'native-v1'),(2,'native-v2')) or design.get('viewport') != viewport:
                raise ValueError('Incompatible design capture')
            layers = design.get('layers')
            if not isinstance(layers, list) or not layers:
                raise ValueError('Design layers must be nonempty')
            parents = {}
            for layer in layers:
                key, parent = layer['key'], layer['parent']
                if not isinstance(key, str) or not key or key in parents or layer['kind'] not in ('frame', 'text', 'svg'):
                    raise ValueError('Invalid design key or kind')
                if parent is None:
                    if parents or key != '$viewport' or layer['kind'] != 'frame':
                        raise ValueError('Expected one viewport root')
                elif parents.get(parent) != 'frame':
                    raise ValueError('Invalid design parent')
                for coordinate in ('x', 'y', 'width', 'height', 'opacity'):
                    value = layer[coordinate]
                    if type(value) not in (int, float) or not math.isfinite(value):
                        raise ValueError('Invalid design geometry')
                if layer['width'] <= 0 or layer['height'] <= 0 or not 0 <= layer['opacity'] <= 1:
                    raise ValueError('Invalid design size or opacity')
                parents[key] = layer['kind']
            if (layers[0]['width'], layers[0]['height']) != (width, height):
                raise ValueError('Design root dimensions must match viewport')
            states[-1]['design'] = digest(design)
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
        source = json.loads(Path(args.manifest).read_text())
        node_map = None
        if source['version'] == 2:
            if not getattr(args, 'node_map', None):
                raise ValueError('Native publication requires a verified per-state --node-map')
            node_map = json.loads(Path(args.node_map).read_text())
            if set(node_map) != {s['id'] for s in source['states']}:
                raise ValueError('Node map must cover exactly the exported states')
            seen = set()
            render_reports = json.loads(Path(args.render_reports).read_text()) if getattr(args,'render_reports',None) else {}
            for state in source['states']:
                capture = json.loads((Path(args.manifest).resolve().parent / state['design']).read_text())
                if capture['version'] == 2:
                    if any(d.get('severity') == 'unsupported' for d in capture.get('diagnostics',[])):
                        raise ValueError('Unsupported rendering features prevent verified publication')
                    report = render_reports.get(state['id'],{})
                    if report.get('passed') is not True or report.get('referenceSHA256') != hashlib.sha256(images[state['id']]).hexdigest() or report.get('dimensions') != source['viewport'] or not report.get('regions'):
                        raise ValueError('Native-v2 publication requires a passing, current per-state --render-reports file')
                mapping = node_map[state['id']]
                if not isinstance(mapping.get('containerId'), str) or not mapping['containerId'] or mapping.get('converter') != capture['converter']:
                    raise ValueError('Invalid native container mapping')
                if set(mapping['layers']) != {n['key'] for n in capture['layers']}:
                    raise ValueError('Node map must cover exactly the captured layers')
                for layer in capture['layers']:
                    entry = mapping['layers'][layer['key']]
                    nid = entry['id']
                    if not isinstance(nid, str) or not nid or nid in seen or entry['kind'] != layer['kind'] or entry['parent'] != layer['parent']:
                        raise ValueError('Invalid or duplicate native layer mapping')
                    seen.add(nid)
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
        if node_map is not None:
            record['nodeMap'] = node_map
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
    parser.add_argument('--node-map', help='Verified renderer results keyed by state ID; required for version 2')
    parser.add_argument('--render-reports',help='compare_render.py reports keyed by state ID; required for native-v2')
    args = parser.parse_args()
    try:
        print(json.dumps(execute(args), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, TypeError, OSError, struct.error) as error:
        parser.exit(1, f'Publication state error: {error}\n')


if __name__ == '__main__':
    main()
