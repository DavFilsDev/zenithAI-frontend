import type { CSSProperties } from 'react';

export const ProductPreview = () => {
  return (
    <div
      aria-label="Chat preview"
      className="overflow-hidden rounded-[var(--radius)] border border-border bg-surface"
    >
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-label text-text-tertiary uppercase">Conversation</p>
      </div>
      <div className="space-y-8 p-4">
        <div className="flex justify-end">
          <div
            data-preview-step
            style={{ '--preview-delay': '0ms' } as CSSProperties}
            className="max-w-[80%] rounded-[var(--radius)] border border-border bg-raised px-4 py-3 text-body text-text"
          >
            How do I reverse a list in Python?
          </div>
        </div>
        <div className="space-y-3 text-body text-text">
          <p data-preview-step style={{ '--preview-delay': '400ms' } as CSSProperties}>
            Use slicing to create a reversed copy of the list.
          </p>
          <div
            data-preview-step
            style={{ '--preview-delay': '900ms' } as CSSProperties}
            className="overflow-hidden rounded-[var(--radius)] border border-border bg-raised"
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="font-mono text-small text-text-secondary">python</span>
              <span className="font-mono text-small text-text-tertiary">Copy</span>
            </div>
            <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-5 text-text">
              <code>{`items = [1, 2, 3]
reversed_items = items[::-1]

print(reversed_items)`}</code>
            </pre>
          </div>
          <span
            data-preview-caret
            aria-hidden="true"
            style={{ '--preview-delay': '1400ms' } as CSSProperties}
            className="inline-block h-4 w-0.5 bg-accent align-middle"
          />
        </div>
        <div
          data-preview-step
          style={{ '--preview-delay': '2200ms' } as CSSProperties}
          className="rounded-[var(--radius)] border border-border bg-raised px-4 py-3 text-ui text-text-tertiary"
        >
          Message Zenith AI
        </div>
      </div>
    </div>
  );
};
