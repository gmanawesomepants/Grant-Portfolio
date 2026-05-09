"use client";

import { useEffect, useState, useRef } from "react";
import { initThread, cleanupThread } from "@/animations/thread";
import { initBlueprint, cleanupBlueprint } from "@/animations/suitBlueprint";
import { initContactReveal, cleanupContactReveal } from "@/animations/contactReveal";
import FittingRoom from "@/components/FittingRoom";
import PatternBook from "@/components/PatternBook";
import { DiagramOrchestration, DiagramFullStack, DiagramGradingGrid } from "@/components/case-diagrams";
import { AtelierIcon } from "@/components/icons/AtelierIcon";
import type { IconName } from "@/icons/paths";

const CATEGORY_ICONS: Record<string, IconName> = {
  'AI ORCHESTRATION': 'node',
  'FULL-STACK BUILD':  'grid',
  'BRAND & OPERATIONS': 'grading',
};

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

/* ── Nav (Pattern Bar — vertical tape-rule) ── */

const NAV_SECTIONS = [
  { id: "work", num: "01", label: "Pattern Book" },
  { id: "services", num: "02", label: "Services" },
  { id: "about", num: "03", label: "About" },
  { id: "fitting-room", num: "04", label: "Get Fitted" },
  { id: "contact", num: "05", label: "Contact" },
] as const;

