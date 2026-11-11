"""
Build deployable PDF chunks for the Binas reader.

Why chunks?
-----------
`binas.pdf` (the full 6th edition) is ~414 MiB.  A single file that large breaks
deployment in two ways:

  * GitHub refuses to accept blobs over 100 MiB, so `git push` of a single
    434 MB `public/binas.pdf` is rejected outright.
  * Vercel caps static source uploads at 100 MB (Hobby) / 1 GB (Pro).

Splitting the book into lossless page-range PDFs keeps every individual file far
below those limits while the rendered pages stay byte-for-byte identical: the
page content streams and image XObjects are copied verbatim, never re-encoded.

The viewer (`components/binas/BinasViewer.tsx`) reads `manifest.json` and loads
only the chunks it actually needs.

Usage:
    python scripts/build_binas_chunks.py \
        --source binas/binas.pdf \
        --out public/binas \
        --pages-per-chunk 15
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sys
import time
from pathlib import Path

import pymupdf


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, help="Path to the master binas.pdf")
    parser.add_argument("--out", required=True, help="Output directory for the chunks")
    parser.add_argument("--pages-per-chunk", type=int, default=15)
    parser.add_argument("--max-size-mb", type=float, default=40.0,
                        help="Soft cap; a chunk larger than this is split again")
    parser.add_argument("--clean", action="store_true",
                        help="Remove existing part-*.pdf files from the output directory first")
    return parser.parse_args()


def human(size: int) -> str:
    return f"{size / 1024 / 1024:.1f} MiB"


def write_chunk(doc: pymupdf.Document, first: int, last: int, path: Path) -> int:
    """Write pages [first, last] (0-based, inclusive) to `path` and return its size."""
    out = pymupdf.open()
    try:
        out.insert_pdf(doc, from_page=first, to_page=last)
        # garbage=4 compacts the xref and drops objects that are no longer
        # referenced; deflate=True re-compresses the (already lossless) streams.
        out.save(str(path), garbage=4, deflate=True)
    finally:
        out.close()
    return path.stat().st_size


def main() -> int:
    args = parse_args()
    source = Path(args.source)
    out_dir = Path(args.out)

    if not source.is_file():
        print(f"ERROR: source not found: {source}", file=sys.stderr)
        return 1

    out_dir.mkdir(parents=True, exist_ok=True)

    if args.clean:
        for stale in out_dir.glob("part-*.pdf"):
            stale.unlink()

    print(f"source : {source} ({human(source.stat().st_size)})")

    doc = pymupdf.open(str(source))
    total = doc.page_count
    print(f"pages  : {total}")

    chunks: list[dict] = []
    index = 0
    page = 0
    started = time.time()

    while page < total:
        first = page
        last = min(page + args.pages_per_chunk - 1, total - 1)

        # Shrink the span until the resulting chunk fits under the soft cap.
        while True:
            index += 1
            name = f"part-{index:02d}.pdf"
            target = out_dir / name
            size = write_chunk(doc, first, last, target)
            cap = args.max_size_mb * 1024 * 1024
            if size <= cap or first == last:
                break
            # Too large: drop the tail page and retry with a shorter span.
            target.unlink()
            last = first + max(0, (last - first) // 2)
            index -= 1

        chunks.append({
            "file": name,
            "startPage": first + 1,
            "endPage": last + 1,
            "size": size,
        })
        print(f"  {name}: pages {first + 1:>3}-{last + 1:<3} {human(size)}")
        page = last + 1

    doc.close()

    manifest = {
        "source": source.name,
        "sourceSize": source.stat().st_size,
        "totalPages": total,
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "chunks": chunks,
    }

    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    total_size = sum(c["size"] for c in chunks)
    largest = max(c["size"] for c in chunks)
    print(f"\nchunks : {len(chunks)}")
    print(f"total  : {human(total_size)} (master was {human(source.stat().st_size)})")
    print(f"largest: {human(largest)} (cap {args.max_size_mb:.0f} MiB)")
    print(f"manifest: {manifest_path}")
    print(f"elapsed : {time.time() - started:.1f}s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
