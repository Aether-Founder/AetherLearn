"""Quantify the difference between master and chunk renders for a probe page."""

import sys
from pathlib import Path

import pymupdf

master_path, chunk_path, local_page = sys.argv[1], sys.argv[2], int(sys.argv[3])

master = pymupdf.open(master_path)
chunk = pymupdf.open(chunk_path)

mp = master[local_page - 1]
cp = chunk[local_page - 1]

print("master rect:", mp.rect, "images:", mp.get_images(full=True))
print("chunk  rect:", cp.rect, "images:", cp.get_images(full=True))

a = mp.get_pixmap(dpi=150)
b = cp.get_pixmap(dpi=150)
print(f"pixmaps: {a.width}x{a.height} n={a.n} alpha={a.alpha} | {b.width}x{b.height} n={b.n} alpha={b.alpha}")

if (a.width, a.height, a.n) == (b.width, b.height, b.n):
    sa, sb = a.samples, b.samples
    diffs = [abs(x - y) for x, y in zip(sa, sb)]
    nonzero = sum(1 for d in diffs if d)
    print(f"bytes compared : {len(sa)}")
    print(f"differing bytes: {nonzero} ({100*nonzero/len(sa):.4f}%)")
    print(f"max abs delta  : {max(diffs) if diffs else 0}")
    print(f"mean abs delta : {sum(diffs)/len(diffs) if diffs else 0:.4f}")
else:
    print("pixmap geometry differs")

# Save both renders for eyeballing
out = Path(sys.argv[4]) if len(sys.argv) > 4 else Path(".")
a.save(str(out / "cmp_master.png"))
b.save(str(out / "cmp_chunk.png"))
print("saved comparison renders")

master.close()
chunk.close()
