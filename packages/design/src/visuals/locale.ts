// Vega number and time locales per page language (zohelo#384): d3-format and d3-time-format
// definitions passed to vega-embed as formatLocale and timeFormatLocale, so axes, legends and
// tooltips read "2,6" and "845 000" with Polish month names on Polish pages, "2.6" and "845,000"
// on English ones. Pure data.

export type ChartLocale = "pl" | "en";

export type NumberLocale = { decimal: string; thousands: string; grouping: number[]; currency: [string, string]; minus?: string };

export type TimeLocale = {
  dateTime: string;
  date: string;
  time: string;
  periods: [string, string];
  days: string[];
  shortDays: string[];
  months: string[];
  shortMonths: string[];
};

export const numberLocale: Record<ChartLocale, NumberLocale> = {
  // Thousands grouped with a no-break space, the typographic minus, "zł" after the amount.
  pl: { decimal: ",", thousands: " ", grouping: [3], currency: ["", " zł"], minus: "−" },
  en: { decimal: ".", thousands: ",", grouping: [3], currency: ["", ""], minus: "−" },
};

export const timeLocale: Record<ChartLocale, TimeLocale> = {
  pl: {
    dateTime: "%A, %e %B %Y, %X",
    date: "%d.%m.%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"],
    shortDays: ["nie", "pon", "wto", "śro", "czw", "pią", "sob"],
    months: ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"],
    shortMonths: ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"],
  },
  en: {
    dateTime: "%a %e %b %Y %X",
    date: "%d/%m/%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
};

/** Number formats shared by every spec: values to at most 2 decimals with trailing zeros trimmed, grouped. */
export const VALUE_FORMAT = ",.2~f";
/** Tooltips keep up to 4 decimals (the published precision), grouped. */
export const TOOLTIP_FORMAT = ",.4~f";
