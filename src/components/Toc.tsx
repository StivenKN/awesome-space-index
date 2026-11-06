import { useEffect, useRef } from "react";
import type { Section } from "../lib/parse";

type Props = {
  sections: Section[];
  /** Visible entries per section, including entries in subsections. */
  counts: Map<string, number>;
  activeId: string | undefined;
  onNavigate?: () => void;
};

const INDENT = { 2: "pl-2", 3: "pl-4", 4: "pl-7" } as const;

/** Table of contents. The caller passes only sections that have visible entries. */
export function Toc({ sections, counts, activeId, onNavigate }: Props) {
  const navRef = useRef<HTMLElement>(null);

  // Keep the active link inside its scroll container ([data-toc-scroll]) without moving the page.
  useEffect(() => {
    const link = navRef.current?.querySelector<HTMLElement>('[aria-current="location"]');
    const scroller = link?.closest<HTMLElement>("[data-toc-scroll]");
    if (!link || !scroller) return;
    const top = link.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    if (top < scroller.scrollTop || top + link.offsetHeight > scroller.scrollTop + scroller.clientHeight) {
      scroller.scrollTo({ top: top - scroller.clientHeight / 3 });
    }
  }, [activeId]);

  return (
    <nav ref={navRef} aria-label="Sections">
      <ul className="space-y-px text-[13px]">
        {sections.map((section) => {
          const count = counts.get(section.id) ?? 0;
          const active = section.id === activeId;
          const isCategory = section.depth === 2;
          return (
            <li key={section.id} className={isCategory ? "pt-4 first:pt-0" : undefined}>
              <a
                href={`#${section.id}`}
                onClick={onNavigate}
                aria-current={active ? "location" : undefined}
                className={[
                  "flex items-center justify-between gap-3 rounded-md py-1 pr-2 transition-colors",
                  INDENT[section.depth],
                  isCategory ? "font-semibold text-fg" : "text-muted hover:text-fg",
                  active && !isCategory ? "bg-surface text-fg" : "",
                ].join(" ")}
              >
                <span className="truncate">{section.title}</span>
                <span className="text-[11px] tabular-nums text-faint">{count}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
