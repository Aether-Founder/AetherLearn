"""Compare save options for lossless page copying."""

import sys
from pathlib import Path

import pymupdf

src = Path(sys.argv[1])
out_dir = Path(sys.argv[2])
out_dir.mkdir(parents=True, exist_ok=True)

doc = pymupdf.open(str(src))

variants = {
    "g4_deflate": dict(garbage=4, deflate=True),
    "g4_nodeflate": dict(garbage=4, deflate=False),
    "g3_nodeflate": dict(garbage=3, deflate=False),
}

results = {}
for name, kwargs in variants.items():
    target = out_dir / f"variant-{name}.pdf"
    out = pymupdf.open()
    out.insert_pdf(doc, from_page=6, to_page=6)  # page 7 (0-based 6)
    out.save(str(target), **kwargs)
    out.close()

    chunk = pymupdf.open(str(target))
    a = doc[6].get_pixmap(dpi=72)
    b = chunk[0].get_pixmap(dpi=72)
    identical = a.samples == b.samples
    maxdelta = max((abs(x - y) for x, y in zip(a.samples, b.samples)), default=0)
    results[name] = (target.stat().st_size, identical, maxdelta)
    print(f"{name:>16}: size={target.stat().st_size/1024:>8.1f} KiB  identical={identical}  maxdelta={maxdelta}")
    chunk.close()

# reference: size of the same page in the master
print(f"{'master (1 page)':>16}: size={doc[6].get_pixmap(dpi=72).n * 0 + 0:,} (n/a, master is {src.stat().st_size/1024/1024:.1f} MiB)")
doc.close()
