import argparse
import copy
import json
from pathlib import Path
import tempfile
import unittest

from publication import execute
from test_publication import png
from compare_render import compare


class NativePublicationTest(unittest.TestCase):
    def test_v2_requires_current_passing_render_report_and_supported_features(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            image = png([255,255,255])
            (root/'state.png').write_bytes(image)
            viewport = {'width': 1, 'height': 1}
            layer = {'key': '$viewport', 'parent': None, 'kind': 'frame', 'name': 'Viewport',
                     'x': 0, 'y': 0, 'width': 1, 'height': 1, 'opacity': 1, 'fills': []}
            design = {'version': 2, 'converter': 'native-v2', 'viewport': viewport, 'layers': [layer]}
            manifest = {'version': 2, 'status': 'passed', 'scenario': 'Draft', 'viewport': viewport,
                        'states': [{'id': 'draft', 'label': 'Draft', 'image': 'state.png',
                                    'design': 'state.design.json', 'url': 'http://localhost/app',
                                    'scroll': {'x': 0, 'y': 0}}], 'transitions': []}
            (root/'recording.json').write_text(json.dumps(manifest))
            (root/'state.design.json').write_text(json.dumps(design))
            mapping = {'draft': {'containerId': '1:3', 'converter': 'native-v2',
                       'layers': {'$viewport': {'id': '1:4', 'parent': None, 'kind': 'frame'}}}}
            (root/'nodes.json').write_text(json.dumps(mapping))
            args = argparse.Namespace(command='inspect', manifest=str(root/'recording.json'), layout='native-v2',
                project_root=str(root), file_key='file', scope='main', scenario_id='draft',
                state_dir=str(root/'publication'), fingerprint=None, page_id='1:1', section_id='1:2',
                node_map=str(root/'nodes.json'), render_reports=None)
            args.fingerprint = execute(args)['fingerprint']
            args.command = 'record'
            with self.assertRaisesRegex(ValueError, 'render-reports'): execute(args)
            regions = [{'name': 'viewport', 'x': 0, 'y': 0, 'width': 1, 'height': 1}]
            report = compare(image, image, regions, 16, 0.02)
            args.render_reports = str(root/'reports.json')
            for invalid in [dict(report, passed=False), dict(report, referenceSHA256='stale'), dict(report, regions=[])]:
                (root/'reports.json').write_text(json.dumps({'draft': invalid}))
                with self.assertRaisesRegex(ValueError, 'render-reports'): execute(args)
            (root/'reports.json').write_text(json.dumps({'draft': report}))
            self.assertEqual(execute(args)['recorded']['nodeMap'], mapping)
            design['diagnostics'] = [{'severity': 'unsupported', 'message': 'clip-path'}]
            (root/'state.design.json').write_text(json.dumps(design))
            args.command = 'inspect'
            args.fingerprint = execute(args)['fingerprint']
            args.command = 'record'
            with self.assertRaisesRegex(ValueError, 'Unsupported'): execute(args)

    def test_design_changes_invalidate_identical_pixels_and_record_requires_full_node_mapping(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)/'export'
            root.mkdir()
            (root/'state.png').write_bytes(png([255,255,255]))
            manifest = {'version': 2, 'status': 'passed', 'scenario': 'Draft', 'viewport': {'width': 1, 'height': 1},
                'states': [{'id': 'draft', 'label': 'Draft', 'image': 'state.png', 'design': 'state.design.json',
                            'url': 'http://localhost/app', 'scroll': {'x': 0, 'y': 0}}], 'transitions': []}
            layer = {'key': '$viewport', 'parent': None, 'kind': 'frame', 'name': 'Viewport',
                     'x': 0, 'y': 0, 'width': 1, 'height': 1, 'opacity': 1, 'fills': []}
            design = {'version': 1, 'converter': 'native-v1', 'viewport': manifest['viewport'], 'layers': [layer]}
            path = root/'recording.json'
            path.write_text(json.dumps(manifest))
            design_path = root/'state.design.json'
            design_path.write_text(json.dumps(design))
            args = argparse.Namespace(command='inspect', manifest=str(path), layout='native-v1', project_root=str(root),
                file_key='file', scope='main', scenario_id='draft', state_dir=str(root/'publication'),
                fingerprint=None, page_id='1:1', section_id='1:2', node_map=None)
            first = execute(args)
            args.command, args.fingerprint = 'record', first['fingerprint']
            with self.assertRaisesRegex(ValueError, 'node-map'): execute(args)
            mapping = {'draft': {'containerId': '1:3', 'converter': 'native-v1',
                                'layers': {'$viewport': {'id': '1:4', 'parent': None, 'kind': 'frame'}}}}
            map_path = root/'nodes.json'
            map_path.write_text(json.dumps(mapping))
            args.node_map = str(map_path)
            self.assertEqual(execute(args)['recorded']['nodeMap'], mapping)
            args.command = 'inspect'
            self.assertFalse(execute(args)['changed'])
            changed = copy.deepcopy(design)
            changed['layers'][0]['name'] = 'Editable viewport'
            design_path.write_text(json.dumps(changed))
            self.assertTrue(execute(args)['changed'], 'identical PNGs must not hide design changes')
            for invalid in [dict(design, converter='unsupported'), dict(design, layers=[]),
                            dict(design, layers=[dict(layer, parent='missing')])]:
                design_path.write_text(json.dumps(invalid))
                with self.assertRaises(ValueError): execute(args)
            design_path.write_text(json.dumps(design))
            manifest['states'][0]['design'] = '../outside.json'
            (root.parent/'outside.json').write_text(json.dumps(design))
            try:
                path.write_text(json.dumps(manifest))
                with self.assertRaisesRegex(ValueError, 'inside'): execute(args)
            finally: (root.parent/'outside.json').unlink()


if __name__ == '__main__':
    unittest.main()
