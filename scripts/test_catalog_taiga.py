import json
import tempfile
import unittest
from pathlib import Path
from catalog_taiga import catalog


class CatalogTests(unittest.TestCase):
    def test_records_all_assets_and_does_not_invent_matches(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            package = root / 'tds-icons'
            (package / 'src/pragmatic/small').mkdir(parents=True)
            (package / 'package.json').write_text(json.dumps({'name': '@taiga-ui/tds-icons', 'version': '1'}))
            (package / 'index.d.ts').write_text('ɵɵDirectiveDeclaration<TuiButton, "button[tuiButton]", never>;\nɵɵComponentDeclaration<TuiOther, "tui-other", never>;')
            (package / 'theme.less').write_text(':root { --tui-text-primary: #000; --tui-unknown: 1; }')
            (package / 'src/pragmatic/small/plus.svg').write_text('<svg/>')
            asset = {'key': 'a' * 40}
            result = catalog(root, {'id': 'test', 'components': {'tuiButton': asset},
                                    'tokens': {'--tui-text-primary': asset}, 'icons': {}})
            self.assertEqual(result['coverage']['components'], {'total': 2, 'mapped': 1})
            self.assertEqual(result['coverage']['tokens'], {'total': 2, 'mapped': 1})
            self.assertEqual(result['icons']['@tui.pragmatic.small.plus']['status'], 'unresolved')
            self.assertFalse(result['complete'])


if __name__ == '__main__':
    unittest.main()
