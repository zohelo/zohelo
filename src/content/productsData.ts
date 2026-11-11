import { ProductItem } from '../types';

// zohelo's sub-products and the stage each one is at (design package §2.4). A live sub-product links
// to its page (`href`, localised by ProductsSection); each sub-product's Epic updates its own status
// (#390: Wskaźniki, Regiony and Dane i API are live pages).
export const productsList: ProductItem[] = [
  {
    id: 'indicators',
    name: 'Wskaźniki',
    oneLine: 'Jedna strona na każdy wskaźnik: definicja, wartość, wykres, regiony, źródła.',
    en: { name: 'Indicators', oneLine: 'One page per indicator: definition, value, chart, regions, sources.' },
    status: 'live',
    href: '/indicators',
  },
  {
    id: 'regions',
    name: 'Regiony',
    oneLine: 'Profil każdego województwa, potem powiatu i gminy, z rankingami i mapami.',
    en: { name: 'Regions', oneLine: 'A profile of every voivodeship, later county and municipality, with rankings and maps.' },
    status: 'live',
    href: '/regions',
  },
  {
    id: 'brief',
    name: 'Brief i kalendarz',
    oneLine: 'Wykres dnia, cotygodniowy przegląd i kalendarz publikacji GUS, Eurostatu i NBP.',
    en: { name: 'Brief and calendar', oneLine: 'The chart of the day, a weekly review and the release calendar of GUS, Eurostat and NBP.' },
    status: 'concept',
  },
  {
    id: 'data',
    name: 'Dane i API',
    oneLine: 'Źródła, licencje i cytowania; później publiczne API.',
    en: { name: 'Data and API', oneLine: 'Sources, licences and citations; a public API later.' },
    status: 'live',
    href: '/sources',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    oneLine: 'Studia przypadków: dashboardy na danych demonstracyjnych i publicznych.',
    en: { name: 'Portfolio', oneLine: 'Case studies: dashboards on demo and public data.' },
    status: 'concept',
    href: '/portfolio',
  },
];
