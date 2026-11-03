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
    expect(html).toContain('Najwyższa stopa bezrobocia (BAEL), 2025');
    expect(html).toContain('Najniższa stopa bezrobocia (BAEL), 2025');
    expect(html).not.toContain('>Najwyżej<');
    expect(html).toContain('href="/regions/12"');
  });

  test('English markup', () => {
    const html = renderToStaticMarkup(<HomeSpotlight data={data} locale="en" />);
    expect(renderToStaticMarkup(<HomeSpotlight data={{ ...data, name: 'Unemployment rate (LFS)' }} locale="en" />)).toContain('Highest unemployment rate (LFS), 2025');
    expect(html).toContain('href="/en/regions/12"');
  });

  test('fewer than 16 voivodeships with a value: no spotlight, no Najwyższa/Najniższa (#413)', () => {
    for (const of of [1, 15]) {
      const partial = { ...data, of, top: [data.top[0]], bottom: [] };
      for (const locale of ['pl', 'en'] as const) {
        const html = renderToStaticMarkup(<HomeSpotlight data={partial} locale={locale} />);
        expect(html).not.toMatch(/Najwyższa|Najniższa|Highest|Lowest/);
        expect(html).toBe('');
      }
    }
    expect(renderToStaticMarkup(<HomeSpotlight data={{ ...data, of: 16 }} locale="pl" />)).toContain('1. ');
  });

  test('empty bottom has no Najniżej', () => {
    const html = renderToStaticMarkup(<HomeSpotlight data={{ ...data, bottom: [] }} locale="pl" />);
    expect(html).not.toContain('Najniższa');
  });

  test('children render in the map slot', () => {
    const html = renderToStaticMarkup(
      <HomeSpotlight data={data} locale="pl">
        <span>MAP</span>
      </HomeSpotlight>,
    );
    expect(html).toContain('<span>MAP</span>');
    expect(html).toContain('min-h-[300px]');
  });

  test('no children, no map slot', () => {
    const html = renderToStaticMarkup(<HomeSpotlight data={data} locale="pl" />);
    expect(html).not.toContain('<span>MAP</span>');
    expect(html).not.toContain('min-h-[300px]');
  });

  test('null renders nothing', () => {
    expect(renderToStaticMarkup(<HomeSpotlight data={null} locale="pl" />)).toBe('');
  });
});
