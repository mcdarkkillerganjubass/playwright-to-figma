import argparse
import copy
import json
from pathlib import Path
import struct
import tempfile
import unittest
import zlib

from publication import execute


def png(color, width=1, height=1, alpha=False, level=6):
    def chunk(name, content):
        return struct.pack('>I', len(content)) + name + content + struct.pack('>I', zlib.crc32(name + content))
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6 if alpha else 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(b''.join(b'\x00' + bytes(color[y*width*(4 if alpha else 3):(y+1)*width*(4 if alpha else 3)]) for y in range(height)), level)) + chunk(b'IEND', b''))


class PublicationTest(unittest.TestCase):
    def test_changed_unchanged_and_rejected_exports(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            image = root / 'state.png'
            image.write_bytes(png([255, 0, 0]))
            source = {'version': 1, 'status': 'passed', 'scenario': 'Checkout',
                      'viewport': {'width': 1, 'height': 1}, 'provenance': {'commit': 'old'},
                      'states': [{'id': 'a', 'label': 'Cart', 'image': 'state.png', 'url': 'http://localhost/cart',
                                  'scroll': {'x': 0, 'y': 0}}], 'transitions': []}
            path = root / 'recording.json'
            path.write_text(json.dumps(source))
            args = argparse.Namespace(command='inspect', manifest=str(path), layout='default', project_root=str(root),
                                      file_key='example', scope='main', scenario_id='checkout', state_dir=str(root/'state'),
                                      fingerprint=None, page_id=None, section_id=None)
            first = execute(args)
            self.assertTrue(first['changed'])
            args.command, args.fingerprint, args.page_id, args.section_id = 'record', first['fingerprint'], '1:2', '1:3'
            execute(args)
            args.command = 'inspect'
            self.assertFalse(execute(args)['changed'])
            source['provenance'] = {'commit': 'new', 'retry': 2}
            path.write_text(json.dumps(source))
            self.assertFalse(execute(args)['changed'])
            image.write_bytes(png([0, 0, 255]))
            self.assertTrue(execute(args)['changed'])
            image.write_bytes(png([255, 0, 0]))
            args.scope = 'another-branch'
            self.assertTrue(execute(args)['changed'])
            args.scope = 'main'
            args.layout = 'new-layout'
            self.assertTrue(execute(args)['changed'])
            args.layout = 'default'
            before = Path(first['statePath']).read_bytes()
            args.command, args.fingerprint = 'record', 'incorrect'
            with self.assertRaises(ValueError):
                execute(args)
            self.assertEqual(Path(first['statePath']).read_bytes(), before)
            args.command = 'inspect'
            for change in ('failed', 'outside-image', 'bad-edge', 'bad-bounds'):
                invalid = copy.deepcopy(source)
                if change == 'failed': invalid['status'] = 'failed'
                if change == 'outside-image': invalid['states'][0]['image'] = '../missing.png'
                if change == 'bad-edge': invalid['transitions'] = [{'from': 'a', 'to': 'missing', 'label': 'Go', 'trigger': None}]
                if change == 'bad-bounds': invalid['transitions'] = [{'from': 'a', 'to': 'a', 'label': 'Go', 'trigger': {'x': 2, 'y': 0, 'width': 1, 'height': 1}}]
                path.write_text(json.dumps(invalid))
                with self.assertRaises((ValueError, OSError)):
                    execute(args)


class NoiseTest(unittest.TestCase):
    def test_noise_limits_metadata_and_published_baseline(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            path = root / 'recording.json'
            source = {'version': 1, 'status': 'passed', 'scenario': 'Flow',
                      'viewport': {'width': 20, 'height': 1},
                      'states': [{'id': name, 'label': name, 'image': name+'.png',
                                  'url': 'http://localhost/app', 'scroll': {'x': 0, 'y': 0}}
                                 for name in ('a', 'b')],
                      'transitions': [{'from': 'a', 'to': 'b', 'label': 'Next',
                                       'trigger': {'x': 0, 'y': 0, 'width': 1, 'height': 1}}]}
            path.write_text(json.dumps(source))
            baseline = [100, 100, 100] * 20
            for name in ('a', 'b'): (root/(name+'.png')).write_bytes(png(baseline, width=20))
            args = argparse.Namespace(command='inspect', manifest=str(path), layout='default',
                project_root=str(root), file_key='file', scope='branch', scenario_id='flow',
                state_dir=str(root/'state'), fingerprint=None, page_id='1:1', section_id='1:2')
            first = execute(args)
            args.command, args.fingerprint = 'record', first['fingerprint']
            execute(args)
            args.command = 'inspect'
            original_state = Path(first['statePath']).read_bytes()

            def change(name, count, delta):
                pixels = baseline.copy()
                for i in range(count): pixels[i*3] += delta
                (root/(name+'.png')).write_bytes(png(pixels, width=20))

            for count, delta, changed in [(1, 1, False), (10, 1, False), (11, 1, True), (1, 2, True)]:
                with self.subTest(count=count, delta=delta):
                    change('a', count, delta)
                    self.assertEqual(execute(args)['changed'], changed)
            change('a', 6, 1)
            change('b', 5, 1)
            self.assertTrue(execute(args)['changed'], 'budget is shared by all screenshots')
            change('b', 0, 0)
            change('a', 1, 1)
            self.assertFalse(execute(args)['changed'])
            change('a', 1, 2)
            self.assertTrue(execute(args)['changed'], 'compare to publication, not last inspection')
            self.assertEqual(Path(first['statePath']).read_bytes(), original_state)
            change('a', 1, 1)
            for key in ('label', 'trigger'):
                modified = copy.deepcopy(source)
                if key == 'label': modified['transitions'][0]['label'] = 'Changed'
                else: modified['transitions'][0]['trigger']['x'] = 1
                path.write_text(json.dumps(modified))
                self.assertTrue(execute(args)['changed'], key)
            path.write_text(json.dumps(source))
            # Different compression must not count as a visual change.
            (root/'a.png').write_bytes(png(baseline, width=20, level=0))
            self.assertFalse(execute(args)['changed'])
            # Missing/corrupt caches must not silently suppress an update.
            cached = json.loads(original_state)['pixelBaselines']['a']
            cache = root/'state'/'pixels'/(cached+'.rgba.zlib')
            cached_bytes = cache.read_bytes()
            cache.unlink()
            self.assertTrue(execute(args)['changed'])
            cache.write_bytes(b'corrupt')
            with self.assertRaises(ValueError): execute(args)
            cache.write_bytes(cached_bytes)
            # Legacy records fail closed when exact bytes differ.
            Path(first['statePath']).write_text(json.dumps(first['identity'] | {
                'fingerprint': first['fingerprint'], 'pageId': '1:1', 'sectionId': '1:2'}))
            self.assertTrue(execute(args)['changed'])

    def test_alpha_change_is_not_noise(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            image = root / 'a.png'
            image.write_bytes(png([100, 100, 100, 255], alpha=True))
            path = root / 'recording.json'
            path.write_text(json.dumps({'version': 1, 'status': 'passed', 'scenario': 'Alpha',
                'viewport': {'width': 1, 'height': 1}, 'states': [{'id': 'a', 'label': 'a',
                'image': 'a.png', 'url': 'http://localhost/app', 'scroll': {'x': 0, 'y': 0}}],
                'transitions': []}))
            args = argparse.Namespace(command='inspect', manifest=str(path), layout='default',
                project_root=str(root), file_key='file', scope='branch', scenario_id='alpha',
                state_dir=str(root/'state'), fingerprint=None, page_id='1:1', section_id='1:2')
            args.fingerprint = execute(args)['fingerprint']
            args.command = 'record'
            execute(args)
            args.command = 'inspect'
            image.write_bytes(png([100, 100, 100, 254], alpha=True))
            self.assertTrue(execute(args)['changed'])

    def test_browser_png_row_filters_and_corruption(self):
        from png_pixels import decode_png
        def chunk(name, content):
            return struct.pack('>I', len(content)) + name + content + struct.pack('>I', zlib.crc32(name + content))
        rows = [
            ([10,20,30,40,50,60], [70,80,90,100,110,120]),
            ([10,20,30,30,30,30], [70,80,90,30,30,30]),
            ([10,20,30,40,50,60], [60,60,60,60,60,60]),
            ([10,20,30,35,40,45], [65,70,75,45,45,45]),
            ([10,20,30,30,30,30], [60,60,60,30,30,30]),
        ]
        expected = bytes([10,20,30,255,40,50,60,255,70,80,90,255,100,110,120,255])
        for filter_type, (a,b) in enumerate(rows):
            image = (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR',struct.pack('>IIBBBBB',2,2,8,2,0,0,0))
                + chunk(b'IDAT',zlib.compress(bytes([filter_type]+a+[filter_type]+b))) + chunk(b'IEND',b''))
            self.assertEqual(decode_png(image), (2,2,expected))
            with self.assertRaises(ValueError): decode_png(image[:-1])
            corrupt = bytearray(image)
            corrupt[20] ^= 1
            with self.assertRaises(ValueError): decode_png(corrupt)


if __name__ == '__main__':
    unittest.main()
