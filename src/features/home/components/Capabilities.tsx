import type { CSSProperties } from 'react';
import { useReveal } from '../../../shared/hooks/useReveal';

const capabilities = [
  {
    term: 'Streaming responses',
    description: 'Replies appear token by token as they are generated.',
  },
  {
    term: 'Markdown and code',
    description: 'Messages render formatted text, tables, and syntax-highlighted code blocks.',
  },
  {
    term: 'Conversation history',
    description: 'Create, rename, delete, and return to previous conversations.',
  },
  {
    term: 'Session persistence',
    description: 'Sign in and continue after reloading the page.',
  },
  {
    term: 'Theme options',
    description: 'Switch between dark and light themes.',
  },
  {
    term: 'Service status',
    description: 'See when the service is available or starting.',
  },
];

export const Capabilities = () => {
  useReveal();

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
      <h2 className="sr-only">Capabilities</h2>
      <dl className="grid gap-x-12 md:grid-cols-2">
        {capabilities.map((item, index) => (
          <div
            key={item.term}
            data-reveal
            style={{ '--i': index } as CSSProperties}
            className="border-t border-border-subtle py-6"
          >
            <dt className="text-h3 text-text">{item.term}</dt>
            <dd className="mt-2 text-body text-text-secondary">{item.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
