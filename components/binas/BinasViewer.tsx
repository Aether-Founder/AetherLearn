'use client';

/**
 * Binas reader — a faithful port of the original standalone `binas.html`.
 *
 * The markup, the styling and every interaction (table of contents with
 * fold/unfold and search, lazy page rendering, zoom, rotation, page jump,
 * theme toggle, scroll-to-top) mirror the original 1:1.  The only structural
 * difference is *how* the PDF bytes are fetched: the master `binas.pdf` is
 * ~414 MiB, which no single deployment can carry (GitHub rejects blobs over
 * 100 MiB, Vercel caps static uploads at 100 MB on Hobby).  The book is
 * therefore split into lossless page-range chunks that are described by
 * `public/binas/manifest.json` and loaded on demand.
 *
 * See `scripts/build_binas_chunks.py`.
 */

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import { AppShell, PageHeader } from '@/components/AppShell';
import {
  buildTocTree,
  flattenToc,
  tocKey,
  type TocChapter,
} from '@/lib/binas/toc';
import './binas.css';

/* ------------------------------------------------------------------ */
/* Minimal pdf.js typings (pdf.js is loaded from /vendor/pdfjs)       */
/* ------------------------------------------------------------------ */

interface PdfViewport {
  width: number;
  height: number;
}

interface PdfPageProxy {
  getViewport(params: { scale: number; rotation: number }): PdfViewport;
  render(params: {
    canvasContext: CanvasRenderingContext2D | null;
    viewport: PdfViewport;
    transform?: number[] | null;
  }): { promise: Promise<void> };
}

interface PdfDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfPageProxy>;
  destroy?(): void;
}

interface PdfJsLib {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(source: string): { promise: Promise<PdfDocumentProxy> };
}

declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ChunkInfo {
  /** File name inside `public/binas`. */
  file: string;
  /** Public URL of the chunk. */
  url: string;
  /** First global page contained in this chunk (1-based, inclusive). */
  startPage: number;
  /** Last global page contained in this chunk (1-based, inclusive). */
  endPage: number;
}

interface PageItem {
  pageNum: number;
  el: HTMLDivElement;
  rendered: boolean;
}

interface ViewerState {
  pdfjs: PdfJsLib | null;
  chunks: ChunkInfo[];
  chunkDocs: Map<string, Promise<PdfDocumentProxy>>;
  totalPages: number;
  pages: PageItem[];
  observer: IntersectionObserver | null;
  scale: number;
  rotation: number;
  baseW: number;
  baseH: number;
  currentPage: number;
  renderQueue: number;
  navLock: boolean;
  navLockTimer: ReturnType<typeof setTimeout> | null;
  scrollTimer: ReturnType<typeof setTimeout> | null;
  pinchTimer: ReturnType<typeof setTimeout> | null;
  resizeTimer: ReturnType<typeof setTimeout> | null;
  destroyed: boolean;
  /** True while the page elements are being rebuilt. */
  building: boolean;
  /** Navigation that arrived while a rebuild was in flight. */
  pendingNavigation: number | null;
}

const PDFJS_SRC = '/vendor/pdfjs/pdf.min.js';
const PDFJS_WORKER_SRC = '/vendor/pdfjs/pdf.worker.min.js';
const MANIFEST_URL = '/binas/manifest.json';
const SINGLE_FILE_URL = '/binas.pdf';

function createViewerState(): ViewerState {
  return {
    pdfjs: null,
    chunks: [],
    chunkDocs: new Map(),
    totalPages: 0,
    pages: [],
    observer: null,
    scale: 1,
    rotation: 0,
    baseW: 0,
    baseH: 0,
    currentPage: 1,
    renderQueue: 0,
    navLock: false,
    navLockTimer: null,
    scrollTimer: null,
    pinchTimer: null,
    resizeTimer: null,
    destroyed: false,
    building: false,
    pendingNavigation: null,
  };
}

/* ------------------------------------------------------------------ */
/* pdf.js bootstrap                                                    */
/* ------------------------------------------------------------------ */

