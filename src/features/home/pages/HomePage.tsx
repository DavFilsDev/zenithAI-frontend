import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { SiteFooter } from '../../../shared/layout/SiteFooter';
import { SiteHeader } from '../../../shared/layout/SiteHeader';
import { getButtonClassName } from '../../../shared/ui/buttonStyles';
import { useSession } from '../../../shared/auth/useSession';
import { Capabilities } from '../components/Capabilities';
import { ProductPreview } from '../components/ProductPreview';

const heroItem = (index: number) =>
  ({ 'data-hero-item': '', style: { '--i': index } as CSSProperties }) as const;

export const HomePage = () => {
  const { user } = useSession();

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-text">
      <SiteHeader />

      <main id="main" className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-12 lg:py-24">
          <div className="flex flex-col items-start lg:col-span-7">
            <p {...heroItem(0)} className="font-mono text-label text-text-tertiary uppercase">
              AI chat
            </p>
            <h1
              {...heroItem(1)}
              className="mt-4 text-h1 tracking-[-0.015em] text-text sm:text-display"
            >
              Chat for code and writing
            </h1>
            <p {...heroItem(2)} className="mt-4 max-w-2xl text-body text-text-secondary">
              Ask questions, review code, and draft text in a streaming conversation. Free to use
              with no credits or payment required.
            </p>
            <div {...heroItem(3)} className="mt-8 flex flex-wrap items-center gap-3">
              {user ? (
                <Link to="/chat" className={getButtonClassName({ variant: 'primary', size: 'lg' })}>
                  Open chat
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className={getButtonClassName({ variant: 'primary', size: 'lg' })}
                  >
                    Create account
                  </Link>
                  <Link
                    to="/login"
                    className={getButtonClassName({ variant: 'secondary', size: 'lg' })}
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>

          <div {...heroItem(4)} className="mt-12 lg:col-span-5 lg:mt-0">
            <ProductPreview />
          </div>
        </section>

        <Capabilities />
      </main>

      <SiteFooter />
    </div>
  );
};
