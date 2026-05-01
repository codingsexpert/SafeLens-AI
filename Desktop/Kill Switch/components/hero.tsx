"use client";

const trustedBy = ["Stripe", "Vercel", "Notion", "Linear", "Figma"];

export function Hero() {
  const scrollToWorkbench = () => {
    document.getElementById("workbench")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/10 dark:bg-primary/10 blur-[120px] animate-pulse-glow" />
        {/* Secondary accent */}
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 dark:bg-primary/5 blur-[100px] animate-float" />
        {/* Grid pattern - Light mode */}
        <div 
          className="absolute inset-0 opacity-[0.08] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Grid pattern - Dark mode overlay */}
        <div 
          className="absolute inset-0 opacity-0 dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-up">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">
            AI-Powered Security Intelligence
          </span>
        </div>

        {/* Main Headline */}
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-up text-balance"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="text-foreground">Security that</span>
          <br />
          <span className="gradient-text">thinks ahead.</span>
        </h1>

        {/* Subheadline */}
        <p 
          className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 animate-fade-up text-pretty"
          style={{ animationDelay: "0.2s" }}
        >
          Detect phishing, analyze threats, and protect your organization with 
          enterprise-grade AI. Get clear verdicts in seconds, not hours.
        </p>

        {/* CTA Buttons */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <button 
            onClick={scrollToWorkbench}
            className="w-full sm:w-auto px-8 py-4 text-base font-medium text-white dark:text-primary-foreground gradient-accent rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            Try It Now
          </button>
          <button className="w-full sm:w-auto px-8 py-4 text-base font-medium text-foreground glass rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all group flex items-center justify-center gap-2">
            <span>Watch Demo</span>
            <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Trusted By */}
        <div 
          className="animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="text-sm text-muted uppercase tracking-widest mb-6">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {trustedBy.map((company) => (
              <span 
                key={company} 
                className="text-muted-foreground/60 text-lg font-medium hover:text-foreground transition-colors cursor-default"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
