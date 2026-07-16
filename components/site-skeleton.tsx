function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return <div className={`site-skeleton-block ${className}`.trim()} aria-hidden="true" />;
}

export function SiteSkeleton() {
  return (
    <main className="site-shell site-skeleton-page" aria-busy="true" aria-live="polite">
      <header className="site-header">
        <div className="site-header-inner">
          <SkeletonBlock className="site-skeleton-logo" />
          <div className="site-skeleton-nav">
            <SkeletonBlock className="site-skeleton-nav-item" />
            <SkeletonBlock className="site-skeleton-nav-item" />
            <SkeletonBlock className="site-skeleton-nav-item" />
            <SkeletonBlock className="site-skeleton-nav-item" />
          </div>
          <SkeletonBlock className="site-skeleton-language" />
        </div>
      </header>

      <section className="site-skeleton-section">
        <div className="site-skeleton-shell">
          <div className="site-skeleton-breadcrumb">
            <SkeletonBlock className="site-skeleton-breadcrumb-item" />
            <SkeletonBlock className="site-skeleton-breadcrumb-separator" />
            <SkeletonBlock className="site-skeleton-breadcrumb-item site-skeleton-breadcrumb-item-wide" />
          </div>

          <div className="site-skeleton-hero">
            <div className="site-skeleton-copy">
              <SkeletonBlock className="site-skeleton-eyebrow" />
              <SkeletonBlock className="site-skeleton-title" />
              <SkeletonBlock className="site-skeleton-title site-skeleton-title-short" />
              <SkeletonBlock className="site-skeleton-line" />
              <SkeletonBlock className="site-skeleton-line" />
              <SkeletonBlock className="site-skeleton-line site-skeleton-line-short" />
            </div>
            <SkeletonBlock className="site-skeleton-media" />
          </div>

          <div className="site-skeleton-filter-row">
            <SkeletonBlock className="site-skeleton-chip" />
            <SkeletonBlock className="site-skeleton-chip" />
            <SkeletonBlock className="site-skeleton-chip" />
            <SkeletonBlock className="site-skeleton-chip" />
          </div>

          <div className="site-skeleton-card-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <article className="site-skeleton-card" key={index}>
                <SkeletonBlock className="site-skeleton-card-media" />
                <div className="site-skeleton-card-copy">
                  <SkeletonBlock className="site-skeleton-card-title" />
                  <SkeletonBlock className="site-skeleton-card-line" />
                  <SkeletonBlock className="site-skeleton-card-line site-skeleton-card-line-short" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-skeleton-footer">
        <div className="site-skeleton-footer-grid">
          <div className="site-skeleton-footer-column">
            <SkeletonBlock className="site-skeleton-footer-title" />
            <SkeletonBlock className="site-skeleton-footer-line" />
            <SkeletonBlock className="site-skeleton-footer-line" />
            <SkeletonBlock className="site-skeleton-footer-line site-skeleton-footer-line-short" />
          </div>
          <div className="site-skeleton-footer-column">
            <SkeletonBlock className="site-skeleton-footer-title" />
            <SkeletonBlock className="site-skeleton-footer-line" />
            <SkeletonBlock className="site-skeleton-footer-line" />
            <SkeletonBlock className="site-skeleton-footer-line" />
          </div>
          <div className="site-skeleton-footer-column">
            <SkeletonBlock className="site-skeleton-footer-title" />
            <SkeletonBlock className="site-skeleton-footer-line" />
            <SkeletonBlock className="site-skeleton-footer-line" />
            <SkeletonBlock className="site-skeleton-footer-line site-skeleton-footer-line-short" />
          </div>
        </div>
      </footer>
    </main>
  );
}
