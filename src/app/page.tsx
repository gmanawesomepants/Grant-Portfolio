"use client";

import { useEffect, useState, useRef } from "react";
import { initThread, cleanupThread } from "@/animations/thread";
import { initBlueprint, cleanupBlueprint } from "@/animations/suitBlueprint";
import { initContactReveal, cleanupContactReveal } from "@/animations/contactReveal";
import { initServicesUnfold, cleanupServicesUnfold } from "@/animations/servicesUnfold";
import FittingRoom from "@/components/FittingRoom";

/* ── Configuration ── */

const CONFIG = {
  name: "Grant",
  lastName: "Mahn",
  role: "SYSTEMS TAILOR",
  calendlyUrl: "https://calendly.com/YOUR_LINK",
  githubUrl: "https://github.com/gmanawesomepants",
  linkedinUrl: "https://www.linkedin.com/in/grant-mahn",
  instagramUrl: "https://www.instagram.com/grantmahn_/",
};

const TICKER_TEXT =
  "THOMPSON SAMPLING ML · 37+ DATABASE TABLES · 5,300+ PASSING TESTS · 15+ CRM INTEGRATIONS · KUBERNETES · GDPR COMPLIANT · BEHAVIORAL CLUSTERING · CANARY DEPLOYMENTS · REDIS/BULLMQ · CI/CD PIPELINE";

/* ── Helpers ── */

function MetricDot() {
  return <span className="metric-dot" aria-hidden="true">&middot;</span>;
}

function RulerMarks() {
  const ticks = Array.from({ length: 14 }, (_, i) => i);
  const center = Math.floor(ticks.length / 2);
  return (
    <div className="ruler-marks">
      {ticks.map((_, i) => (
        <div key={i} className={`ruler-tick${i === center ? " center" : ""}`} />
      ))}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="section-divider" aria-hidden="true">
      <RulerMarks />
    </div>
  );
}

/* ── Scroll Animation Observer Hook ── */

function useScrollReveal() {
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Fire any .closer-fade child relative to card entry, not its own
            // viewport position — prevents closers from staying invisible on
            // short viewports where the card bottom never crosses the threshold.
            const closer = entry.target.querySelector<HTMLElement>(".closer-fade");
            if (closer) {
              const id = setTimeout(() => closer.classList.add("visible"), 400);
              timeouts.push(id);
            }
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    const targets = document.querySelectorAll(
      ".clip-reveal, .tag-enter, .fade-in, .service-panel"
    );
    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      timeouts.forEach(clearTimeout);
    };
  }, []);
}

/* ── Particle Field ── */

function ParticleCanvas({ visible }: { visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let canvasRect = { left: 0, top: 0 };
    const REPULSE_R = 150;
    const REPULSE_R_SQ = REPULSE_R * REPULSE_R;

    let particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      targetOpacity: number;
    }[] = [];

    // Extract amber color from CSS
    const style = getComputedStyle(document.documentElement);
    const amberHex = style.getPropertyValue("--color-amber").trim();
    const r = parseInt(amberHex.slice(1, 3), 16);
    const g = parseInt(amberHex.slice(3, 5), 16);
    const b = parseInt(amberHex.slice(5, 7), 16);

    function createParticles(w: number, h: number) {
      const count = Math.min(
        55,
        Math.max(40, Math.floor((w * h) / 40000))
      );
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          size: 0.5 + Math.random() * 1.5,
          opacity: 0,
          targetOpacity: 0.08 + Math.random() * 0.27,
        });
      }
    }

    function resizeCanvas() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return;

      const oldW = canvas!.width;
      const oldH = canvas!.height;
      canvas!.width = w;
      canvas!.height = h;

      // Cache rect for mousemove (avoids layout thrash)
      canvasRect = canvas!.getBoundingClientRect();

      if (particles.length === 0) {
        // First init
        createParticles(w, h);
      } else if (oldW > 0 && oldH > 0) {
        // Rescale existing particles instead of destroying them
        const sx = w / oldW;
        const sy = h / oldH;
        for (const p of particles) {
          p.x *= sx;
          p.y *= sy;
        }
      }
    }

    // Init
    resizeCanvas();

    // ResizeObserver on parent catches all size changes (including window resize)
    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(canvas.parentElement!);

    // Pause RAF when hero is off-screen
    const io = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        // Resume animation if hero scrolls back into view
        if (!wasVisible && isVisible) {
          animId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas.parentElement!);

    function animate() {
      if (!canvas || !ctx || !isVisible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        // Fade in
        if (p.opacity < p.targetOpacity) {
          p.opacity += 0.003;
        }

        // Mouse repulsion (squared distance avoids sqrt in common case)
        const dx = p.x - mx;
        const dy = p.y - my;
        const distSq = dx * dx + dy * dy;
        if (distSq < REPULSE_R_SQ && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (REPULSE_R - dist) / REPULSE_R;
          p.vx += (dx / dist) * force * 0.08;
          p.vy += (dy / dist) * force * 0.08;
        }

        // Damping
        p.vx *= 0.998;
        p.vy *= 0.998;

        p.x += p.vx;
        p.y += p.vy;

        // Edge wrapping
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
        if (p.y < -5) p.y = canvas.height + 5;
        if (p.y > canvas.height + 5) p.y = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    }

    animate();

    function onMouseMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX - canvasRect.left;
      mouseRef.current.y = e.clientY - canvasRect.top;
    }

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`hero-particles${visible ? " hero-particles-visible" : ""}`} />;
}

