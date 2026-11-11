"""Check whether chunk image streams are byte-identical to the master."""

import hashlib
import sys

import pymupdf

master_path, chunk_path, local_page = sys.argv[1], sys.argv[2], int(sys.argv[3])

master = pymupdf.open(master_path)
chunk = pymupdf.open(chunk_path)

m = master[local_page - 1]
c = chunk[local_page - 1]


def image_digests(page, doc):
    out = []
    for img in page.get_images(full=True):
        xref = img[0]
        try:
            raw = doc.xref_stream_raw(xref)
            obj = doc.xref_object(xref)
        except Exception as exc:  # pragma: no cover
            out.append((xref, f"error: {exc}", 0))
            continue
        out.append((xref, hashlib.sha256(raw).hexdigest()[:16], len(raw), obj[:120]))
    return out


print("MASTER image xrefs:")
for row in image_digests(m, master):
    print("  ", row)
print("CHUNK image xrefs:")
for row in image_digests(c, chunk):
    print("  ", row)

print("\nMASTER colorspace obj:", master.xref_object(m.get_images(full=True)[0][0])[:400])
print("CHUNK  colorspace obj:", chunk.xref_object(c.get_images(full=True)[0][0])[:400])

master.close()
chunk.close()
