import { useEffect } from 'react';

export const useReveal = (root?: ParentNode | null) => {
  useEffect(() => {
    const scope = root ?? document;
    const elements = Array.from(scope.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (elements.length === 0) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((element) => {
        element.setAttribute('data-revealed', 'true');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          const target = entry.target as HTMLElement;
          target.setAttribute('data-revealed', 'true');
          observer.unobserve(target);
        });
      },
      { threshold: 0.15 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [root]);
};
