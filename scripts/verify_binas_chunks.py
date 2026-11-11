"""Verify the generated chunks are a faithful, lossless split of the master PDF."""

import json
import sys
from pathlib import Path

import pymupdf

master_path = Path(sys.argv[1])
chunk_dir = Path(sys.argv[2])

master = pymupdf.open(str(master_path))
manifest = json.loads((chunk_dir / "manifest.json").read_text(encoding="utf-8"))

total = 0
ok = True
for chunk in manifest["chunks"]:
    path = chunk_dir / chunk["file"]
    doc = pymupdf.open(str(path))
    expected = chunk["endPage"] - chunk["startPage"] + 1
    if doc.page_count != expected:
        print(f"MISMATCH {chunk['file']}: {doc.page_count} pages, expected {expected}")
        ok = False
    total += doc.page_count
    doc.close()

print(f"master pages   : {master.page_count}")
print(f"chunk pages sum: {total}")
if total != master.page_count:
    print("PAGE COUNT MISMATCH")
    ok = False

# Pixel-compare a spread of pages: chunk boundary pages, first/last, and TOC pages.
probe_pages = [1, 2, 6, 7, 8, 15, 16, 85, 150, 283, 297, 298, 299]
mismatches = 0
for page_no in probe_pages:
    if page_no > master.page_count:
        continue
    chunk = next(c for c in manifest["chunks"]
                 if c["startPage"] <= page_no <= c["endPage"])
    doc = pymupdf.open(str(chunk_dir / chunk["file"]))
    local = page_no - chunk["startPage"] + 1

    a = master[page_no - 1].get_pixmap(dpi=72)
    b = doc[local - 1].get_pixmap(dpi=72)

    if (a.width, a.height) != (b.width, b.height):
        print(f"page {page_no}: SIZE MISMATCH {a.width}x{a.height} vs {b.width}x{b.height}")
        mismatches += 1
    elif a.samples != b.samples:
        print(f"page {page_no}: PIXEL MISMATCH in {chunk['file']}")
        mismatches += 1
    else:
        print(f"page {page_no:>3}: identical ({chunk['file']} local {local}, {a.width}x{a.height})")
    doc.close()

print()
print("RESULT:", "PASS - chunks are a lossless split" if ok and mismatches == 0 else "FAIL")
master.close()
