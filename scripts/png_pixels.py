"""Decode browser viewport PNGs (8-bit, non-interlaced RGB/RGBA) using the standard library."""
import struct
import zlib


def decode_png(png):
    if png[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError('Expected PNG signature')
    offset, header, compressed, ended = 8, None, bytearray(), False
    while offset < len(png):
        if len(png) - offset < 12:
            raise ValueError('Truncated PNG chunk')
        size = struct.unpack_from('>I', png, offset)[0]
        if size > len(png) - offset - 12:
            raise ValueError('Truncated PNG chunk data')
        kind = png[offset+4:offset+8]
        data = png[offset+8:offset+8+size]
        crc = struct.unpack_from('>I', png, offset+8+size)[0]
        if zlib.crc32(kind + data) != crc:
            raise ValueError('PNG checksum mismatch')
        if header is None and kind != b'IHDR':
            raise ValueError('PNG must start with IHDR')
        if kind == b'IHDR':
            if header is not None or size != 13:
                raise ValueError('Invalid PNG header')
            header = struct.unpack('>IIBBBBB', data)
        elif kind == b'IDAT':
            compressed.extend(data)
        elif kind == b'IEND':
            if size or offset + 12 != len(png):
                raise ValueError('Invalid PNG end')
            ended = True
            break
        elif not kind[0] & 32:
            raise ValueError('Unsupported critical PNG chunk')
        offset += size + 12
    if not ended or header is None:
        raise ValueError('Incomplete PNG')
    width, height, depth, color, compression, filtering, interlace = header
    if depth != 8 or color not in (2, 6) or compression or filtering or interlace:
        raise ValueError('Expected an 8-bit non-interlaced RGB/RGBA browser PNG')
    if not width or not height or width * height > 64_000_000:
        raise ValueError('PNG dimensions exceed supported viewport size')
    channels = 3 if color == 2 else 4
    stride = width * channels
    expected = height * (stride + 1)
    decoder = zlib.decompressobj()
    try:
        raw = decoder.decompress(compressed, expected + 1)
    except zlib.error as error:
        raise ValueError('Invalid compressed PNG') from error
    if len(raw) != expected or not decoder.eof or decoder.unused_data:
        raise ValueError('PNG pixel data length mismatch')
    decoded = bytearray(height * stride)
    previous = bytes(stride)
    for y in range(height):
        start = y * (stride + 1)
        filter_type = raw[start]
        if filter_type > 4:
            raise ValueError('Invalid PNG row filter')
        row = bytearray(raw[start+1:start+1+stride])
        if filter_type:
            for x in range(stride):
                left = row[x-channels] if x >= channels else 0
                up = previous[x]
                upper_left = previous[x-channels] if x >= channels else 0
                if filter_type == 1:
                    prediction = left
                elif filter_type == 2:
                    prediction = up
                elif filter_type == 3:
                    prediction = (left + up) // 2
                else:
                    p = left + up - upper_left
                    a, b, c = abs(p-left), abs(p-up), abs(p-upper_left)
                    prediction = left if a <= b and a <= c else up if b <= c else upper_left
                row[x] = (row[x] + prediction) & 255
        decoded[y*stride:(y+1)*stride] = row
        previous = row
    if channels == 4:
        return width, height, bytes(decoded)
    rgba = bytearray(width * height * 4)
    for channel in range(3):
        rgba[channel::4] = decoded[channel::3]
    rgba[3::4] = b'\xff' * (width * height)
    return width, height, bytes(rgba)
