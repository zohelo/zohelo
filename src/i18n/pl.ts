// Polish shell texts (nav, footer, buttons). Polish is the default language at /.
export const pl = {
  nav: {
    badge: 'DATA LAKEHOUSE',
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
    vault: 'Skarbiec (lakehouse Parquet)',
    foundedBy: 'Założyciel:',
    founder: 'Radosław Utkała',
    sources: 'Źródła danych: Główny Urząd Statystyczny (GUS), NBP, RIO',
    credit: 'Tony Stark & Jarvis Model',
  },
  products: {
    heading: 'Produkty',
    subtitle: 'Części zohelo i etap, na którym jest każda z nich',
  },
  common: {
    brand: 'Zohelo',
    site: 'Zohelo.com',
    language: 'Język',
    pl: 'PL',
    en: 'EN',
  },
  sample: {
    banner:
      'Dane przykładowe: ta wersja strony jest zbudowana z wartości syntetycznych, nie z danych źródeł. Liczby, daty i licencje nie są prawdziwe.',
  },
} as const;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dict = Widen<typeof pl>;
