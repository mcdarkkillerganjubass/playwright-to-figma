import unittest
from compare_render import compare,diff_png
from png_pixels import decode_png
from test_publication import png


class RenderComparisonTest(unittest.TestCase):
    def test_regions_detect_a_local_defect_even_when_the_whole_image_is_mostly_blank(self):
        baseline=[255,255,255]*100
        changed=baseline.copy();changed[0:3]=[0,0,0]
        regions=[{'name':'control','x':0,'y':0,'width':1,'height':1}]
        source,target=png(baseline,width=10,height=10),png(changed,width=10,height=10)
        self.assertTrue(compare(source,source,regions,16,0)['passed'])
        self.assertFalse(compare(source,target,regions,16,0.02)['passed'])
        self.assertEqual(decode_png(diff_png(source,target))[:2],(10,10))
        for invalid in [[],[{'name':'outside','x':10,'y':0,'width':1,'height':1}]]:
            with self.assertRaises(ValueError):compare(source,target,invalid,16,0.02)
        with self.assertRaises(ValueError):compare(source,png([255,255,255]),regions,16,0.02)
