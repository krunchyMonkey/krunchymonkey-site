export function OpenBench() {
  return (
    <div className="open-bench">
      <header className="bench-heading">
        <span className="bench-emblem" aria-hidden="true">✦</span>
        <div>
          <h2>Open Bench</h2>
          <p>A little corner of the internet for curious builders.</p>
        </div>
      </header>
      <div className="retro-tabs" aria-label="Open Bench preview">
        <span className="retro-tab is-active">★ Featured</span>
        <span className="retro-tab">What Changed</span>
        <span className="retro-tab">Contribute</span>
      </div>
      <section className="bench-section">
        <h3>★ Featured Work</h3>
        <p>First up: the workstation itself. Built with curiosity, refined with care.</p>
        <div className="bench-cards">
          <article className="bench-card">
            <span className="bench-card-art" aria-hidden="true">⌘</span>
            <strong>KrunchOS</strong>
            <small>Architecture, interfaces, and small deliberate decisions.</small>
          </article>
          <article className="bench-card">
            <span className="bench-card-art alt" aria-hidden="true">▧</span>
            <strong>Tracing Guatemala</strong>
            <small>A research workspace designed around researchers.</small>
          </article>
        </div>
      </section>
      <section className="bench-section bench-invitation">
        <h3>Pull up a chair.</h3>
        <p>
          Open Bench contributions are planned for v1.1. For now, you can follow the
          project’s progress in its public repository.
        </p>
        <a href="https://github.com/krunchyMonkey/krunchymonkey-site" target="_blank" rel="noopener noreferrer">
          View the workshop on GitHub ↗
        </a>
      </section>
    </div>
  );
}