function Nav() {
  const [activeId, setActiveId] = useState<string>("");
  const [engaged, setEngaged] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [markerTop, setMarkerTop] = useState(0);

  const navRef = useRef<HTMLElement>(null);
  // Tick centers: cached once after first paint (nav is fixed — they never move)
  const tickCentersRef = useRef<number[]>([]);

  useEffect(() => {
    // ── Cache tick centers once (they don't move) ─────────────────────────
    // Must run after first paint so the fixed nav is laid out.
    function cacheTicks() {
      if (!navRef.current) return;
      const els = navRef.current.querySelectorAll<HTMLElement>(".pattern-bar-tick");
      tickCentersRef.current = Array.from(els).map((el) => {
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2; // center of tick (accounts for translateY(-50%))
      });
    }

    // ── Main update: fresh section positions on every scroll event ────────
    //
    // WHY fresh instead of cached:
    // PatternBook (services section) uses GSAP pin:true, inserting a multi-viewport
    // spacer that pushes #about and #fitting-room down. Caching at mount captures
    // pre-spacer positions, making those sections wrong by ~2000px.
    // Reading live via getBoundingClientRect() + scrollY costs ~0.05ms per event
    // (5 elements, browsers coalesce to one reflow) — negligible.
    function update() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      setEngaged(scrollY > vh * 0.8);

      // Live positions — immune to GSAP spacers, FittingRoom height changes, etc.
      const tops = NAV_SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return -1;
        return el.getBoundingClientRect().top + scrollY;
      });
      if (tops.some((t) => t < 0)) return;

      // Detection point: 40% from viewport top.
      // Less than 50% (center) so short sections like About activate promptly
      // when their content is clearly dominant, not only when their top hits midscreen.
      const detect = scrollY + vh * 0.4;

      // Before the first section — nothing active
      if (detect < tops[0]) {
        setActiveId("");
        if (tickCentersRef.current.length > 0) setMarkerTop(tickCentersRef.current[0]);
        return;
      }

      // Last section whose top is at or above the detection point
      let idx = 0;
      for (let i = tops.length - 1; i >= 0; i--) {
        if (tops[i] <= detect) { idx = i; break; }
      }

      setActiveId(NAV_SECTIONS[idx].id);

      // Progress 0→1 from this section's start to the next section's start
      const segStart = tops[idx];
      const segEnd =
        idx + 1 < tops.length
          ? tops[idx + 1]
          : document.documentElement.scrollHeight;
      const p = Math.max(0, Math.min(1, (detect - segStart) / (segEnd - segStart)));

      // Marker: interpolate between tick centers; clamp on last tick
      const ticks = tickCentersRef.current;
      if (ticks.length > 0) {
        const from = ticks[idx] ?? 0;
        const to   = ticks[Math.min(idx + 1, NAV_SECTIONS.length - 1)] ?? from;
        setMarkerTop(from + p * (to - from));
      }
    }

    function onResize() {
      cacheTicks(); // nav might reflow on resize
      update();
    }

    // rAF ensures GSAP spacers from PatternBook (mounted after Nav) are in the
    // DOM before we read tick positions
    requestAnimationFrame(() => {
      cacheTicks();
      update();
    });

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  }, []);


  return (
    <>
      <nav
        ref={navRef}
        className={`pattern-bar${engaged ? " engaged" : ""}${drawerOpen ? " drawer-open" : ""}`}
        aria-label="Sections"
      >
        {/* Monogram — anchors top */}
        <a
          href="#top"
          className="pattern-bar-monogram"
          aria-label={`${CONFIG.name} ${CONFIG.lastName} home`}
        >
          <span className="pattern-bar-mono-mark" aria-hidden="true">
            <span className="pattern-bar-mono-gm">
              G<span className="pattern-bar-mono-m">M</span>
            </span>
          </span>
        </a>

        {/* The rule */}
        <div className="pattern-bar-rule" aria-hidden="true">
          {Array.from({ length: 64 }).map((_, i) => (
            <span
              key={i}
              className="pattern-bar-minor"
              style={{ top: `${(i / 63) * 100}%` }}
            />
          ))}
        </div>

        {/* Major ticks — sections */}
        <ul className="pattern-bar-ticks">
          {NAV_SECTIONS.map((section, i) => {
            const isActive = section.id === activeId;
            const top = (i / (NAV_SECTIONS.length - 1)) * 100;
            return (
              <li
                key={section.id}
                className={`pattern-bar-tick${isActive ? " active" : ""}`}
                style={{ top: `${top}%` }}
              >
                <a
                  href={`#${section.id}`}
                  className="pattern-bar-link"
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="pattern-bar-num">{section.num}</span>
                  <span className="pattern-bar-stub" aria-hidden="true" />
                  <span className="pattern-bar-label">{section.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Brass marker — top is a px value set by JS from real tick positions */}
        <span
          className="pattern-bar-marker"
          aria-hidden="true"
          style={{ top: `${markerTop}px` }}
        />

        {/* Mobile: tap ribbon to open drawer */}
        <button
          type="button"
          className="pattern-bar-tap"
          aria-label="Open navigation"
          onClick={() => setDrawerOpen((o) => !o)}
        />
      </nav>

      {/* Mobile drawer scrim */}
      {drawerOpen && (
        <div
          className="pattern-bar-scrim"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

/* ── Mobile Nav (top bar + slide-in drawer, ≤768px only) ── */

function MobileNav() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  // Track active section (same logic as desktop Nav)
  useEffect(() => {
    function update() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const detect = scrollY + vh * 0.4;

      const tops = NAV_SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return -1;
        return el.getBoundingClientRect().top + scrollY;
      });
      if (tops.some((t) => t < 0)) return;

      if (detect < tops[0]) { setActiveId(""); return; }

      let idx = 0;
      for (let i = tops.length - 1; i >= 0; i--) {
        if (tops[i] <= detect) { idx = i; break; }
      }
      setActiveId(NAV_SECTIONS[idx].id);
    }

    requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const activeSection = NAV_SECTIONS.find((s) => s.id === activeId);

  return (
    <>
      <header className="mobile-nav-bar">
        <a href="#top" className="mobile-nav-monogram" aria-label="Go to top">
          G<span className="mobile-nav-mono-m">M</span>
        </a>

        {activeSection && (
          <span className="mobile-nav-current" aria-hidden="true">
            {activeSection.label}
          </span>
        )}

        <button
          type="button"
          className={`mobile-nav-toggle${open ? " open" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </header>

      <nav
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer${open ? " open" : ""}`}
        aria-label="Site sections"
        aria-hidden={!open}
      >
        <ul>
          {NAV_SECTIONS.map((section) => {
            const isActive = section.id === activeId;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={`mobile-nav-item${isActive ? " active" : ""}`}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="mobile-nav-item-num">{section.num}</span>
                  <span className="mobile-nav-item-stub" aria-hidden="true" />
                  <span className="mobile-nav-item-label">{section.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mobile-nav-footer" aria-hidden="true">
          <span className="mobile-nav-footer-fraction">
            {activeSection?.num ?? "00"}&thinsp;/&thinsp;05
          </span>
          <span className="mobile-nav-footer-tag">Systems Tailor</span>
        </div>
      </nav>

      {open && (
        <div
          className="mobile-nav-scrim"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
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
    }, 500);

    return () => {
      clearTimeout(timer);
      cleanupThread();
      cleanupBlueprint();
      cleanupContactReveal();
    };
  }, []);

  const entered = loadStage >= 3 ? " entered" : "";

  return (
    <>
      {/* Shared SVG defs — fabric-edge clipPath + outline path for About photo */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <clipPath id="fabricEdge" clipPathUnits="objectBoundingBox">
            <path d="
              M 0 0 L 1 0
              L 1 0.04 L 0.96 0.06 L 1 0.08 L 0.96 0.10 L 1 0.12 L 0.96 0.14
              L 1 0.16 L 0.96 0.18 L 1 0.20 L 0.96 0.22 L 1 0.24 L 0.96 0.26
              L 1 0.28 L 0.96 0.30 L 1 0.32 L 0.96 0.34 L 1 0.36 L 0.96 0.38
              L 1 0.40 L 0.96 0.42 L 1 0.44 L 0.96 0.46 L 1 0.48 L 0.96 0.50
              L 1 0.52 L 0.96 0.54 L 1 0.56 L 0.96 0.58 L 1 0.60 L 0.96 0.62
              L 1 0.64 L 0.96 0.66 L 1 0.68 L 0.96 0.70 L 1 0.72 L 0.96 0.74
              L 1 0.76 L 0.96 0.78 L 1 0.80 L 0.96 0.82 L 1 0.84 L 0.96 0.86
              L 1 0.88 L 0.96 0.90 L 1 0.92 L 0.96 0.94 L 1 0.96
              L 0.97 1 L 0.94 0.96 L 0.91 1 L 0.88 0.96 L 0.85 1 L 0.82 0.96
              L 0.79 1 L 0.76 0.96 L 0.73 1 L 0.70 0.96 L 0.67 1 L 0.64 0.96
              L 0.61 1 L 0.58 0.96 L 0.55 1 L 0.52 0.96 L 0.49 1 L 0.46 0.96
              L 0.43 1 L 0.40 0.96 L 0.37 1 L 0.34 0.96 L 0.31 1 L 0.28 0.96
              L 0.25 1 L 0.22 0.96 L 0.19 1 L 0.16 0.96 L 0.13 1 L 0.10 0.96
              L 0.07 1 L 0.04 0.96 L 0.03 1
              L 0 0.96 L 0.04 0.94 L 0 0.92 L 0.04 0.90 L 0 0.88 L 0.04 0.86
              L 0 0.84 L 0.04 0.82 L 0 0.80 L 0.04 0.78 L 0 0.76 L 0.04 0.74
              L 0 0.72 L 0.04 0.70 L 0 0.68 L 0.04 0.66 L 0 0.64 L 0.04 0.62
              L 0 0.60 L 0.04 0.58 L 0 0.56 L 0.04 0.54 L 0 0.52 L 0.04 0.50
              L 0 0.48 L 0.04 0.46 L 0 0.44 L 0.04 0.42 L 0 0.40 L 0.04 0.38
              L 0 0.36 L 0.04 0.34 L 0 0.32 L 0.04 0.30 L 0 0.28 L 0.04 0.26
              L 0 0.24 L 0.04 0.22 L 0 0.20 L 0.04 0.18 L 0 0.16 L 0.04 0.14
              L 0 0.12 L 0.04 0.10 L 0 0.08 L 0.04 0.06 L 0 0.04 Z
            " />
          </clipPath>
          <path id="fabricEdgeStroke" d="
              M 0 0 L 1 0
              L 1 0.04 L 0.96 0.06 L 1 0.08 L 0.96 0.10 L 1 0.12 L 0.96 0.14
              L 1 0.16 L 0.96 0.18 L 1 0.20 L 0.96 0.22 L 1 0.24 L 0.96 0.26
              L 1 0.28 L 0.96 0.30 L 1 0.32 L 0.96 0.34 L 1 0.36 L 0.96 0.38
              L 1 0.40 L 0.96 0.42 L 1 0.44 L 0.96 0.46 L 1 0.48 L 0.96 0.50
              L 1 0.52 L 0.96 0.54 L 1 0.56 L 0.96 0.58 L 1 0.60 L 0.96 0.62
              L 1 0.64 L 0.96 0.66 L 1 0.68 L 0.96 0.70 L 1 0.72 L 0.96 0.74
              L 1 0.76 L 0.96 0.78 L 1 0.80 L 0.96 0.82 L 1 0.84 L 0.96 0.86
              L 1 0.88 L 0.96 0.90 L 1 0.92 L 0.96 0.94 L 1 0.96
              L 0.97 1 L 0.94 0.96 L 0.91 1 L 0.88 0.96 L 0.85 1 L 0.82 0.96
              L 0.79 1 L 0.76 0.96 L 0.73 1 L 0.70 0.96 L 0.67 1 L 0.64 0.96
              L 0.61 1 L 0.58 0.96 L 0.55 1 L 0.52 0.96 L 0.49 1 L 0.46 0.96
              L 0.43 1 L 0.40 0.96 L 0.37 1 L 0.34 0.96 L 0.31 1 L 0.28 0.96
              L 0.25 1 L 0.22 0.96 L 0.19 1 L 0.16 0.96 L 0.13 1 L 0.10 0.96
              L 0.07 1 L 0.04 0.96 L 0.03 1
              L 0 0.96 L 0.04 0.94 L 0 0.92 L 0.04 0.90 L 0 0.88 L 0.04 0.86
              L 0 0.84 L 0.04 0.82 L 0 0.80 L 0.04 0.78 L 0 0.76 L 0.04 0.74
              L 0 0.72 L 0.04 0.70 L 0 0.68 L 0.04 0.66 L 0 0.64 L 0.04 0.62
              L 0 0.60 L 0.04 0.58 L 0 0.56 L 0.04 0.54 L 0 0.52 L 0.04 0.50
              L 0 0.48 L 0.04 0.46 L 0 0.44 L 0.04 0.42 L 0 0.40 L 0.04 0.38
              L 0 0.36 L 0.04 0.34 L 0 0.32 L 0.04 0.30 L 0 0.28 L 0.04 0.26
              L 0 0.24 L 0.04 0.22 L 0 0.20 L 0.04 0.18 L 0 0.16 L 0.04 0.14
              L 0 0.12 L 0.04 0.10 L 0 0.08 L 0.04 0.06 L 0 0.04 Z
          " />
          {/* Soft amber glow around the pin-mark */}
          <filter id="pinGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feFlood floodColor="#D4A24C" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <a href="#work" className="skip-to-content">Skip to content</a>
      <Nav />
      <MobileNav />
      <CustomCursor />

      {/* ── 1. HERO ── */}
      <section id="top" className={`hero hero-stage-${loadStage}`}>
        <div className="hero-pinstripes" aria-hidden="true" />
        <div className="hero-cutting-grid" aria-hidden="true" />
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
            <div className="case-card-meta">
              <div className="case-category-row">
                {CATEGORY_ICONS['AI ORCHESTRATION'] && (
                  <AtelierIcon name={CATEGORY_ICONS['AI ORCHESTRATION']} size={16} className="case-category-icon" />
                )}
                <span className="case-card-category">AI ORCHESTRATION</span>
              </div>
              <span className="case-card-number">I/III</span>
            </div>
            <div className="case-card-diagram-wrap">
              <DiagramOrchestration />
            </div>
            <div className="case-card-content">
              <h3 className="case-card-title">
                AI Orchestration Platform for Revenue Teams
              </h3>
              <p className="case-card-desc">
                ML-driven platform that coordinates existing sales tools —
                Apollo, Lemlist, HubSpot, Salesforce — instead of replacing
                them. Learns which outreach works for each prospect type and
                optimizes automatically.
              </p>
              <p className="case-card-closer closer-fade">
                Enterprise-grade system. One engineer. Currently in production.
              </p>
              <p className="case-card-metrics">
                TypeScript/Prisma/Node.js<MetricDot />Redis/BullMQ processing
                <MetricDot />Kubernetes deployment<MetricDot />GDPR-compliant architecture
              </p>
            </div>
          </article>

          {/* Card 2 */}
          <article className="case-card fade-in" tabIndex={0} aria-label="Full-Stack AI Infrastructure — Early-Stage Startup">
            <div className="case-card-meta">
              <div className="case-category-row">
                {CATEGORY_ICONS['FULL-STACK BUILD'] && (
                  <AtelierIcon name={CATEGORY_ICONS['FULL-STACK BUILD']} size={16} className="case-category-icon" />
                )}
                <span className="case-card-category">FULL-STACK BUILD</span>
              </div>
              <span className="case-card-number">II/III</span>
            </div>
            <div className="case-card-diagram-wrap">
              <DiagramFullStack />
            </div>
            <div className="case-card-content">
              <h3 className="case-card-title">
                Full-Stack AI Infrastructure — Early-Stage Startup
              </h3>
              <p className="case-card-desc">
                Built an AI-powered business intelligence platform end-to-end —
                frontend, backend, two production AI tools, dashboard, and data
                pipeline. Took the founder&apos;s concept to a fully operational
                product suite.
              </p>
              <p className="case-card-closer closer-fade">
                Zero to production. Solo engineer. Every layer — backend, frontend,
                AI, design, DevOps.
              </p>
              <p className="case-card-metrics">
                Persistent AI chat assistant<MetricDot />Custom intake forms with Mailgun
                <MetricDot />Complete API layer with rate limiting<MetricDot />5 pages, every endpoint
              </p>
            </div>
          </article>

          {/* Card 3 */}
          <article className="case-card fade-in" tabIndex={0} aria-label="Brand Strategy &amp; Operations System — Premium Consumer Brand">
            <div className="case-card-meta">
              <div className="case-category-row">
                {CATEGORY_ICONS['BRAND & OPERATIONS'] && (
                  <AtelierIcon name={CATEGORY_ICONS['BRAND & OPERATIONS']} size={16} className="case-category-icon" />
                )}
                <span className="case-card-category">BRAND &amp; OPERATIONS</span>
              </div>
              <span className="case-card-number">III/III</span>
            </div>
            <div className="case-card-diagram-wrap">
              <DiagramGradingGrid />
            </div>
            <div className="case-card-content">
              <h3 className="case-card-title">
                Brand Strategy &amp; Operations System — Premium Consumer Brand
              </h3>
              <p className="case-card-desc">
                Developed comprehensive go-to-market infrastructure for a premium
                men&apos;s apparel brand, from market research to supply chain to
                quality assurance.
              </p>
              <p className="case-card-closer closer-fade">
                Not just strategy decks. Operational systems designed to ship
                product.
              </p>
              <p className="case-card-metrics">
                PMF Research Strategy<MetricDot />Brand Identity System
                <MetricDot />Sample Evaluation System (v3.4)<MetricDot />Multi-tester validation framework
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── 3. THE GARMENT (suit spec sheet) ── */}
      <SectionDivider />
      <section id="suit-spec" className="section-wrapper suit-spec">
        {/* Document header strip — top edge, full bleed within section */}
        <div className="garment-doc-header" aria-hidden="true">
          <span className="garment-doc-style">STYLE №2026-04</span>
          <span className="garment-doc-sep">·</span>
          <span className="garment-doc-name">DINNER JACKET</span>
          <span className="garment-doc-sep">·</span>
          <span className="garment-doc-house">GRANT MAHN ATELIER</span>
        </div>

        {/* Faint folded-paper crease behind the suit */}
        <div className="garment-doc-crease" aria-hidden="true" />

        <div className="garment-tag tag-enter">REVENUEOS · PATTERN I/III</div>
        <h2 className="section-heading clip-reveal">The Garment</h2>

        {/* Desktop: SVG blueprint drawn by GSAP — DO NOT TOUCH */}
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

        {/* Document footer strip — bottom edge */}
        <div className="garment-doc-footer" aria-hidden="true">
          <span className="garment-doc-meta">DRAFTED 04.2026</span>
          <span className="garment-doc-sep">·</span>
          <span className="garment-doc-meta">G.M.</span>
          <span className="garment-doc-sep">·</span>
          <span className="garment-doc-meta">CHALK ON BROWN PAPER</span>
          <span className="garment-doc-sep">·</span>
          <span className="garment-doc-meta">v3</span>
        </div>
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
        <PatternBook />
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

          <figure className="fabric-piece" aria-label="Portrait of Grant Mahn">
            <svg
              className="fabric-photo"
              viewBox="0 0 320 400"
              preserveAspectRatio="xMidYMid slice"
              role="img"
              aria-labelledby="about-portrait-title about-portrait-desc"
            >
              <title id="about-portrait-title">Grant Mahn portrait</title>
              <desc id="about-portrait-desc">
                Grant Mahn in a charcoal pinstripe three-piece suit and red fedora,
                seated at a marble bar. Shot inside a pinking-shears fabric silhouette.
              </desc>
              <g transform="scale(320, 400)">
                <g clipPath="url(#fabricEdge)">
                  <rect x="0" y="0" width="1" height="1" fill="#0e0a06" />
                  <image
                    href="/images/about/grant-portrait.jpg"
                    x="0" y="0" width="1" height="1"
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
                <use
                  href="#fabricEdgeStroke"
                  fill="none"
                  stroke="var(--color-amber)"
                  strokeOpacity="0.5"
                  strokeWidth="0.0025"
                  strokeLinejoin="miter"
                />
              </g>
              {/* Thread: SVG line so it terminates exactly at the pin's cy=-2.
                  A CSS span can't reach above y=0 of the figure without overshooting the pin. */}
              <line
                x1="38.4" y1="-50"
                x2="38.4" y2="-2"
                stroke="var(--color-amber)"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
              {/* Pin: SVG coords so position is reliable regardless of CSS rotation.
                  cx=38.4 = 12% of 320px. cy=-2 sits above the top edge (overflow:visible). */}
              <circle
                cx="38.4"
                cy="-2"
                r="3.5"
                fill="var(--color-amber)"
                fillOpacity="0.9"
                filter="url(#pinGlow)"
                aria-hidden="true"
              />
            </svg>
            <figcaption className="fabric-tag">
              <span className="fabric-tag-text">
                Grant Mahn<span className="punct">&middot;</span>Systems Tailor
              </span>
            </figcaption>
          </figure>
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
      <footer className="footer" aria-labelledby="care-label-eyebrow">
        <div className="footer-inner">

          {/* Maker's mark — needle V3 from locked icon kit */}
          <div className="footer-maker-mark" aria-hidden="true">
            <AtelierIcon name="needle" size={30} className="footer-maker-mark-svg" />
          </div>

          {/* Care label — the production artifact */}
          <article className="care-label" aria-labelledby="care-label-eyebrow">
            <div className="care-label-corners" aria-hidden="true" />

            <header className="care-label-header">
              <p id="care-label-eyebrow" className="care-label-eyebrow">
                Care Label · Colophon
              </p>
              <p className="care-label-id" tabIndex={0} title="Build identifier">
                SPEC-NO. 2026-GM-PB-03
              </p>
            </header>

            <dl className="care-meta">
              <dt className="care-meta-key">Authored</dt>
              <dd className="care-meta-val care-meta-row">
                <span className="care-meta-authored">
                  <span className="accent">G·M</span>
                  <span className="punct">·</span>
                  San Diego, California
                </span>
              </dd>

              <dt className="care-meta-key">Constructed</dt>
              <dd className="care-meta-val">
                End-to-end<span className="punct">·</span>0 templates<span className="punct">·</span>0 plugins
              </dd>

              <dt className="care-meta-key">Pattern Book</dt>
              <dd className="care-meta-val">
                Active<span className="punct">·</span>Revision 03<span className="punct">·</span>2026
              </dd>

              <dt className="care-meta-key">Status</dt>
              <dd className="care-meta-val">
                <span className="status-pulse" aria-hidden="true" />
                In production<span className="punct">·</span>Tailored continuously
              </dd>
            </dl>

            <div className="care-note">
              <span className="care-note-line">Measured, cut, and stitched by hand.</span>
              <span className="care-note-line">
                Pattern Book · Spec sheets · Marks-kit primitives · Maintained as a working garment.
              </span>
            </div>
          </article>

          {/* Utility strip — copyright + minimized social */}
          <div className="footer-utility">
            <p className="footer-copyright">© 2026 Grant Mahn · All rights reserved</p>
            <ul className="footer-social" role="list">
              <li>
                <a href={CONFIG.githubUrl} aria-label="GitHub profile" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 015.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                  </svg>
                </a>
              </li>
              <li>
                <a href={CONFIG.linkedinUrl} aria-label="LinkedIn profile" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 11.01-4.12 2.06 2.06 0 01-.01 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                  </svg>
                </a>
              </li>
              <li>
                <a href={CONFIG.instagramUrl} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

        </div>
      </footer>
    </>
  );
}
