// Polish shell texts (nav, footer, buttons). Polish is the default language at /.
export const pl = {
  nav: {
    badge: 'DATA LAKEHOUSE',
    research: 'Badania',
    dashboards: 'Dashboardy',
    products: 'Produkty',
    vault: 'Skarbiec',
    consulting: 'Doradztwo',
    quickSearch: 'Szybkie wyszukiwanie',
    searchTitle: 'Szukaj wskaźników, regionów i raportów',
    search: 'Szukaj',
    toggleNav: 'Pokaż lub ukryj nawigację',
  },
  footer: {
    badge: 'OTWARTE RAPORTOWANIE',
    about: 'Dane publiczne o Polsce i świecie, zbudowane na Cloudflare i GitHub.',
    navHeading: 'Nawigacja',
    pulse: 'Puls (wskaźniki na żywo)',
    metrics: 'Metryki (KPI)',
    compass: 'Kompas (16 województw)',
    chronicles: 'Kroniki (badania)',
    vault: 'Skarbiec (lakehouse Parquet)',
    foundedBy: 'Założyciel:',
    founder: 'Radosław Utkała',
    sources: 'Źródła danych: Główny Urząd Statystyczny (GUS), NBP, RIO',
    credit: 'Tony Stark & Jarvis Model',
  },
  common: {
    brand: 'Zohelo',
    site: 'Zohelo.com',
    language: 'Język',
    pl: 'PL',
    en: 'EN',
  },
} as const;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dict = Widen<typeof pl>;