/* ── Custom Cursor ── */

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Disable on touch devices / small screens
    if (window.innerWidth <= 768 || "ontouchstart" in window) return;

    setEnabled(true);
    document.body.classList.add("has-custom-cursor");

    let rafId: number;
    const LERP = 0.18;

    function onMouseMove(e: MouseEvent) {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    }

    function updateCursor() {
      current.current.x += (target.current.x - current.current.x) * LERP;
      current.current.y += (target.current.y - current.current.y) * LERP;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${current.current.x - 10}px, ${current.current.y - 10}px)`;
      }
      rafId = requestAnimationFrame(updateCursor);
    }

    function onMouseOver(e: MouseEvent) {
      const el = e.target as HTMLElement;
      if (el.closest("a, button, [role='button']")) {
        setHovering(true);
      }
    }

    function onMouseOut(e: MouseEvent) {
      const el = e.target as HTMLElement;
      if (el.closest("a, button, [role='button']")) {
        setHovering(false);
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    rafId = requestAnimationFrame(updateCursor);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div ref={cursorRef} aria-hidden="true" className={`custom-cursor${hovering ? " hovering" : ""}`}>
      <div className="cursor-h" />
      <div className="cursor-v" />
    </div>
  );
}

/* ── Live Clock ── */

function LiveClock({ stageVisible }: { stageVisible: boolean }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "America/Los_Angeles",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`hero-clock${stageVisible ? " stage-visible" : ""}`}>
      SAN DIEGO, CA — {time}
    </div>
  );
}

/* ── Nav ── */

function Nav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.45);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav ${visible ? "visible" : ""}`}>
      <a href="#top" className="nav-logo" aria-label={`${CONFIG.name} ${CONFIG.lastName} home`}>
        <span className="nav-monogram" aria-hidden="true">
          <span className="nav-monogram-gm">G<span className="nav-monogram-m">M</span></span>
        </span>
        <span className="nav-logo-text">{CONFIG.name} {CONFIG.lastName}</span>
      </a>
      <ul className="nav-links">
        <li><a href="#work" className="nav-link">Pattern Book</a></li>
        <li><a href="#services" className="nav-link">Services</a></li>
        <li><a href="#about" className="nav-link">About</a></li>
        <li><a href="#fitting-room" className="nav-link">Get Fitted</a></li>
        <li><a href="#contact" className="nav-link">Contact</a></li>
      </ul>
    </nav>
  );
}

/* ── Hero Video (optional) ── */

