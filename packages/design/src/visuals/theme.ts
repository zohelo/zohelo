import type { Theme } from "./specs";

// Fixed chart colours for light and dark mode (design package §5.4), so charts work before
// the token build exists. Text, muted, grid and accent match tokens.json.

const themes: Record<"light" | "dark", Theme> = {
  light: {
    text: "#24292E",
    muted: "#5D636B",
    grid: "#E8ECEF",
    accent: "#3B8B94",
    mutedMark: "#BFBFBF",
    palette: ["#1C5A61", "#F2A33A", "#7A1F4F", "#5BB8C4", "#3A3F47", "#A98BDC"],
  },
  dark: {
    text: "#E8EAED",
    muted: "#A2A9B2",
    grid: "#262A2F",
    accent: "#5FB3BC",
    mutedMark: "#737A83",
    palette: ["#4F9AA3", "#F2A33A", "#B5578A", "#5BB8C4", "#8A9099", "#A98BDC"],
  },
};

export function themeFromMode(mode: "light" | "dark"): Theme {
  return { ...themes[mode], palette: [...themes[mode].palette] };
}
