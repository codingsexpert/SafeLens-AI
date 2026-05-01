import { ThemeToggle } from "@/components/theme-toggle";
import { TriageWorkbench } from "@/components/triage-workbench";

export default function Home() {
  return (
    <main className="page-shell simple-home">
      <div className="mesh-grid" />
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="ambient ambient-center" />

      <section className="simple-hero panel glass">
        <div className="simple-hero-copy">
          <div className="hero-topline">
            <div>
              <span className="kicker">Kill Suspicious</span>
              <p className="hero-label">AI Security Copilot</p>
            </div>
            <ThemeToggle />
          </div>
          <h1 className="hero-title">One premium workspace for suspicious content triage.</h1>
          <p className="hero-text compact-hero-text">
            Check suspicious emails, links, screenshots, PDFs, and QR codes in
            one place and get a simple answer fast.
          </p>
          <div className="hero-strip">
            <span>Fast verdicts</span>
            <span>QR + PDF + OCR</span>
            <span>Hindi + English</span>
          </div>
        </div>
      </section>

      <TriageWorkbench />
    </main>
  );
}
