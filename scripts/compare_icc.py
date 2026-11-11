"""Compare the ICC colour-space resources between master and chunk."""

import hashlib
import sys

import pymupdf

master_path, chunk_path, local_page = sys.argv[1], sys.argv[2], int(sys.argv[3])

master = pymupdf.open(master_path)
chunk = pymupdf.open(chunk_path)

m_xref = master[local_page - 1].get_images(full=True)[0][0]
c_xref = chunk[local_page - 1].get_images(full=True)[0][0]

m_cs = int(master.xref_object(m_xref).split("/ColorSpace")[1].split()[0])
c_cs = int(chunk.xref_object(c_xref).split("/ColorSpace")[1].split()[0])

for label, doc, xref in (("master", master, m_cs), ("chunk", chunk, c_cs)):
    obj = doc.xref_object(xref)
    print(f"{label} colorspace xref {xref}: {obj.strip()[:200]}")
    if "/N" in obj and "stream" in obj:
        try:
            raw = doc.xref_stream_raw(xref)
            print(f"   icc profile bytes={len(raw)} sha={hashlib.sha256(raw).hexdigest()[:16]}")
        except Exception as exc:
            print("   (no raw stream)", exc)
    else:
        # indirect /N reference
        try:
            raw = doc.xref_stream_raw(xref)
            print(f"   stream bytes={len(raw)} sha={hashlib.sha256(raw).hexdigest()[:16]}")
        except Exception as exc:
            print("   (no raw stream)", exc)

master.close()
chunk.close()
