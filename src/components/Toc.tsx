import { useEffect, useRef } from "react";
import type { TocItem } from "../lib/directory";

type Props = {
  items: TocItem[];
  activeId: string | undefined;
  onNavigate?: () => void;
};

const INDENT = { 2: "pl-2", 3: "pl-4", 4: "pl-7" } as const;

/** Table of contents. Unlinked items (no element on the page) render as plain labels. */
export function Toc({ items, activeId, onNavigate }: Props) {
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
        {items.map(({ section, count, linked }) => {
          const isCategory = section.depth === 2;
          const active = linked && section.id === activeId;
          const className = [
            "flex items-center justify-between gap-3 rounded-md py-1 pr-2",
            INDENT[section.depth],
            isCategory ? "font-semibold text-fg" : linked ? "text-muted transition-colors hover:text-fg" : "text-faint",
            active && !isCategory ? "bg-surface text-fg" : "",
          ].join(" ");
          const content = (
            <>
              <span className="truncate">{section.title}</span>
              {count > 0 && <span className="text-[11px] tabular-nums text-faint">{count}</span>}
            </>
          );

          return (
            <li key={section.id} className={isCategory ? "pt-4 first:pt-0" : undefined}>
              {linked ? (
                <a href={`#${section.id}`} onClick={onNavigate} aria-current={active ? "location" : undefined} className={className}>
                  {content}
                </a>
              ) : (
                <span className={className}>{content}</span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
