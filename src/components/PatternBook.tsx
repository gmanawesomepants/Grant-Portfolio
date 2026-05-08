"use client";

import { useState, useCallback } from "react";
import { AtelierIcon } from '@/components/icons/AtelierIcon';
import type { IconName } from '@/icons/paths';

const TAG_ICONS: Record<string, IconName> = {
  MEASURE: 'tape',
  CUT:     'shears',
  FIT:     'needle',
};

interface ServiceCard {
  tag: string;
  title: string;
  body: string;
  note?: string;
  stitch: "basting" | "running" | "overlock" | "topstitch";
  fileNo: string;
}

const CARDS: ServiceCard[] = [
  {
    tag: "MEASURE",
    title: "AI Strategy Audit",
    body: "Every system starts with measurement. I assess your operations, identify the 2–3 highest-ROI opportunities for AI, and deliver a concrete roadmap. Not off-the-rack consulting — a pattern cut to your business.",
    note: "Engagements start with a paid strategy audit.",
    stitch: "basting",
    fileNo: "PATTERN NO. 01",
  },
  {
    tag: "CUT",
    title: "AI System Build",
    body: "Custom AI systems, cut from your requirements. The full construction — orchestration, agents, infrastructure — stitched into your existing operations. I don't hand you a demo and disappear. I build until the fit is right.",
    stitch: "overlock",
    fileNo: "PATTERN NO. 02",
  },
  {
    tag: "FIT",
    title: "Managed AI / Retainer",
    body: "Every system needs alterations after the first wear. I stay for monitoring, optimization, and new capabilities as your needs evolve. A fractional AI architect on call — for a fraction of what a full-time hire costs.",
    stitch: "topstitch",
    fileNo: "PATTERN NO. 03",
  },
];

const STITCH_PATTERNS: Record<ServiceCard["stitch"], string> = {
  basting:
    "repeating-linear-gradient(90deg, var(--color-amber) 0 var(--mark-stitch-basting-on), transparent var(--mark-stitch-basting-on) calc(var(--mark-stitch-basting-on) + var(--mark-stitch-basting-off)))",
  running:
    "repeating-linear-gradient(90deg, var(--color-amber) 0 var(--mark-stitch-running-on), transparent var(--mark-stitch-running-on) calc(var(--mark-stitch-running-on) + var(--mark-stitch-running-off)))",
  // Compound — literal stop values kept; rhythm documented in --mark-stitch-overlock-segment
  overlock:
    "repeating-linear-gradient(90deg, var(--color-amber) 0 10px, transparent 10px 12px, var(--color-amber) 12px 22px, transparent 22px 26px)",
  // AR-3: solid → tight running stitch (deliberate visual change, signed off)
  topstitch:
    "repeating-linear-gradient(90deg, var(--color-amber) 0 var(--mark-stitch-topstitch-on), transparent var(--mark-stitch-topstitch-on) calc(var(--mark-stitch-topstitch-on) + var(--mark-stitch-topstitch-off)))",
};

function StitchDivider({ type }: { type: ServiceCard["stitch"] }) {
  return (
    <div
      className="pb-stitch"
      style={{ background: STITCH_PATTERNS[type] }}
      aria-hidden="true"
    />
  );
}

export default function PatternBook() {
  const [current, setCurrent] = useState(0);
  const [animState, setAnimState] = useState<"idle" | "out" | "in">("idle");

  const goTo = useCallback(
    (next: number) => {
      if (animState !== "idle" || next === current) return;
      setAnimState("out");
      setTimeout(() => {
        setCurrent(next);
        setAnimState("in");
        setTimeout(() => setAnimState("idle"), 280);
      }, 280);
    },
    [animState, current]
  );

  const advance = useCallback(() => {
    if (current < CARDS.length - 1) goTo(current + 1);
  }, [current, goTo]);

  const card = CARDS[current];
  const remaining = CARDS.length - 1 - current;
  const isLast = current === CARDS.length - 1;

  return (
    <>
      <div
        className="pb-stage"
        role="region"
        aria-label="Services: Measure, Cut, Fit"
      >
        {/* Shadow cards behind — shows depth of stack */}
        <div className="pb-stack-shadows" aria-hidden="true">
          {remaining >= 1 && <div className="pb-shadow pb-shadow-1" />}
          {remaining >= 2 && <div className="pb-shadow pb-shadow-2" />}
        </div>

        {/* Active card */}
        <div
          className={`pb-card pb-card--${animState}`}
          onClick={advance}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              advance();
            }
          }}
          role={!isLast ? "button" : undefined}
          tabIndex={!isLast ? 0 : undefined}
          aria-label={
            !isLast
              ? `${card.tag}: ${card.title}. Tap to see next.`
              : undefined
          }
          style={{ cursor: !isLast ? "pointer" : "default" }}
        >
          <div className="pb-front-inner">
            <div className="pb-front-top">
              <div className="pb-tag-row">
                {TAG_ICONS[card.tag] && (
                  <AtelierIcon name={TAG_ICONS[card.tag]} size={13} className="pb-tag-icon" />
                )}
                <span className="pb-tag">{card.tag}</span>
              </div>
              <h3 className="pb-title">{card.title}</h3>
            </div>
            <div className="pb-front-mid">
              <p className="pb-body">{card.body}</p>
              {card.note && <p className="pb-note">{card.note}</p>}
            </div>
            <StitchDivider type={card.stitch} />
          </div>

          <div className="pb-card-foot" aria-hidden="true">
            <span className="pb-counter">
              {String(current + 1).padStart(2, "0")}&thinsp;/&thinsp;
              {String(CARDS.length).padStart(2, "0")}
            </span>
            {!isLast && (
              <span className="pb-tap-hint">tap to continue &rarr;</span>
            )}
            <span className="pb-file-no">{card.fileNo}</span>
          </div>
        </div>

        {/* Dot navigation */}
        <nav className="pb-dots" aria-label="Navigate services">
          {CARDS.map((c, i) => (
            <button
              key={c.tag}
              className={`pb-dot${i === current ? " pb-dot--active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`${c.tag}: ${c.title}`}
              aria-current={i === current ? "true" : undefined}
            />
          ))}
        </nav>
      </div>

      <a href="#contact" className="services-cta">
        Request a Fitting &rarr;
      </a>
    </>
  );
}
