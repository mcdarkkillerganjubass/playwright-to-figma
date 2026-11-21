import argparse
import copy
import json
from pathlib import Path
import struct
import tempfile
import unittest
import zlib

from publication import execute


def png(color):
    def chunk(name, content):
        return struct.pack('>I', len(content)) + name + content + struct.pack('>I', zlib.crc32(name + content))
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', 1, 1, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(b'\x00' + bytes(color))) + chunk(b'IEND', b''))


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


if __name__ == '__main__':
    unittest.main()
