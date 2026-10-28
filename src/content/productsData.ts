import { ProductItem } from '../types';

// zohelo's sub-products and the stage each one is at (design package §2.4). Each sub-product's
// Epic updates its own status.
export const productsList: ProductItem[] = [
  {
    id: 'indicators',
    name: 'Wskaźniki',
    oneLine: 'Jedna strona na każdy wskaźnik: definicja, wartość, wykres, regiony, źródła.',
    status: 'concept',
  },
  {
    id: 'regions',
    name: 'Regiony',
    oneLine: 'Profil każdego województwa, potem powiatu i gminy, z rankingami i mapami.',
    status: 'concept',
  },
  {
    id: 'brief',
    name: 'Brief i kalendarz',
    oneLine: 'Wykres dnia, cotygodniowy przegląd i kalendarz publikacji GUS, Eurostatu i NBP.',
    status: 'concept',
  },
  {
    id: 'data',
    name: 'Dane i API',
    oneLine: 'Pliki do pobrania, licencje i cytowania; później publiczne API.',
    status: 'concept',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    oneLine: 'Studia przypadków: dashboardy na danych demonstracyjnych i publicznych.',
    status: 'concept',
    href: '/portfolio',
  },
  {
    id: 'markets',
    name: 'Rynki',
    oneLine: 'Kursy walut i stopy NBP z otwartych danych.',
    status: 'concept',
  },
];
