import { useEffect, useRef, useState } from "react";
import embed, { type VisualizationSpec } from "vega-embed";
import { numberLocale, timeLocale, type ChartLocale } from "./locale";
import { config, type Theme } from "./specs";

// Renders a Vega-Lite spec. The spec is built from the current theme (CSS tokens on :root),
// so charts re-render when the colour scheme changes. onPick reports the clicked datum.

function readTheme(): Theme {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    text: v("--text", "#1b1d1f"),
    muted: v("--muted", "#5f6670"),
    grid: v("--grid", "#e3e5e8"),
    accent: v("--accent", "#2f6fdf"),
    mutedMark: v("--muted-mark", "#c9ced6"),
    palette: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => v(`--series-${i}`, "#888")),
  };
}

function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setTheme(readTheme());
    media.addEventListener("change", update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      media.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);
  return theme;
}

export type ChartProps = {
  build: (theme: Theme) => VisualizationSpec;
  onPick?: (datum: Record<string, unknown>) => void;
  label: string;
  /** The page language: number and date formats of axes, legends and tooltips (zohelo#384). Default "en". */
  locale?: ChartLocale;
};

export function Chart({ build, onPick, label, locale = "en" }: ChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const pick = useRef(onPick);
  pick.current = onPick;

  useEffect(() => {
    if (!ref.current) return;
    // Vega sets the container's aria-label from the spec's description (else "Vega visualization"),
    // so the label goes in as the description unless the spec has its own (zohelo#389).
    const built = build(theme) as VisualizationSpec & { description?: string };
    const spec = { ...built, description: built.description ?? label, config: config(theme) } as VisualizationSpec;
    let finalize: (() => void) | undefined;
    let cancelled = false;
    const options = { actions: false, renderer: "svg", formatLocale: numberLocale[locale], timeFormatLocale: timeLocale[locale] } as const;
    embed(ref.current, spec, options).then((result) => {
      if (cancelled) return result.finalize();
      finalize = () => result.finalize();
      result.view.addEventListener("click", (_event, item) => {
        const datum = (item as { datum?: Record<string, unknown> } | null | undefined)?.datum;
        if (datum && pick.current) pick.current(datum);
      });
    });
    return () => {
      cancelled = true;
      finalize?.();
    };
  }, [build, theme, label, locale]);

  return <div className="chart" ref={ref} role="img" aria-label={label} />;
}
