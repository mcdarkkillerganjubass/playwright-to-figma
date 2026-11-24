import unittest
from build_taiga_profile import build, icon_identity


class ProfileBuildTests(unittest.TestCase):
    def test_exact_conventions_duplicates_and_missing_assets(self):
        source = {'packages': {'@taiga-ui/core': '4'}, 'components': {
            '@taiga-ui/core:TuiButton': {'symbol': 'TuiButton', 'selectors': ['button[tuiButton],button[tuiIconButton]']}},
            'icons': {'@tui.pragmatic.small.plus': {}}, 'tokens': {'--tui-text-primary': {}, '--tui-missing': {}}}
        seed = {'id': 'test', 'version': 1, 'components': {}, 'icons': {}, 'tokens': {}, 'textStyles': {}}
        export = {'fileKey': 'file', 'library': 'TUI', 'components': [
            {'id': '1:1', 'name': 'tui-button', 'type': 'COMPONENT_SET', 'key': 'a' * 40},
            {'id': '1:2', 'name': 'tui-ic-small-pragmatic / plus', 'type': 'COMPONENT', 'key': 'b' * 40}],
            'variables': [{'id': 'v1', 'name': 'Text/Primary', 'type': 'COLOR', 'key': 'c' * 40}]}
        profile, assets = build(source, seed, [export])
        self.assertEqual(profile['components']['tuiIconButton']['key'], 'a' * 40)
        self.assertEqual(profile['icons']['@tui.pragmatic.small.plus']['key'], 'b' * 40)
        self.assertEqual(profile['tokens']['--tui-missing']['status'], 'unresolved')
        self.assertEqual(len(assets), 3)
        export['variables'].append({'id': 'v2', 'name': 'Text/Primary', 'type': 'COLOR', 'key': 'd' * 40})
        profile, _ = build(source, seed, [export])
        self.assertEqual(profile['tokens']['--tui-text-primary']['reason'], 'ambiguous')
        self.assertEqual(len(profile['tokens']['--tui-text-primary']['candidates']), 2)

    def test_icon_families_are_not_interchangeable(self):
        self.assertEqual(icon_identity('tui-ic-medium / eye'), '@tui.fancy.medium.eye')
        self.assertEqual(icon_identity('tui-ic-small-pragmatic / eye'), '@tui.pragmatic.small.eye')
        self.assertIsNone(icon_identity('random eye'))

    def test_inspected_override_can_target_another_library_name_and_helpers_do_not_override_buttons(self):
        source = {'packages': {}, 'components': {
            'core:TuiButton': {'symbol': 'TuiButton', 'selectors': ['button[tuiButton]']},
            'kit:TuiButtonLoading': {'symbol': 'TuiButtonLoading', 'selectors': ['[tuiButton][loading]']}},
            'icons': {}, 'tokens': {}}
        seed = {'id': 'custom', 'version': 1, 'components': {
            'tuiButton': {'type': 'component_set', 'key': 'a' * 40}}, 'icons': {}, 'tokens': {}, 'textStyles': {}}
        export = {'fileKey': 'custom-file', 'library': 'Custom', 'components': [
            {'id': '1:1', 'name': 'Custom Action', 'type': 'COMPONENT_SET', 'key': 'a' * 40}]}
        result, _ = build(source, seed, [export])
        self.assertEqual(result['components']['tuiButton']['key'], 'a' * 40)
        self.assertEqual(result['components']['tuiButton']['figmaName'], 'Custom Action')
        self.assertEqual(result['components']['kit:TuiButtonLoading']['status'], 'unresolved')


if __name__ == '__main__':
    unittest.main()