function loadPdfJs(): Promise<PdfJsLib> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('pdf.js kan alleen in de browser geladen worden.'));
      return;
    }
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-aether-pdfjs]'
    );
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.pdfjsLib) resolve(window.pdfjsLib);
        else reject(new Error('pdf.js kon niet geladen worden.'));
      });
      existing.addEventListener('error', () =>
        reject(new Error('pdf.js kon niet geladen worden.'))
      );
      return;
    }

    const script = document.createElement('script');
    script.src = PDFJS_SRC;
    script.async = true;
    script.dataset.aetherPdfjs = 'true';
    script.onload = () => {
      if (window.pdfjsLib) resolve(window.pdfjsLib);
      else reject(new Error('pdf.js kon niet geladen worden.'));
    };
    script.onerror = () => reject(new Error('pdf.js kon niet geladen worden.'));
    document.head.appendChild(script);
  });
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function BinasViewer() {
  const tocTree = useMemo(() => buildTocTree(), []);
  const flatEntries = useMemo(() => flattenToc(tocTree), [tocTree]);

  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 0 });
  const [pageInput, setPageInput] = useState('');
  const [showFab, setShowFab] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const stateRef = useRef<ViewerState>(createViewerState());
  const pdfWrapRef = useRef<HTMLDivElement | null>(null);
  const pdfContRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef(new Map<string, HTMLElement>());
  const mountedRef = useRef(true);

  const registerEntry = useCallback((key: string, el: HTMLElement | null) => {
    if (el) entryRefs.current.set(key, el);
    else entryRefs.current.delete(key);
  }, []);

  /* ---------------------------------------------------------------- */
  /* Viewer internals (mirroring the original module-level functions) */
  /* ---------------------------------------------------------------- */

  const getChunkDoc = useCallback(async (chunk: ChunkInfo) => {
    const st = stateRef.current;
    const cached = st.chunkDocs.get(chunk.url);
    if (cached) return cached;
    if (!st.pdfjs) throw new Error('pdf.js is niet beschikbaar.');

    const promise = st.pdfjs.getDocument(chunk.url).promise;
    st.chunkDocs.set(chunk.url, promise);
    try {
      return await promise;
    } catch (error) {
      st.chunkDocs.delete(chunk.url);
      throw error;
    }
  }, []);

  const resolvePage = useCallback((globalPage: number) => {
    const { chunks } = stateRef.current;
    for (const chunk of chunks) {
      if (globalPage >= chunk.startPage && globalPage <= chunk.endPage) {
        return { chunk, localPage: globalPage - chunk.startPage + 1 };
      }
    }
    return null;
  }, []);

  const computeDefaultScale = useCallback(async () => {
    const st = stateRef.current;
    const wrap = pdfWrapRef.current;
    const availW = (wrap ? wrap.clientWidth : 1024) - 48;
    return Math.max(0.3, Math.min(2.5, availW / st.baseW));
  }, []);

  const updateActiveInSidebar = useCallback((pageNumber: number) => {
    let bestKey: string | null = null;
    let bestPage = -Infinity;
    for (const entry of flatEntries) {
      if (entry.page <= pageNumber && entry.page > bestPage) {
        bestPage = entry.page;
        bestKey = entry.key;
      }
    }
    setActiveKey(bestKey);
    if (bestKey) {
      const el = entryRefs.current.get(bestKey);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [flatEntries]);

  const updateCurrentPageFromScroll = useCallback(() => {
    const st = stateRef.current;
    const wrap = pdfWrapRef.current;
    if (!st.pages.length || !wrap) return;

    const probe = wrap.scrollTop + 10;
    let current = 1;
    for (const item of st.pages) {
      if (item.el.offsetTop <= probe) current = item.pageNum;
      else break;
    }
    if (current !== st.currentPage) {
      st.currentPage = current;
      setPageInfo((prev) => ({ ...prev, current }));
      updateActiveInSidebar(current);
    }
  }, [updateActiveInSidebar]);

  const releaseNavLock = useCallback(() => {
    const st = stateRef.current;
    st.navLock = false;
    updateCurrentPageFromScroll();
  }, [updateCurrentPageFromScroll]);

  const renderPage = useCallback(async (item: PageItem) => {
    const st = stateRef.current;
    if (item.rendered || st.destroyed) return;
    item.rendered = true;
    (window as any).__renders = ((window as any).__renders ?? 0) + 1;
    if ((window as any).__renders % 5 === 0) {
      document.title =
        'BUILDS ' + (window as any).__builds + ' renders ' + (window as any).__renders;
    }

    while (st.renderQueue >= 4) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      if (st.destroyed) return;
    }
    st.renderQueue++;

    try {
      const target = resolvePage(item.pageNum);
      if (!target) return;

      const doc = await getChunkDoc(target.chunk);
      if (st.destroyed) return;

      const page = await doc.getPage(target.localPage);
      if (st.destroyed) return;

      const viewport = page.getViewport({ scale: st.scale, rotation: st.rotation });
      const outputScale = window.devicePixelRatio || 1;

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + 'px';
      canvas.style.height = Math.floor(viewport.height) + 'px';

      const context = canvas.getContext('2d');
      const transform =
        outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

      await page.render({ canvasContext: context, viewport, transform }).promise;
      if (st.destroyed) return;

      item.el.style.width = Math.floor(viewport.width) + 'px';
      item.el.style.height = Math.floor(viewport.height) + 'px';
      item.el.innerHTML = '';
      item.el.appendChild(canvas);
    } catch (error) {
      item.rendered = false;
      console.error('[binas] kon pagina niet renderen:', item.pageNum, error);
    } finally {
      st.renderQueue--;
    }
  }, [getChunkDoc, resolvePage]);

  const unrenderPage = useCallback((item: PageItem) => {
    if (!item.rendered) return;
    item.rendered = false;
    item.el.innerHTML =
      '<div class="placeholder">Pagina ' + item.pageNum + '</div>';
  }, []);

  const reRenderVisible = useCallback(() => {
    const st = stateRef.current;
    const wrap = pdfWrapRef.current;
    if (!wrap) return;

    const wrapTop = wrap.scrollTop;
    const wrapBottom = wrapTop + wrap.clientHeight;
    const margin = 600;

    for (const item of st.pages) {
      if (item.rendered) {
        item.rendered = false;
        item.el.innerHTML =
          '<div class="placeholder">Pagina ' + item.pageNum + '</div>';
      }
      const top = item.el.offsetTop;
      const bottom = top + item.el.offsetHeight;
      if (bottom > wrapTop - margin && top < wrapBottom + margin) {
        void renderPage(item);
      }
    }
  }, [renderPage]);

  const gotoPage = useCallback((pageNumber: number) => {
    const st = stateRef.current;
    if (!st.pdfjs || !st.pages.length) return;

    const target = Math.max(1, Math.min(st.totalPages, pageNumber));
    const item = st.pages[target - 1];
    if (!item) return;

    st.currentPage = target;
    setPageInfo((prev) => ({ ...prev, current: target }));
    updateActiveInSidebar(target);

    // The page elements are being rebuilt: remember the request and apply it
    // once the rebuild finished, instead of scrolling into a DOM that is
    // about to be replaced.
    if (st.building) {
      st.pendingNavigation = target;
      return;
    }

    st.navLock = true;
    if (st.navLockTimer) clearTimeout(st.navLockTimer);
    st.navLockTimer = setTimeout(releaseNavLock, 150);

    item.el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    void renderPage(item);
  }, [releaseNavLock, renderPage, updateActiveInSidebar]);

  const buildViewer = useCallback(async () => {
    const st = stateRef.current;
    if (st.observer) {
      st.observer.disconnect();
      st.observer = null;
    }
    const container = pdfContRef.current;
    if (!container) return;

    // Remember where the reader was, so a rebuild (window resize) does not
    // throw the user back to the top of the book.
    const wrap = pdfWrapRef.current;
    const keepPage = st.currentPage;
    const oldItem = st.pages[keepPage - 1];
    const oldHeight = oldItem ? oldItem.el.offsetHeight : 0;
    const oldOffset = oldItem ? oldItem.el.offsetTop : 0;
    const keepFraction =
      wrap && oldHeight > 0
        ? Math.max(0, Math.min(1, (wrap.scrollTop - oldOffset) / oldHeight))
        : 0;

    st.building = true;
    container.innerHTML = '';
    st.pages = [];
    st.currentPage = 1;
    st.scale = await computeDefaultScale();

    const widthCss = Math.floor(st.baseW * st.scale);
    const heightCss = Math.floor(st.baseH * st.scale);

    for (let i = 1; i <= st.totalPages; i++) {
      const div = document.createElement('div');
      div.className = 'pdf-page';
      div.dataset.pageNum = String(i);
      div.style.width = widthCss + 'px';
      div.style.height = heightCss + 'px';
      div.innerHTML = '<div class="placeholder">Pagina ' + i + '</div>';
      container.appendChild(div);
      st.pages.push({ pageNum: i, el: div, rendered: false });
    }

    st.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const pageNumber = Number(
            (entry.target as HTMLElement).dataset.pageNum
          );
          const item = st.pages[pageNumber - 1];
          if (!item) continue;
          if (entry.isIntersecting) void renderPage(item);
          else unrenderPage(item);
        }
      },
      { root: pdfWrapRef.current, rootMargin: '600px 0px' }
    );

    for (const item of st.pages) st.observer.observe(item.el);

    // Restore the reading position before anything else reads the scroll
    // offset, otherwise the page counter briefly reports the wrong page.
    const restored = st.pages[keepPage - 1];
    if (restored && wrap) {
      wrap.scrollTop = restored.el.offsetTop + keepFraction * restored.el.offsetHeight;
      st.currentPage = keepPage;
    }

    st.building = false;
    (window as any).__builds = ((window as any).__builds ?? 0) + 1;
    (window as any).__renders = 0;
    document.title =
      'BUILDS ' + (window as any).__builds + ' renders ' + (window as any).__renders;
    setPageInfo({ current: st.currentPage, total: st.totalPages });
    void renderPage(st.pages[st.currentPage - 1] ?? st.pages[0]);
    updateActiveInSidebar(st.currentPage);

    // A navigation that arrived mid-rebuild is applied now.
    if (st.pendingNavigation !== null) {
      const target = st.pendingNavigation;
      st.pendingNavigation = null;
      gotoPage(target);
    }
  }, [computeDefaultScale, gotoPage, renderPage, unrenderPage, updateActiveInSidebar]);

  const applyPreviewScale = useCallback((oldScale: number, newScale: number) => {
    const st = stateRef.current;
    const wrap = pdfWrapRef.current;
    if (!wrap) return;

    const ratio = newScale / oldScale;
    const oldScroll = wrap.scrollTop;
    const width = Math.floor(st.baseW * newScale);
    const height = Math.floor(st.baseH * newScale);

    for (const item of st.pages) {
      item.el.style.width = width + 'px';
      item.el.style.height = height + 'px';
      const canvas = item.el.querySelector('canvas');
      if (canvas) {
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
      }
    }
    wrap.scrollTop = oldScroll * ratio;
  }, []);

  const zoomBy = useCallback((factor: number) => {
    const st = stateRef.current;
    if (!st.pdfjs) return;

    const oldScale = st.scale;
    const newScale = Math.max(0.3, Math.min(5, st.scale * factor));
    if (newScale === oldScale) return;

    st.scale = newScale;
    applyPreviewScale(oldScale, newScale);

    if (st.pinchTimer) clearTimeout(st.pinchTimer);
    st.pinchTimer = setTimeout(reRenderVisible, 140);
  }, [applyPreviewScale, reRenderVisible]);

  const rotate = useCallback(async () => {
    const st = stateRef.current;
    const wrap = pdfWrapRef.current;
    if (!st.pdfjs || !st.pages.length || !wrap) return;

    const currentItem = st.pages[st.currentPage - 1];
    const oldHeight = currentItem ? currentItem.el.offsetHeight : 0;
    const fractionY =
      currentItem && oldHeight > 0
        ? Math.max(
            0,
            Math.min(1, (wrap.scrollTop - currentItem.el.offsetTop) / oldHeight)
          )
        : 0;

    st.rotation = (st.rotation + 90) % 360;

    const firstChunk = st.chunks[0];
    const doc = await getChunkDoc(firstChunk);
    const pageOne = await doc.getPage(1);
    const viewport = pageOne.getViewport({ scale: 1, rotation: st.rotation });
    st.baseW = viewport.width;
    st.baseH = viewport.height;

    st.scale = await computeDefaultScale();

    const width = Math.floor(st.baseW * st.scale);
    const height = Math.floor(st.baseH * st.scale);
    for (const item of st.pages) {
      item.el.style.width = width + 'px';
      item.el.style.height = height + 'px';
      item.el.innerHTML =
        '<div class="placeholder">Pagina ' + item.pageNum + '</div>';
      item.rendered = false;
    }

    st.navLock = true;
    if (st.navLockTimer) clearTimeout(st.navLockTimer);
    const newItem = st.pages[st.currentPage - 1];
    wrap.scrollTop = newItem.el.offsetTop + fractionY * height;
    st.navLockTimer = setTimeout(releaseNavLock, 200);

    reRenderVisible();
    setPageInfo((prev) => ({ ...prev, current: st.currentPage }));
  }, [computeDefaultScale, getChunkDoc, releaseNavLock, reRenderVisible]);

  /* ---------------------------------------------------------------- */
  /* Init                                                              */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    mountedRef.current = true;
    const st = createViewerState();
    stateRef.current = st;

    const init = async () => {
      try {
        const pdfjs = await loadPdfJs();
        if (st.destroyed) return;
        st.pdfjs = pdfjs;
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;

        let chunks: ChunkInfo[];
        let totalPages: number;

        try {
          const response = await fetch(MANIFEST_URL, { cache: 'force-cache' });
          if (!response.ok) throw new Error('manifest niet beschikbaar');
          const manifest = (await response.json()) as {
            totalPages: number;
            chunks: Array<{
              file: string;
              startPage: number;
              endPage: number;
            }>;
          };
          chunks = manifest.chunks.map((chunk) => ({
            file: chunk.file,
            url: `/binas/${chunk.file}`,
            startPage: chunk.startPage,
            endPage: chunk.endPage,
          }));
          totalPages = manifest.totalPages;
        } catch {
          // Fallback: a single monolithic PDF (local development setup).
          const doc = await pdfjs.getDocument(SINGLE_FILE_URL).promise;
          if (st.destroyed) return;
          chunks = [
            {
              file: 'binas.pdf',
              url: SINGLE_FILE_URL,
              startPage: 1,
              endPage: doc.numPages,
            },
          ];
          totalPages = doc.numPages;
          st.chunkDocs.set(SINGLE_FILE_URL, Promise.resolve(doc));
        }

        st.chunks = chunks;
        st.totalPages = totalPages;

        const firstChunk = chunks[0];
        const firstDoc = await getChunkDoc(firstChunk);
        if (st.destroyed) return;
        const pageOne = await firstDoc.getPage(1);
        const viewport = pageOne.getViewport({ scale: 1, rotation: 0 });
        st.baseW = viewport.width;
        st.baseH = viewport.height;

        await buildViewer();
        if (st.destroyed) return;
        if (mountedRef.current) setStatus('ready');
      } catch (error) {
        console.error('[binas] kon het document niet laden:', error);
        if (mountedRef.current) setStatus('error');
      }
    };

    void init();

    return () => {
      mountedRef.current = false;
      st.destroyed = true;
      if (st.observer) st.observer.disconnect();
      if (st.navLockTimer) clearTimeout(st.navLockTimer);
      if (st.scrollTimer) clearTimeout(st.scrollTimer);
      if (st.pinchTimer) clearTimeout(st.pinchTimer);
      if (st.resizeTimer) clearTimeout(st.resizeTimer);
      st.chunkDocs.forEach((pending) => {
        pending
          .then((doc) => doc.destroy?.())
          .catch(() => undefined);
      });
      st.chunkDocs.clear();
    };
  }, [buildViewer, getChunkDoc]);

  /* ---------------------------------------------------------------- */
  /* Scroll / resize / wheel listeners                                 */
  /* ---------------------------------------------------------------- */

  const onWrapScroll = useCallback(() => {
    const wrap = pdfWrapRef.current;
    if (!wrap) return;
    setShowFab(wrap.scrollTop > 350);

    const st = stateRef.current;
    if (st.navLock) {
      if (st.navLockTimer) clearTimeout(st.navLockTimer);
      st.navLockTimer = setTimeout(releaseNavLock, 150);
      return;
    }
    if (st.scrollTimer) return;
    st.scrollTimer = setTimeout(() => {
      st.scrollTimer = null;
      updateCurrentPageFromScroll();
    }, 80);
  }, [releaseNavLock, updateCurrentPageFromScroll]);

  const onWrapWheel = useCallback((event: WheelEvent) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    zoomBy(event.deltaY < 0 ? 1.08 : 1 / 1.08);
  }, [zoomBy]);

  /**
   * De scroll- en wheel-listener worden via een callback-ref aan het
   * element dat op dat moment echt in de DOM zit.  AppShell vervangt zijn
   * kinderstructuur zodra de gebruikerdata binnen is; daardoor kan een
   * listener uit een useEffect aan een vervangen element blijven hangen.
   */
  const attachWrap = useCallback((el: HTMLDivElement | null) => {
    const previous = pdfWrapRef.current;
    if (previous) {
      previous.removeEventListener('scroll', onWrapScroll);
      previous.removeEventListener('wheel', onWrapWheel);
    }
    pdfWrapRef.current = el;
    if (el) {
      el.addEventListener('scroll', onWrapScroll);
      el.addEventListener('wheel', onWrapWheel, { passive: false });
    }
  }, [onWrapScroll, onWrapWheel]);

  useEffect(() => {
    const onResize = () => {
      const st = stateRef.current;
      if (!st.pdfjs) return;
      if (st.resizeTimer) clearTimeout(st.resizeTimer);
      st.resizeTimer = setTimeout(async () => {
        const keep = st.currentPage;
        await buildViewer();
        gotoPage(keep);
      }, 250);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [buildViewer, gotoPage]);

  /* ---------------------------------------------------------------- */
  /* Theme                                                              */
  /* ---------------------------------------------------------------- */

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  /* ---------------------------------------------------------------- */
  /* Table of contents                                                  */
  /* ---------------------------------------------------------------- */

  const chaptersWithChildren = useMemo(
    () => tocTree.filter((chapter) => chapter.children.length > 0),
    [tocTree]
  );

  const allFolded = useMemo(
    () =>
      chaptersWithChildren.every(
        (chapter) => !expanded[tocKey('chapter', tocTree.indexOf(chapter))]
      ),
    [chaptersWithChildren, expanded, tocTree]
  );

  const handleFoldAll = useCallback(() => {
    setExpanded((prev) => {
      const next: Record<string, boolean> = {};
      const expand = Object.values(prev).some(Boolean);
      for (const chapter of chaptersWithChildren) {
        next[tocKey('chapter', tocTree.indexOf(chapter))] = !expand;
      }
      return next;
    });
  }, [chaptersWithChildren, tocTree]);

  const handleChapterClick = useCallback(
    (key: string, chapter: TocChapter) => {
      if (chapter.children.length > 0) {
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
      }
      gotoPage(chapter.page);
    },
    [gotoPage]
  );

  const normalisedQuery = query.trim().toLowerCase();

  const isChapterHidden = useCallback(
    (chapter: TocChapter) =>
      normalisedQuery.length > 0 &&
      !chapter.title.toLowerCase().includes(normalisedQuery),
    [normalisedQuery]
  );

  /* ---------------------------------------------------------------- */
  /* Toolbar handlers                                                   */
  /* ---------------------------------------------------------------- */

  const handleGo = useCallback(() => {
    const value = parseInt(pageInput, 10);
    if (!Number.isNaN(value)) gotoPage(value);
  }, [gotoPage, pageInput]);

  const handlePageInputKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        const value = parseInt(pageInput, 10);
        if (!Number.isNaN(value)) gotoPage(value);
      }
    },
    [gotoPage, pageInput]
  );

  const handleScrollTop = useCallback(() => {
    pdfWrapRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* ---------------------------------------------------------------- */
  /* Render                                                             */
  /* ---------------------------------------------------------------- */

  return (
    <AppShell hideFooter>
      <PageHeader
        title="Binas"
        description="De volledige Binas (Zesde editie)."
        action={
          <Link
            href="/vakken/scheikunde"
            className="mt-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-secondary/50 flex-shrink-0 inline-flex items-center justify-center"
            title="Terug naar scheikunde"
            aria-label="Terug naar scheikunde"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        }
        actionPosition="left"
      />

      <div className="pl-0 space-y-6">
        <div className="binas-root" data-binas-theme={isDark ? 'dark' : 'light'}>
          <div className="app-layout">
          {/* ---------------------------------------------------- */}
          {/* Sidebar — Inhoudsopgave                             */}
          {/* ---------------------------------------------------- */}
          <aside className="tw-sidebar">
          <div className="tw-sidebar-inner">
            <div className="tw-sidebar-title">
              <div className="tw-sidebar-title-row">
                <h2>Inhoudsopgave</h2>
                <button
                  type="button"
                  className="tw-fold-all"
                  title={allFolded ? 'Alles uitvouwen' : 'Alles invouwen'}
                  aria-label={allFolded ? 'Alles uitvouwen' : 'Alles invouwen'}
                  onClick={handleFoldAll}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16 15L12 19L8 15M8 9L12 5L16 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <input
                id="search"
                className="tw-sidebar-search"
                type="search"
                placeholder="Zoek tabel of onderwerp…"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <nav className="tw-sidebar-nav">
              <div className="tw-sidebar-nav-inner">
                {tocTree.map((chapter, chapterIndex) => {
                  const key = tocKey('chapter', chapterIndex);
                  const hasChildren = chapter.children.length > 0;
                  const open = hasChildren && !!expanded[key];
                  const hidden = isChapterHidden(chapter);

                  return (
                    <Fragment key={key}>
                      <button
                        type="button"
                        ref={(el) => registerEntry(key, el)}
                        className={
                          'tw-chapter' +
                          (hasChildren ? '' : ' no-children') +
                          (open ? '' : ' closed') +
                          (activeKey === key ? ' active' : '')
                        }
                        data-page={chapter.page}
                        hidden={hidden}
                        onClick={() => handleChapterClick(key, chapter)}
                      >
                        <svg
                          className="tw-chevron"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <span className="tw-label">{chapter.title}</span>
                        <span className="tw-pg">{chapter.page}</span>
                      </button>
                      <div className={'tw-children' + (open ? '' : ' closed')}>
                        <div className="tw-children-inner">
                          {chapter.children.map((child, childIndex) => {
                            const childKey = tocKey('child', chapterIndex, childIndex);
                            return (
                              <button
                                key={childKey}
                                type="button"
                                ref={(el) => registerEntry(childKey, el)}
                                className={
                                  'tw-sub' + (activeKey === childKey ? ' active' : '')
                                }
                                data-page={child.page}
                                hidden={hidden}
                                onClick={() => gotoPage(child.page)}
                              >
                                <span className="tw-label">{child.title}</span>
                                <span className="tw-pg">{child.page}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        {/* ---------------------------------------------------- */}
        {/* Content column                                       */}
        {/* ---------------------------------------------------- */}
        <main className="content-col">
          <div className="pdf-toolbar">
            <button
              type="button"
              className="btn-icon"
              title="Vorige pagina"
              aria-label="Vorige pagina"
              onClick={() => gotoPage(stateRef.current.currentPage - 1)}
            >
              ◀
            </button>
            <span className="badge">
              {status === 'ready'
                ? `${pageInfo.current} / ${pageInfo.total}`
                : '– / –'}
            </span>
            <button
              type="button"
              className="btn-icon"
              title="Volgende pagina"
              aria-label="Volgende pagina"
              onClick={() => gotoPage(stateRef.current.currentPage + 1)}
            >
              ▶
            </button>

            <input
              type="number"
              min={1}
              max={pageInfo.total || undefined}
              placeholder={pageInfo.total ? `1 – ${pageInfo.total}` : 'pagina'}
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
              onKeyDown={handlePageInputKey}
            />
            <button
              type="button"
              className="btn-icon"
              style={{ padding: '.4rem .7rem' }}
              onClick={handleGo}
            >
              Ga
            </button>

            <span className="spacer" />

            <button
              type="button"
              className="btn-icon"
              title="Thema wisselen"
              aria-label="Thema wisselen"
              onClick={toggleTheme}
            >
              {isDark ? (
                <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <button
              type="button"
              className="btn-icon"
              title="Uitzoomen"
              aria-label="Uitzoomen"
              onClick={() => zoomBy(1 / 1.2)}
            >
              <svg
                style={{ width: 14, height: 14 }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button
              type="button"
              className="btn-icon"
              title="Inzoomen"
              aria-label="Inzoomen"
              onClick={() => zoomBy(1.2)}
            >
              <svg
                style={{ width: 14, height: 14 }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button
              type="button"
              className="btn-icon"
              title="Draaien"
              aria-label="Draaien"
              onClick={() => void rotate()}
            >
              <svg
                style={{ width: 14, height: 14 }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
          </div>

          <div className="pdf-wrap" ref={attachWrap}>
            <div className="pdf-container" ref={pdfContRef} />
            {status === 'error' ? (
              <div className="pdf-error">
                Het document kon niet worden geladen.
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className={'scroll-top-fab' + (showFab ? ' show' : '')}
            title="Naar boven"
            aria-label="Naar boven"
            onClick={handleScrollTop}
          >
            <svg
              style={{ width: 16, height: 16 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        </main>
        </div>
        </div>
      </div>
    </AppShell>
  );
}
