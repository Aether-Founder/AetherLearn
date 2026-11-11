"""Check image encodings + per-page byte weights to plan chunking."""
import collections
import sys
import pymupdf

path = sys.argv[1]
doc = pymupdf.open(path)

ext_counts = collections.Counter()
ext_bytes = collections.Counter()
sample_exts = []
for i in range(doc.page_count):
    for img in doc[i].get_images(full=True):
        xref = img[0]
        try:
            info = doc.extract_image(xref)
        except Exception:
            continue
        ext = info.get("ext", "?")
        size = info.get("size", 0)
        ext_counts[ext] += 1
        ext_bytes[ext] += size
        if len(sample_exts) < 8:
            sample_exts.append((i + 1, ext, size, info.get("width"), info.get("height"),
                                info.get("colorspace"), info.get("cs-name"), img[2], img[3]))

print("image ext counts:", dict(ext_counts))
print("image ext bytes :", {k: f"{v/1024/1024:.1f} MiB" for k, v in ext_bytes.items()})
for s in sample_exts:
    print("  ", s)

# xref object sizes -> which pages carry the bulk
sizes = collections.Counter()
for xref in range(1, doc.xref_length()):
    try:
        obj = doc.xref_object(xref, compressed=False)
    except Exception:
        continue
    if "/Image" in obj:
        try:
            sizes[xref] = len(doc.xref_stream(xref))
        except Exception:
            pass

print("total image stream bytes: %.1f MiB" % (sum(sizes.values()) / 1024 / 1024))

# Map each page to its images to get per-page weight
page_weight = [0] * doc.page_count
for i in range(doc.page_count):
    for img in doc[i].get_images(full=True):
        page_weight[i] += sizes.get(img[0], 0)

print("--- per-page weight (MiB), first 8 ---")
for i in range(8):
    print("  page %d: %.2f" % (i + 1, page_weight[i] / 1024 / 1024))
print("--- per-page weight (MiB), every 25th ---")
for i in range(0, doc.page_count, 25):
    print("  page %d: %.2f" % (i + 1, page_weight[i] / 1024 / 1024))
print("--- max page ---")
mx = max(range(doc.page_count), key=lambda i: page_weight[i])
print("  page %d: %.2f MiB" % (mx + 1, page_weight[mx] / 1024 / 1024))

doc.close()
