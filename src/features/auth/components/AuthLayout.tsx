import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

const previewLines = [
  'const answer = await zenith.chat({',
  "  prompt: 'Summarize this function',",
  '});',
  '',
  'console.log(answer.text);',
];

export const AuthLayout = ({ title, children }: AuthLayoutProps) => {
  return (
    <div className="min-h-dvh bg-canvas text-text lg:grid lg:grid-cols-[minmax(0,480px)_1fr]">
      <main className="flex min-h-dvh items-center justify-center px-4 py-12">
        <div className="w-full max-w-[480px]">
          <h1 className="text-h2 text-text">{title}</h1>
          <div className="mt-8">{children}</div>
        </div>
      </main>

      <aside className="hidden border-l border-border bg-surface px-12 py-12 lg:flex lg:flex-col lg:justify-center">
        <div className="max-w-md">
          <p className="font-mono text-label text-text-tertiary uppercase">Zenith AI</p>
          <p className="mt-4 text-h3 text-text">A chat interface for code and writing tasks.</p>
          <p className="mt-3 text-body text-text-secondary">
            Sign in to continue your conversations.
          </p>

          <div
            aria-hidden="true"
            className="mt-8 overflow-hidden rounded-[var(--radius)] border border-border bg-raised"
          >
            <div className="border-b border-border px-4 py-2 font-mono text-label text-text-tertiary uppercase">
              example.ts
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-small leading-5 text-text-secondary">
              <code>{previewLines.join('\n')}</code>
            </pre>
          </div>
        </div>
      </aside>
    </div>
  );
};
