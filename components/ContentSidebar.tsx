"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { getSectionTitle } from "@/lib/section-title";

export interface SectionBlock {
  id: string;
  title?: string;
  content?: string;
  type?: string;
}

export interface Section {
  id: string;
  title: string;
  blocks?: SectionBlock[];
}

interface ContentSidebarProps {
  sections: Section[];
  pageTitle?: string;
  className?: string;
  hidden?: boolean;
}

export function ContentSidebar({ sections, pageTitle, className = "", hidden = false }: ContentSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [sidebarStyle, setSidebarStyle] = useState<React.CSSProperties>({});
  const asideRef = useRef<HTMLElement>(null);
  const sidebarHeightRef = useRef<number>(0);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Manual sticky behavior using position: fixed
  useEffect(() => {
    const aside = asideRef.current;
    if (!aside) return;

    const originalTop = aside.getBoundingClientRect().top + window.scrollY;
    const originalLeft = aside.getBoundingClientRect().left;
    const originalWidth = aside.offsetWidth;
    sidebarHeightRef.current = aside.offsetHeight;

    let stopPinningAt = originalTop + 2000; // Where to stop pinning

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Find the final section in the TOC
      if (sections && sections.length > 0) {
        const finalSectionId = sections[sections.length - 1].id;
        const finalSectionElement = document.getElementById(finalSectionId);
        if (finalSectionElement) {
          // Use the bottom of the final section (top + height) instead of just top
          const finalSectionBottom = finalSectionElement.getBoundingClientRect().bottom + window.scrollY;
          stopPinningAt = finalSectionBottom - 200; // Stop 200px before final section ends
        }
      }

      if (scrollY < originalTop) {
        // Before original position - stay in normal flow
        setSidebarStyle({
          transition: 'all 0.3s ease-out',
        });
      } else if (scrollY >= originalTop && scrollY < stopPinningAt) {
        // Between original and stop point - pin to top
        setSidebarStyle({
          position: 'fixed',
          top: '16px',
          left: `${originalLeft}px`,
          width: `${originalWidth}px`,
          zIndex: 40,
          transition: 'all 0.3s ease-out',
        });
      } else {
        // After stop point - stay at the stop position (relative to parent)
        const distanceScrolled = stopPinningAt - originalTop;
        setSidebarStyle({
          position: 'absolute',
          top: `${distanceScrolled}px`,
          left: '0',
          width: '100%',
          zIndex: 40,
          transition: 'all 0.3s ease-out',
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sections]);

  // Scroll spy
  useEffect(() => {
    if (!sections) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      let activeId = "";

      const allElements: { id: string; offsetTop: number; endTop: number }[] = [];

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          allElements.push({
            id: section.id,
            offsetTop: element.offsetTop,
            endTop: element.offsetTop + element.offsetHeight,
          });
        }

        section.blocks?.forEach((block: any) => {
          const blockElement = document.getElementById(block.id);
          if (blockElement) {
            allElements.push({
              id: block.id,
              offsetTop: blockElement.offsetTop,
              endTop: blockElement.offsetTop + blockElement.offsetHeight,
            });
          }
        });
      }

      for (const item of allElements) {
        if (scrollPosition >= item.offsetTop && scrollPosition < item.endTop) {
          activeId = item.id;
          break;
        }
      }

      setActiveSection(activeId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (hidden || !sections || sections.length === 0) return null;

  return (
    <aside
      ref={asideRef}
      className={`md:block self-start max-w-none basis-auto bg-background transition-all duration-300 ease-out relative ${className}`}
      style={sidebarStyle}
    >
      <div className="flex flex-col">
        <div className="p-5 pb-3 flex-shrink-0">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Inhoudsopgave
          </h2>
        </div>

        {/* Scrollable nav — takes all remaining height, scrollbar hidden */}
        <nav className="overflow-y-auto overscroll-contain scrollbar-hide" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
          <div className="space-y-1 px-2 pb-4">
            <div className="w-full text-left px-3 py-2 rounded-md text-[13px] font-medium text-foreground select-none cursor-default">
              <span className="inline">
                {pageTitle || getSectionTitle(sections[0])}
              </span>
            </div>

            <div className="ml-2 space-y-0.5 pl-3">
              {sections.map((section) => (
                <div key={section.id} className="space-y-1">
                  <button
                    onClick={() => {
                      toggleSection(section.id);
                      scrollToSection(section.id);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-[12px] font-medium transition-colors hover:bg-secondary/50 flex items-center gap-2 ${
                      activeSection === section.id
                        ? 'bg-secondary/50 text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        expandedSections.has(section.id) ? 'rotate-90' : ''
                      }`}
                    />
                    <span className="inline">{getSectionTitle(section)}</span>
                  </button>
                  {expandedSections.has(section.id) &&
                    section.blocks?.map((block) => {
                      const title =
                        block.title ||
                        block.content?.match(/^#+\s+(.+)$/m)?.[1] ||
                        (block.type === 'questions' ? 'Opdrachten' : block.id);
                      return (
                        <button
                          key={block.id}
                          onClick={() => scrollToSection(block.id)}
                          className={`w-full text-left px-4 py-1 rounded text-[11px] transition-colors hover:bg-secondary/50 ml-6 ${
                            activeSection === block.id
                              ? 'bg-secondary/50 text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span className="inline">{title}</span>
                        </button>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
