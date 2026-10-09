"use client";

import { useEffect, useState } from "react";
import { List, Menu } from "lucide-react";

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
      }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => {
      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) observer.unobserve(element);
      });
    };
  }, [items]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile floating button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        aria-label="Table of contents"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed right-0 top-0 h-full w-80 border-l border-border bg-card p-6 overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Inhoudsopgave</h3>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="rounded p-2 hover:bg-secondary"
              >
                ✕
              </button>
            </div>
            <nav className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  className={`block w-full text-left text-sm transition-colors ${
                    activeId === item.id
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block sticky top-24 self-start">
        <div className="mb-4 flex items-center gap-2">
          <List className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold">Inhoudsopgave</h3>
        </div>
        <nav className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`block w-full text-left text-sm transition-colors ${
                activeId === item.id
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
            >
              {item.title}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