function HeroVideo() {
  const [hasVideo, setHasVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function onCanPlay() {
      video!.play().catch(() => {});
      setHasVideo(true);
    }
    function onError() {
      setHasVideo(false);
    }

    video.addEventListener("canplaythrough", onCanPlay);
    video.addEventListener("error", onError);

    // Defer load so it doesn't compete with critical hero paint
    video.load();

    return () => {
      video.removeEventListener("canplaythrough", onCanPlay);
      video.removeEventListener("error", onError);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="none"
      className="hero-video"
      style={{ display: hasVideo ? "block" : "none" }}
    >
      <source src="/tailor-loop.webm" type="video/webm" />
      <source src="/tailor-loop.mp4" type="video/mp4" />
    </video>
  );
}

/* ── Page ── */

export default function Home() {
  const [loadStage, setLoadStage] = useState(0);
  const [contactState, setContactState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");
  const [contactData, setContactData] = useState({ name: "", email: "", service: "", message: "" });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setContactData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactState("submitting");
    setContactError("");

    // Wait for sequential cascade animation to complete
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }
      setContactState("success");
    } catch (err: unknown) {
      setContactError(err instanceof Error ? err.message : "Something went wrong.");
      setContactState("error");
    }
  };

  // Stitch line progressive fill — consecutive fields only
  const fieldValues = [contactData.name, contactData.email, contactData.service, contactData.message];
  let consecutiveFilled = 0;
  for (let i = 0; i < fieldValues.length; i++) {
    if (fieldValues[i]) consecutiveFilled = i + 1;
    else break;
  }
  const fillHeights = ['0%', '7%', '30%', '52%', '74%'];
  const fillHeight = contactState === "submitting" ? '100%' : fillHeights[consecutiveFilled];

  useScrollReveal();

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setLoadStage(3); return; }
    const t1 = setTimeout(() => setLoadStage(1), 100);
    const t2 = setTimeout(() => setLoadStage(2), 400);
    const t3 = setTimeout(() => setLoadStage(3), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Phase 3: Init scroll-linked animations (skip if user prefers reduced motion)
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const timer = setTimeout(() => {
      initThread();
      initBlueprint();
      initContactReveal();
      initServicesUnfold();
    }, 500);

    return () => {
      clearTimeout(timer);
      cleanupThread();
      cleanupBlueprint();
      cleanupContactReveal();
      cleanupServicesUnfold();
    };
  }, []);

  const entered = loadStage >= 3 ? " entered" : "";

  return (
    <>
      <a href="#work" className="skip-to-content">Skip to content</a>
      <Nav />
      <CustomCursor />

      {/* ── 1. HERO ── */}
      <section id="top" className={`hero hero-stage-${loadStage}`}>
        <div className="hero-pinstripes" aria-hidden="true" />
        <HeroVideo />
        <div className="hero-breathing" />
        <ParticleCanvas visible={loadStage >= 2} />

        <div className="hero-content">
          <h1 className={`hero-name hero-anim-name${entered}`}>
            {CONFIG.name}
            <br />
            {CONFIG.lastName}
          </h1>
          <p className={`hero-role hero-anim-role${entered}`}>{CONFIG.role}</p>
          <p className={`hero-tagline hero-anim-tagline${entered}`}>
            I build AI systems that actually work.
          </p>
          <div className={`hero-dash hero-anim-dash${entered}`} />
          <p className="hero-mantra">
            <span className={`hero-anim-mantra-1${entered}`}>Measured.</span>{" "}
            <span className={`hero-anim-mantra-2${entered}`}>Cut.</span>{" "}
            <span className={`hero-anim-mantra-3${entered}`}>Deployed.</span>
          </p>
          <a href="#contact" className={`cta-button hero-anim-cta${entered}`}>
            Book a Call
          </a>
        </div>

        <div className={`scroll-indicator${loadStage >= 3 ? " stage-visible" : ""}`}>
          <div className="scroll-indicator-line" />
          <span className="scroll-indicator-text">Scroll</span>
        </div>

        <LiveClock stageVisible={loadStage >= 3} />
      </section>

      {/* ── 2. WORK — The Pattern Book ── */}
      <SectionDivider />
      <section id="work" className="section-wrapper">
        <div className="garment-tag tag-enter">THE PATTERN BOOK</div>
        <h2 className="section-heading clip-reveal">Systems I&apos;ve Built</h2>

        <div className="stagger work-card-stack">
          {/* Card 1 */}
          <article className="case-card fade-in" tabIndex={0} aria-label="AI Orchestration Platform for Revenue Teams">
            <span className="case-card-number">I/III</span>
            <p className="case-card-category">AI ORCHESTRATION</p>
            <h3 className="case-card-title">
              AI Orchestration Platform for Revenue Teams
            </h3>
            <p className="case-card-desc">
              Solo-designed and built an ML-driven platform that coordinates
              existing sales tools — Apollo, Lemlist, HubSpot, Salesforce —
              instead of replacing them. The system learns which outreach
              approach works best for each prospect type and optimizes
              automatically.
            </p>
            <p className="case-card-metrics">
              37+ database tables<MetricDot />Thompson Sampling ML engine
              <MetricDot />Behavioral clustering<MetricDot />15+ CRM
              integrations<MetricDot />TypeScript/Prisma/Node.js
              <MetricDot />Redis/BullMQ processing<MetricDot />ML model registry
              with canary deployments<MetricDot />GDPR-compliant architecture
              <MetricDot />Full CI/CD pipeline<MetricDot />5,300+ passing tests
              <MetricDot />Kubernetes deployment
            </p>
            <p className="case-card-closer closer-fade">
              Enterprise-grade system. One engineer. Currently in production.
            </p>
          </article>

          {/* Card 2 */}
          <article className="case-card fade-in" tabIndex={0} aria-label="Full-Stack AI Infrastructure — Early-Stage Startup">
            <span className="case-card-number">II/III</span>
            <p className="case-card-category">FULL-STACK BUILD</p>
            <h3 className="case-card-title">
              Full-Stack AI Infrastructure — Early-Stage Startup
            </h3>
            <p className="case-card-desc">
              Designed and deployed the complete technical stack for a startup
              entering the AI consulting space. Took the founder&apos;s concept
              and turned it into a fully operational digital presence and
              AI-powered product suite.
            </p>
            <p className="case-card-metrics">
              Node.js/TypeScript full stack<MetricDot />Next.js frontend
              <MetricDot />Strapi headless CMS<MetricDot />AI-powered
              Infrastructure Analyzer<MetricDot />AI-powered Proposal Generator
              <MetricDot />Persistent AI chat assistant<MetricDot />Custom intake
              forms with Mailgun<MetricDot />Complete API layer with rate
              limiting<MetricDot />Full DevOps pipeline<MetricDot />Custom
              graphic design<MetricDot />5 pages, every endpoint
            </p>
            <p className="case-card-closer closer-fade">
              Zero to production. Solo engineer. Every layer — backend, frontend,
              AI, design, DevOps.
            </p>
          </article>

          {/* Card 3 */}
          <article className="case-card fade-in" tabIndex={0} aria-label="Brand Strategy &amp; Operations System — Premium Consumer Brand">
            <span className="case-card-number">III/III</span>
            <p className="case-card-category">BRAND &amp; OPERATIONS</p>
            <h3 className="case-card-title">
              Brand Strategy &amp; Operations System — Premium Consumer Brand
            </h3>
            <p className="case-card-desc">
              Developed comprehensive go-to-market infrastructure for a premium
              men&apos;s apparel brand, from market research to supply chain to
              quality assurance.
            </p>
            <p className="case-card-metrics">
              PMF Research Strategy<MetricDot />Supply Chain Audit Checklist
              <MetricDot />Customer Discovery Script<MetricDot />Brand Identity
              System<MetricDot />Sample Evaluation System (v3.4)
              <MetricDot />Golden sample lock-in methodology<MetricDot />Extended
              wear testing protocols<MetricDot />Tech pack specs with grading
              deltas<MetricDot />Multi-tester validation framework
              <MetricDot />Competitor benchmarking
            </p>
            <p className="case-card-closer closer-fade">
              Not just strategy decks. Operational systems designed to ship
              product.
            </p>
          </article>
        </div>
      </section>

      {/* ── 3. SUIT SPEC SHEET ── */}
      <SectionDivider />
      <section id="suit-spec" className="section-wrapper suit-spec">
        <div className="garment-tag tag-enter">REVENUEOS · PATTERN I/III</div>
        <h2 className="section-heading clip-reveal">System Blueprint</h2>

        {/* Desktop: SVG blueprint drawn by GSAP */}
        <div className="blueprint-svg-container">
          {/* SVG is injected here by suitBlueprint.ts */}
        </div>

        {/* Mobile fallback: spec list */}
        <div className="blueprint-mobile-fallback stagger">
          {[
            "TypeScript / Prisma / Node.js",
            "Thompson Sampling ML Engine",
            "Redis / BullMQ Processing",
            "Kubernetes Deployment",
            "5,300+ Passing Tests",
            "GDPR-Compliant Architecture",
            "15+ CRM Integrations",
            "Full CI/CD Pipeline",
          ].map((spec, i) => (
            <div key={i} className="blueprint-mobile-item fade-in">
              {spec}
            </div>
          ))}
        </div>

        <p className="suit-spec-closer">
          Solo build. Currently in production.
        </p>
      </section>

      {/* ── 4. TICKER ── */}
      <div className="ticker-section" aria-hidden="true">
        <div className="ticker-track">
          <span className="ticker-content">{TICKER_TEXT}&nbsp;&nbsp;·&nbsp;&nbsp;</span>
          <span className="ticker-content">{TICKER_TEXT}&nbsp;&nbsp;·&nbsp;&nbsp;</span>
        </div>
      </div>

      {/* ── 5. SERVICES ── */}
      <SectionDivider />
      <section id="services" className="section-wrapper">
        <div className="garment-tag tag-enter">SERVICES</div>
        <h2 className="section-heading clip-reveal">How I Work</h2>

        <div className="services-pattern" style={{ marginTop: "2rem" }}>
          <article className="service-panel panel-measure">
            <div className="panel-inner" tabIndex={0} aria-label="AI Strategy Audit — measurement and roadmap">
              <span className="service-phase">MEASURE</span>
              <h3 className="service-title">AI Strategy Audit</h3>
              <p className="service-body">
                Every system starts with measurement. I assess your operations,
                identify the 2–3 highest-ROI opportunities for AI, and deliver a
                concrete roadmap. Not off-the-rack consulting — a pattern cut to
                your business.
              </p>
              <p className="service-note">
                Engagements start with a paid strategy audit.
              </p>
            </div>
          </article>

          <div className="fold-line fold-basting" aria-hidden="true" />

          <article className="service-panel panel-cut">
            <div className="panel-inner" tabIndex={0} aria-label="AI System Build — full construction and integration">
              <span className="service-phase">CUT</span>
              <h3 className="service-title">AI System Build</h3>
              <p className="service-body">
                Custom AI systems, cut from your requirements. The full
                construction — orchestration, agents, infrastructure — stitched
                into your existing operations. I don&apos;t hand you a demo and
                disappear. I build until the fit is right.
              </p>
            </div>
          </article>

          <div className="fold-line fold-backstitch" aria-hidden="true" />

          <article className="service-panel panel-fit">
            <div className="panel-inner" tabIndex={0} aria-label="Managed AI / Retainer — ongoing optimization and support">
              <span className="service-phase">FIT</span>
              <h3 className="service-title">Managed AI / Retainer</h3>
              <p className="service-body">
                Every system needs alterations after the first wear. I stay for
                monitoring, optimization, and new capabilities as your needs
                evolve. A fractional AI architect on call — for a fraction of what
                a full-time hire costs.
              </p>
            </div>
          </article>
        </div>
        <a href="#contact" className="services-cta">Request a Fitting &rarr;</a>
      </section>

      {/* ── 6. ABOUT ── */}
      <SectionDivider />
      <section id="about" className="section-wrapper about-section">
        <div className="garment-tag tag-enter">ABOUT</div>
        <div className="about-layout fade-in" style={{ marginTop: "2rem" }}>
          <div className="about-text">
            <p>
              Grant Mahn is an AI systems architect based in San Diego.
              Self-taught. No degree. No bootcamp. He builds the systems that
              make AI actually useful — not demos that die after a pitch, not
              prototypes that never see production. Real infrastructure that
              runs, learns, and scales. Every system on this page was designed,
              architected, and deployed by one person.
            </p>
            <h2 className="about-closer">
              Former tailor. Same discipline, different material.
            </h2>
          </div>

          <div className="about-photo">
            <div className="about-photo-placeholder">
              <div className="about-photo-pin" />
              {/* <img src="/portrait.jpg" alt="Grant Mahn" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> */}
            </div>
            <div className="about-photo-tag">
              <div className="garment-tag">Grant Mahn · Founder</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. THE FITTING ROOM ── */}
      <SectionDivider />
      <section id="fitting-room" className="section-wrapper">
        <div className="garment-tag tag-enter">THE FITTING ROOM</div>
        <h2 className="section-heading clip-reveal">Get Fitted.</h2>
        <p
          className="fade-in"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "var(--color-text-muted)",
            marginTop: "0.5rem",
          }}
        >
          Enter your specs. See what a bespoke system looks like.
        </p>
        <FittingRoom calendlyUrl={CONFIG.calendlyUrl} />
      </section>

      {/* ── 8. CONTACT ── */}
      <SectionDivider />
      <section id="contact" className="section-wrapper contact-section">
        {contactState === "success" ? (
          <div className="contact-success-wrapper">
            <p className="contact-success">Received. I&apos;ll be in touch.</p>
            <span className="contact-success-thread" aria-hidden="true" />
          </div>
        ) : (
          <div className="contact-layout">
            <div className="contact-left">
              <h2 className="contact-heading">Request a Fitting</h2>
              <p className="contact-sub">
                Tell me what needs building.<br />
                I&apos;ll follow up within 24 hours.
              </p>
            </div>

            <div className="contact-right">
              <span className="contact-ticket-header">Fitting Request</span>

              <form onSubmit={handleContactSubmit} className="contact-form">
                <div
                  className={`stitch-track ${contactState === "submitting" ? "stitch-pulling" : ""}`}
                  aria-hidden="true"
                  style={{ '--fill-height': fillHeight } as React.CSSProperties}
                >
                  <div className="stitch-line" />
                  <span className={`stitch-dot ${contactData.name ? "dot-active" : ""} ${focusedField === "name" ? "dot-focused" : ""}`} />
                  <span className={`stitch-dot ${contactData.email ? "dot-active" : ""} ${focusedField === "email" ? "dot-focused" : ""}`} />
                  <span className={`stitch-dot ${contactData.service ? "dot-active" : ""} ${focusedField === "service" ? "dot-focused" : ""}`} />
                  <span className={`stitch-dot ${contactData.message ? "dot-active" : ""} ${focusedField === "message" ? "dot-focused" : ""}`} />
                </div>

                <div className={`contact-step ${contactData.name ? "step-filled" : ""}`}>
                  <div className="step-number" aria-hidden="true">01</div>
                  <div className="fitting-field">
                    <label htmlFor="contact-name" className="fitting-label">Name</label>
                    <input
                      type="text" id="contact-name" name="name" required
                      value={contactData.name} onChange={handleContactChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      className="fitting-input" placeholder="Your name"
                      disabled={contactState === "submitting"}
                    />
                  </div>
                </div>

                <div className={`contact-step ${contactData.email ? "step-filled" : ""}`}>
                  <div className="step-number" aria-hidden="true">02</div>
                  <div className="fitting-field">
                    <label htmlFor="contact-email" className="fitting-label">Email</label>
                    <input
                      type="email" id="contact-email" name="email" required
                      value={contactData.email} onChange={handleContactChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className="fitting-input" placeholder="you@company.com"
                      disabled={contactState === "submitting"}
                    />
                  </div>
                </div>

                <div className={`contact-step ${contactData.service ? "step-filled" : ""}`}>
                  <div className="step-number" aria-hidden="true">03</div>
                  <div className="fitting-field">
                    <label htmlFor="contact-service" className="fitting-label">What needs tailoring?</label>
                    <select
                      id="contact-service" name="service"
                      value={contactData.service} onChange={handleContactChange}
                      onFocus={() => setFocusedField("service")}
                      onBlur={() => setFocusedField(null)}
                      className="fitting-select" disabled={contactState === "submitting"}
                    >
                      <option value="">Select a service</option>
                      <option value="AI Automation">AI Automation</option>
                      <option value="Sales Infrastructure">Sales Infrastructure</option>
                      <option value="System Integration">System Integration</option>
                      <option value="Something Else">Something Else</option>
                    </select>
                  </div>
                </div>

                <div className={`contact-step ${contactData.message ? "step-filled" : ""}`}>
                  <div className="step-number" aria-hidden="true">04</div>
                  <div className="fitting-field">
                    <label htmlFor="contact-message" className="fitting-label">Describe the job</label>
                    <textarea
                      id="contact-message" name="message" required rows={5}
                      value={contactData.message} onChange={handleContactChange}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      className="fitting-input contact-textarea"
                      placeholder="What's broken, what's missing, or what needs to exist?"
                      disabled={contactState === "submitting"}
                    />
                  </div>
                </div>

                {contactState === "error" && <p className="contact-error">{contactError}</p>}

                <button type="submit" disabled={contactState === "submitting"} className="cta-button contact-submit">
                  {contactState === "submitting" ? "Sending..." : "Submit Request"}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* ── 9. FOOTER ── */}
      <SectionDivider />
      <footer className="footer">
        <div className="footer-top">
          <span className="footer-copy">© 2026 Grant Mahn<span className="footer-signature"> — GM</span></span>
          <div className="footer-links">
            <a href={CONFIG.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href={CONFIG.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href={CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
        <p className="footer-handbuilt">
          0 templates. 0 plugins. Handbuilt.
        </p>
        <p className="footer-colophon">
          Measured, cut, and stitched by hand.
        </p>
      </footer>
    </>
  );
}
