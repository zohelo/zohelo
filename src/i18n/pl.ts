// Polish shell texts (nav, footer, buttons). Polish is the default language at /.
export const pl = {
  nav: {
    badge: 'POLSKA W DANYCH',
    indicators: 'Wskaźniki',
    regions: 'Regiony',
    changes: 'Zmiany',
    sources: 'Źródła',
    toggleNav: 'Pokaż lub ukryj nawigację',
  },
  footer: {
    badge: 'POLSKA W DANYCH',
    about: 'Dane publiczne o Polsce i świecie, zbudowane na Cloudflare i GitHub.',
    navHeading: 'Nawigacja',
    foundedBy: 'Założyciel:',
    founder: 'Radosław Utkała',
    sources: 'Źródła danych:',
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
    skip: 'Przejdź do treści',
  },
  sample: {
    banner:
      'Dane przykładowe: ta wersja strony jest zbudowana z wartości syntetycznych, nie z danych źródeł. Liczby, daty i licencje nie są prawdziwe.',
  },
} as const;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dict = Widen<typeof pl>;
