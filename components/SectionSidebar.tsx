"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SectionItem {
  id: string;
  title: string;
  timestamp?: string;
}

interface SectionSidebarProps {
  sections: SectionItem[];
  showTimestamps?: boolean;
  className?: string;
}

export function SectionSidebar({ sections, showTimestamps = false, className = "" }: SectionSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!sections || sections.length === 0) return null;

  return (
    <aside className={cn("hidden xl:flex flex-col w-[280px]", className)}>
      <div className="p-5 pb-3">
        <h2 className="text-sm font-medium text-foreground mb-3">Secties</h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 xl:overflow-y-auto">
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-md text-[13px] transition-colors",
                  "hover:bg-secondary/80",
                  activeSection === section.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <div className="flex flex-col gap-0.5">
                  {showTimestamps && section.timestamp && (
                    <span className="text-[10px] text-muted-foreground/70 font-mono">
                      {section.timestamp}
                    </span>
                  )}
                  <span className="line-clamp-2 leading-snug">{section.title}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
      </div>
    </aside>
  );
}
