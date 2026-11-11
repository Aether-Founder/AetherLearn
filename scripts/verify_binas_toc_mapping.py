"""Verify that the HTML TOC page numbers map 1:1 onto PDF page indices."""
import sys
import pymupdf

path = sys.argv[1]
doc = pymupdf.open(path)

checks = [
    (7, "Grieks alfabet"),
    (8, "Definities"),
    (12, "Eenheden"),
    (16, "metalen"),
    (22, "Verzadigingsdrukken"),
    (42, "Isotopen"),
    (85, "Scheikundeformules"),
    (87, "Scheikundige symbolen"),
    (97, "Elementen"),
    (113, "Oplosbaarheidsproducten"),
    (127, "Verbrandingswarmten"),
    (171, "Genlocaties"),
    (195, "Vitaminen"),
    (233, "Zintuigen"),
    (283, "Periodiek"),
    (295, "Periodiek systeem"),
    (297, "Afstandschaal"),
]

for page_no, needle in checks:
    if page_no > doc.page_count:
        print(f"page {page_no}: OUT OF RANGE")
        continue
    text = doc[page_no - 1].get_text("text").replace("\n", " ")
    text = " ".join(text.split())
    hit = needle.lower() in text.lower()
    print(f"page {page_no:>3}: [{'OK ' if hit else 'MISS'}] {needle!r} -> {text[:110]!r}")

print("\n--- first 8 pages, leading text ---")
for i in range(8):
    text = " ".join(doc[i].get_text("text").split())
    print(f"  p{i+1}: {text[:130]}")

print("\n--- last 5 pages, leading text ---")
for i in range(doc.page_count - 5, doc.page_count):
    text = " ".join(doc[i].get_text("text").split())
    print(f"  p{i+1}: {text[:130]}")

doc.close()
