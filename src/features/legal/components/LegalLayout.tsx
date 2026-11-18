import { useEffect, useState, type ReactNode } from 'react';
import { SiteFooter } from '../../../shared/layout/SiteFooter';
import { SiteHeader } from '../../../shared/layout/SiteHeader';

interface LegalSection {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
  children: ReactNode;
}

export const LegalLayout = ({ title, updatedAt, sections, children }: LegalLayoutProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const currentActiveId = activeId ?? sections[0]?.id ?? null;

  useEffect(() => {
    if (sections.length === 0 || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 1] },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-text">
      <SiteHeader />

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:py-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,68ch)_minmax(180px,220px)] lg:items-start lg:justify-between lg:gap-12">
          <main id="main" className="min-w-0">
            <header className="border-b border-border pb-6">
              <h1 className="text-h1 text-text">{title}</h1>
              <p className="mt-3 font-mono text-small text-text-tertiary">
                Last updated: {updatedAt}
              </p>
            </header>

            <article className="prose mt-8">{children}</article>
          </main>

          <aside className="hidden lg:sticky lg:top-8 lg:block">
            <nav aria-label="Table of contents">
              <p className="font-mono text-label tracking-[0.06em] text-text-tertiary uppercase">
                On this page
              </p>
              <ul className="mt-4 flex flex-col gap-2 border-l border-border">
                {sections.map((section) => {
                  const isActive = section.id === currentActiveId;

                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        aria-current={isActive ? 'location' : undefined}
                        className={
                          isActive
                            ? 'block border-l border-accent-text py-1 pl-4 text-small text-text transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:outline-none'
                            : 'block border-l border-transparent py-1 pl-4 text-small text-text-secondary transition-colors duration-fast hover:text-text focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:outline-none'
                        }
                      >
                        {section.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};
