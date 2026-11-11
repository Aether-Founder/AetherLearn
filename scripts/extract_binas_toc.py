"""Extract the TOC_FLAT table from the original binas.html into a typed TS module."""

import re
import sys
from pathlib import Path

html = Path(sys.argv[1]).read_text(encoding="utf-8")
out_path = Path(sys.argv[2])

match = re.search(r"const TOC_FLAT = \[(.*?)\n\];", html, re.S)
if not match:
    sys.exit("TOC_FLAT not found in source html")

entries = re.findall(r'\["((?:[^"\\]|\\.)*)",\s*(\d+),\s*(\d+)\]', match.group(1))
print(f"parsed {len(entries)} entries")

lines = []
for title, page, depth in entries:
    safe = title.replace("\\", "\\\\").replace('"', '\\"')
    lines.append('  ["%s", %s, %s],' % (safe, page, depth))

TEMPLATE = '''/**
 * Inhoudsopgave (table of contents) for the Binas reader.
 *
 * Generated from the original `binas.html` by `scripts/extract_binas_toc.py`.
 * Each entry is `[title, page, depth]`, where `page` is the 1-based PDF page
 * index.  The PDF page index maps 1:1 onto the printed Binas page numbers.
 */

export interface TocFlatEntry {
  title: string;
  page: number;
  depth: number;
}

export interface TocChild {
  title: string;
  page: number;
}

export interface TocChapter {
  title: string;
  page: number;
  children: TocChild[];
}

export const TOC_FLAT: TocFlatEntry[] = [
__ENTRIES__
];

/**
 * Groups the flat table into chapters with their sub-sections.
 * Depth 0 opens a new chapter; depth 1 attaches to the chapter above it.
 */
export function buildTocTree(flat: TocFlatEntry[] = TOC_FLAT): TocChapter[] {
  const tree: TocChapter[] = [];
  for (const { title, page, depth } of flat) {
    if (depth === 0) {
      tree.push({ title, page, children: [] });
    } else if (tree.length) {
      tree[tree.length - 1].children.push({ title, page });
    }
  }
  return tree;
}

/** Stable key for a TOC row, used for the active highlight. */
export function tocKey(kind: 'chapter' | 'child', chapterIndex: number, childIndex = 0): string {
  return kind === 'chapter' ? `c-${chapterIndex}` : `s-${chapterIndex}-${childIndex}`;
}

/**
 * Flat list of every navigable entry in document order (a chapter is followed
 * by its own children), mirroring the order the original HTML used to pick
 * the "active" row.
 */
export function flattenToc(tree: TocChapter[]): Array<{ title: string; page: number; key: string }> {
  const out: Array<{ title: string; page: number; key: string }> = [];
  tree.forEach((chapter, chapterIndex) => {
    out.push({ title: chapter.title, page: chapter.page, key: tocKey('chapter', chapterIndex) });
    chapter.children.forEach((child, childIndex) => {
      out.push({ title: child.title, page: child.page, key: tocKey('child', chapterIndex, childIndex) });
    });
  });
  return out;
}
'''

out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(TEMPLATE.replace("__ENTRIES__", "\n".join(lines)), encoding="utf-8")
print(f"wrote {out_path}")
