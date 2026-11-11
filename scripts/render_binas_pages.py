"""Render specific PDF pages to PNG for visual verification of the TOC page mapping."""
import sys
import pymupdf

src = sys.argv[1]
out_dir = sys.argv[2]
pages = [int(p) for p in sys.argv[3].split(",")]

doc = pymupdf.open(src)
for p in pages:
    if p > doc.page_count:
        print(f"page {p} out of range")
        continue
    page = doc[p - 1]
    pix = page.get_pixmap(dpi=110)
    out = f"{out_dir}/binas-p{p:03d}.png"
    pix.save(out)
    print(f"wrote {out} ({pix.width}x{pix.height})")
doc.close()
