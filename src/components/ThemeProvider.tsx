"use client";

import { useEffect } from "react";

const VALID_THEMES = ["blueprint"] as const;

export default function ThemeProvider() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const theme = params.get("theme");

    // Remove any existing theme classes
    VALID_THEMES.forEach((t) => {
      document.documentElement.classList.remove(`theme-${t}`);
    });

    // Apply the requested theme if valid
    if (
      theme &&
      VALID_THEMES.includes(theme as (typeof VALID_THEMES)[number])
    ) {
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, []);

  return null;
}
