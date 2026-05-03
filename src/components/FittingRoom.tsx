"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/* ── Types ── */

type FittingState = "idle" | "measuring" | "report" | "error";

interface BlueprintLayer {
  name: string;
  detail: string;
}

interface FittingData {
  measurement: string;
  recommended_pattern: string;
  cut: string[];
  estimated_construction: string;
  fabric: string;
  blueprint: {
    layer_1: BlueprintLayer;
    layer_2: BlueprintLayer;
    layer_3: BlueprintLayer;
    layer_4: BlueprintLayer;
  };
}

/* ── Constants ── */

const TEAM_SIZES = ["1-5", "6-15", "16-50", "50+"];

const BOTTLENECKS = [
  "Disconnected tools that don't talk to each other",
  "Manual data entry eating hours every week",
  "No lead prioritization — everything feels equal",
  "Slow proposal or quote turnaround",
  "Can't track what's working in outreach",
  "Scaling operations without scaling headcount",
];

const LOADING_MESSAGES = [
  "Taking measurements...",
  "Selecting fabrics...",
  "Consulting the pattern book...",
  "Almost there...",
];

/* ── Component ── */

export default function FittingRoom({
  calendlyUrl,
}: {
  calendlyUrl: string;
}) {
  const [state, setState] = useState<FittingState>("idle");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [bottleneck, setBottleneck] = useState("");
  const [report, setReport] = useState<FittingData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [reportVisible, setReportVisible] = useState(false);
  const [statusMsg, setStatusMsg] = useState(LOADING_MESSAGES[0]);

  // Refs for parallel curtain + API coordination
  const curtainReady = useRef(false);
  const apiResult = useRef<{ data?: FittingData; error?: string } | null>(
    null
  );
  const statusInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusInterval.current) clearInterval(statusInterval.current);
    };
  }, []);

  // Try to reveal report/error when both conditions are met
  const tryReveal = useCallback(() => {
    if (!curtainReady.current || !apiResult.current) return;

    // Clear loading message rotation
    if (statusInterval.current) {
      clearInterval(statusInterval.current);
      statusInterval.current = null;
    }

    const result = apiResult.current;

    if (result.data) {
      setReport(result.data);
      setState("report");
      setTimeout(() => setReportVisible(true), 800);
    } else {
      setErrorMsg(
        result.error || "Something went wrong. Book a call instead."
      );
      setState("error");
      setTimeout(() => setReportVisible(true), 800);
    }
  }, []);

  /* ── Submit Handler ── */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!industry.trim() || !teamSize || !bottleneck) return;

      // Reset
      setState("measuring");
      setReportVisible(false);
      setStatusMsg(LOADING_MESSAGES[0]);
      curtainReady.current = false;
      apiResult.current = null;

      // Start progressive loading messages
      let msgIndex = 0;
      statusInterval.current = setInterval(() => {
        msgIndex++;
        if (msgIndex < LOADING_MESSAGES.length) {
          setStatusMsg(LOADING_MESSAGES[msgIndex]);
        }
      }, 5000);

      // Condition 1: Curtain closes after 650ms
      setTimeout(() => {
        curtainReady.current = true;
        tryReveal();
      }, 650);

      // Condition 2: API call (fires immediately, in parallel with curtain)
      try {
        const res = await fetch("/api/fitting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            industry: industry.trim(),
            teamSize,
            bottleneck,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.message || data.error || `Request failed (${res.status})`
          );
        }

        const data: FittingData = await res.json();
        apiResult.current = { data };
      } catch (err) {
        apiResult.current = {
          error:
            err instanceof Error ? err.message : "Something went wrong",
        };
      }

      tryReveal();
    },
    [industry, teamSize, bottleneck, tryReveal]
  );

  /* ── Reset Handler ── */
  const handleReset = useCallback(() => {
    setState("idle");
    setReport(null);
    setErrorMsg("");
    setReportVisible(false);
    setIndustry("");
    setTeamSize("");
    setBottleneck("");
    curtainReady.current = false;
    apiResult.current = null;
    if (statusInterval.current) {
      clearInterval(statusInterval.current);
      statusInterval.current = null;
    }
  }, []);

  /* ── Curtain state ── */
  const curtainClosed = state === "measuring";

  return (
    <>
      <div className="fitting-room-container">
        {/* Curtain Panels */}
        <div
          aria-hidden="true"
          className={`curtain-panel curtain-left${curtainClosed ? " closed" : ""}`}
        />
        <div
          aria-hidden="true"
          className={`curtain-panel curtain-right${curtainClosed ? " closed" : ""}`}
        />

        {/* Center Seam */}
        {curtainClosed && <div className="curtain-seam" aria-hidden="true" />}

        {/* Form */}
        {state === "idle" && (
          <form className="fitting-form" onSubmit={handleSubmit}>
            <div className="fitting-eyebrow" aria-hidden="true">
              <span className="fitting-eyebrow-step">STEP 1</span>
              <span className="fitting-eyebrow-sep">·</span>
              <span className="fitting-eyebrow-label">MEASUREMENTS</span>
              <div className="fitting-tape-rule" />
            </div>

            <div className="fitting-field">
              <label className="fitting-label" htmlFor="fitting-industry">
                Industry / Business Type
              </label>
              <input
                id="fitting-industry"
                type="text"
                className="fitting-input"
                placeholder="e.g. SaaS, E-commerce, Real Estate, Agency..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
              />
            </div>

            <div className="fitting-field">
              <label className="fitting-label" htmlFor="fitting-team-size">Team Size</label>
              <select
                id="fitting-team-size"
                className="fitting-select"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select team size
                </option>
                {TEAM_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="fitting-field">
              <label className="fitting-label" htmlFor="fitting-bottleneck">Biggest Bottleneck</label>
              <select
                id="fitting-bottleneck"
                className="fitting-select"
                value={bottleneck}
                onChange={(e) => setBottleneck(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select your biggest bottleneck
                </option>
                {BOTTLENECKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="cta-button fitting-submit">
              Take My Measurements
            </button>
          </form>
        )}

        {/* Report */}
        {state === "report" && report && (
          <FittingReport
            data={report}
            industry={industry}
            visible={reportVisible}
            calendlyUrl={calendlyUrl}
            onReset={handleReset}
          />
        )}

        {/* Error */}
        {state === "error" && (
          <div className={`fitting-error${reportVisible ? " visible" : ""}`}>
            <p className="fitting-error-msg">
              {errorMsg ||
                "The fitting room is temporarily closed. Book a call instead."}
            </p>
            <a
              href={calendlyUrl}
              className="cta-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a Discovery Call
            </a>
            <button className="fitting-new-link" onClick={handleReset}>
              Try again &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Status text (outside overflow container so it's always visible) */}
      {curtainClosed && (
        <div className="fitting-status-text">{statusMsg}</div>
      )}
    </>
  );
}

/* ── Report Sub-Component ── */

function FittingReport({
  data,
  industry,
  visible,
  calendlyUrl,
  onReset,
}: {
  data: FittingData;
  industry: string;
  visible: boolean;
  calendlyUrl: string;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const LAYERS = [
    { key: "layer_1", ...data.blueprint.layer_1 },
    { key: "layer_2", ...data.blueprint.layer_2 },
    { key: "layer_3", ...data.blueprint.layer_3 },
    { key: "layer_4", ...data.blueprint.layer_4 },
  ];

  const handleCopy = useCallback(async () => {
    const text = [
      `SYSTEM FITTING — ${industry.toUpperCase()}`,
      "",
      `MEASUREMENT: ${data.measurement}`,
      "",
      `RECOMMENDED PATTERN: ${data.recommended_pattern}`,
      "",
      "CUT:",
      ...data.cut.map((c) => `  · ${c}`),
      "",
      "SYSTEM BLUEPRINT:",
      ...LAYERS.map((l) => `  ${l.name}: ${l.detail}`),
      "",
      `FABRIC: ${data.fabric}`,
      "",
      `ESTIMATED CONSTRUCTION: ${data.estimated_construction}`,
      "",
      "— Generated at grantmahn.com/fitting-room",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, [data, industry, LAYERS]);

  let animIndex = 0;

  return (
    <div className={`fitting-report${visible ? " reveal" : ""}`}>
      <div className="fitting-report-tag">FITTING REPORT</div>

      <h3
        className="fitting-report-heading report-anim"
        style={{ transitionDelay: `${200 + animIndex++ * 70}ms` }}
      >
        SYSTEM FITTING — {industry.toUpperCase()}
      </h3>

      <div
        className="fitting-report-section report-anim"
        style={{ transitionDelay: `${200 + animIndex++ * 70}ms` }}
      >
        <div className="fitting-report-label">MEASUREMENT</div>
        <p className="fitting-report-text">{data.measurement}</p>
      </div>

      <div
        className="fitting-report-section report-anim"
        style={{ transitionDelay: `${200 + animIndex++ * 70}ms` }}
      >
        <div className="fitting-report-label">RECOMMENDED PATTERN</div>
        <p className="fitting-report-text">{data.recommended_pattern}</p>
      </div>

      <div
        className="fitting-report-section report-anim"
        style={{ transitionDelay: `${200 + animIndex++ * 70}ms` }}
      >
        <div className="fitting-report-label">CUT</div>
        <ul className="fitting-report-cut-list">
          {data.cut.map((item, i) => (
            <li key={i} className="fitting-report-cut-item">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="fitting-report-section report-anim"
        style={{ transitionDelay: `${200 + animIndex++ * 70}ms` }}
      >
        <div className="fitting-report-label">SYSTEM BLUEPRINT</div>
        <div className="fitting-blueprint-stack">
          {LAYERS.map((layer) => (
            <div key={layer.key} className="fitting-blueprint-layer">
              <div className="fitting-blueprint-layer-name">{layer.name}</div>
              <div className="fitting-blueprint-layer-detail">
                {layer.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="fitting-report-section report-anim"
        style={{ transitionDelay: `${200 + animIndex++ * 70}ms` }}
      >
        <div className="fitting-report-label">FABRIC</div>
        <p className="fitting-report-text">{data.fabric}</p>
      </div>

      <div
        className="fitting-report-section report-anim"
        style={{ transitionDelay: `${200 + animIndex++ * 70}ms` }}
      >
        <div className="fitting-report-label">ESTIMATED CONSTRUCTION</div>
        <p className="fitting-report-text">{data.estimated_construction}</p>
      </div>

      <div
        className="fitting-report-cta-wrapper report-anim"
        style={{ transitionDelay: `${200 + animIndex++ * 70}ms` }}
      >
        <a
          href={calendlyUrl}
          className="cta-button fitting-report-cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          Book a Discovery Call
        </a>
      </div>

      <div
        className="fitting-report-actions report-anim"
        style={{ transitionDelay: `${200 + animIndex++ * 70}ms` }}
      >
        <button className="fitting-copy-link" onClick={handleCopy}>
          {copied ? "Copied \u2713" : "Copy spec"}
        </button>
        <button className="fitting-new-link" onClick={onReset}>
          New fitting &rarr;
        </button>
      </div>
    </div>
  );
}
