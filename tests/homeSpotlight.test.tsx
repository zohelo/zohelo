import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomeSpotlight, type SpotlightData } from '../src/regions/HomeSpotlight';

const data: SpotlightData = {
  kpi_key: 'unemployment_rate',
  name: 'Stopa bezrobocia (BAEL)',
  unit: '%',
  period: '2025',
  top: [
    { teryt: '12', name: 'Małopolskie', value: 6.1, rank: 1 },
    { teryt: '14', name: 'Mazowieckie', value: 5.2, rank: 2 },
    { teryt: '02', name: 'Dolnośląskie', value: 4.8, rank: 3 },
  ],
  bottom: [
    { teryt: '30', name: 'Wielkopolskie', value: 2.1, rank: 14 },
    { teryt: '22', name: 'Pomorskie', value: 2.0, rank: 15 },
    { teryt: '24', name: 'Śląskie', value: 1.9, rank: 16 },
  ],
};

describe('HomeSpotlight', () => {
  test('Polish markup', () => {
    const html = renderToStaticMarkup(<HomeSpotlight data={data} locale="pl" />);
    expect(html).toContain('Najwyżej');
    expect(html).toContain('Najniżej');
    expect(html).toContain('href="/regions/12"');
  });

  test('English markup', () => {
    const html = renderToStaticMarkup(<HomeSpotlight data={data} locale="en" />);
    expect(html).toContain('Highest');
    expect(html).toContain('href="/en/regions/12"');
  });

  test('empty bottom has no Najniżej', () => {
    const html = renderToStaticMarkup(<HomeSpotlight data={{ ...data, bottom: [] }} locale="pl" />);
    expect(html).not.toContain('Najniżej');
  });

  test('null renders nothing', () => {
    expect(renderToStaticMarkup(<HomeSpotlight data={null} locale="pl" />)).toBe('');
  });
});
