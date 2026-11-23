"""Compare aligned browser/Figma PNGs in explicitly selected UI regions."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import struct
import zlib

from png_pixels import decode_png


def compare(reference, actual, regions, channel_tolerance, max_fraction):
    if type(channel_tolerance) is not int or not 0 <= channel_tolerance <= 255:
        raise ValueError('Channel tolerance must be an integer from 0 to 255')
    if not isinstance(max_fraction, (int, float)) or not math.isfinite(max_fraction) or not 0 <= max_fraction <= 1:
        raise ValueError('Difference fraction must be from 0 to 1')
    width, height, source = decode_png(reference)
    aw, ah, target = decode_png(actual)
    if (width, height) != (aw, ah):
        raise ValueError('Images must have identical dimensions and CSS-pixel scale')
    if isinstance(regions,dict):regions=regions.get('regions')
    if not isinstance(regions, list) or not regions:
        raise ValueError('At least one explicit UI region is required')
    results, names = [], set()
    for region in regions:
        name = region['name']
        x, y, w, h = [region[k] for k in ('x','y','width','height')]
        if not isinstance(name, str) or not name or name in names:
            raise ValueError('Region names must be nonempty and unique')
        names.add(name)
        if any(type(v) is not int for v in (x,y,w,h)) or x < 0 or y < 0 or w <= 0 or h <= 0 or x+w > width or y+h > height:
            raise ValueError('Region must be a positive integer rectangle inside the image')
        bad, total = 0, 0
        for yy in range(y,y+h):
            for xx in range(x,x+w):
                i = (yy*width+xx)*4
                delta = [abs(source[i+c]-target[i+c]) for c in range(4)]
                bad += max(delta) > channel_tolerance
                total += sum(delta[:3])
        fraction = bad/(w*h)
        results.append({'name':name, 'differentPixels':bad, 'differentFraction':fraction,
                        'meanAbsoluteRGBDelta':total/(w*h*3), 'passed':fraction <= max_fraction})
    return {'passed':all(r['passed'] for r in results), 'dimensions':{'width':width,'height':height},
            'referenceSHA256':hashlib.sha256(reference).hexdigest(), 'actualSHA256':hashlib.sha256(actual).hexdigest(),
            'channelTolerance':channel_tolerance, 'maxDifferentFraction':max_fraction, 'regions':results}


def diff_png(reference, actual):
    width, height, source = decode_png(reference)
    aw, ah, target = decode_png(actual)
    if (width,height) != (aw,ah): raise ValueError('Image dimensions differ')
    pixels = bytearray()
    for i in range(0,len(source),4):
        delta = max(abs(source[i+c]-target[i+c]) for c in range(4))
        pixels.extend((delta,0,0,255))
    def chunk(kind,data):
        return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data))
    rows = b''.join(b'\0'+pixels[y*width*4:(y+1)*width*4] for y in range(height))
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',width,height,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(rows))+chunk(b'IEND',b'')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('reference');parser.add_argument('actual')
    parser.add_argument('--regions',required=True,help='JSON array of named x/y/width/height rectangles')
    parser.add_argument('--channel-tolerance',required=True,type=int)
    parser.add_argument('--max-different-fraction',required=True,type=float)
    parser.add_argument('--diff',help='Optional red-channel difference PNG')
    args=parser.parse_args()
    try:
        reference,actual=Path(args.reference).read_bytes(),Path(args.actual).read_bytes()
        result=compare(reference,actual,json.loads(Path(args.regions).read_text()),args.channel_tolerance,args.max_different_fraction)
        if args.diff:Path(args.diff).write_bytes(diff_png(reference,actual))
        print(json.dumps(result,indent=2))
        return 0 if result['passed'] else 1
    except (ValueError,KeyError,TypeError,OSError) as error:parser.exit(2,f'Render comparison error: {error}\n')


if __name__=='__main__':raise SystemExit(main())
