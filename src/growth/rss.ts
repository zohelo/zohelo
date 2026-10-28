// RSS 2.0 for the what-changed feed (/rss.xml in Polish, /en/rss.xml in English), from the items of
// feed/changes.json (zohelo-data docs/published.md). Pure: no file, network or clock access.
import { site } from '../site.config';

export type FeedItem = {
  at: string;
  source_key: string;
  dataset_key: string;
  kpi_keys: string[];
  title_pl: string;
  title_en: string;
};

const MAX_ITEMS = 50;
const channelTitle = { pl: 'zohelo — co się zmieniło', en: 'zohelo — what changed' };

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const rfc822 = (iso: string) => new Date(iso).toUTCString();

export function renderRss(items: FeedItem[], locale: 'pl' | 'en', builtAt: string): string {
  const base = locale === 'pl' ? site.url : `${site.url}/en`;
  // Array.prototype.sort is stable, so items with the same `at` keep their input order.
  const newest = [...items].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0)).slice(0, MAX_ITEMS);
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${escapeXml(channelTitle[locale])}</title>`,
    `<link>${escapeXml(`${base}/changes`)}</link>`,
    `<description>${escapeXml(site.description[locale])}</description>`,
    `<language>${locale}</language>`,
    `<lastBuildDate>${escapeXml(rfc822(builtAt))}</lastBuildDate>`,
    `<atom:link href="${escapeXml(`${base}/rss.xml`)}" rel="self" type="application/rss+xml"/>`,
  ];
  for (const item of newest) {
    const link = item.kpi_keys.length ? `${base}/indicators/${item.kpi_keys[0]}` : `${base}/changes`;
    lines.push(
      '<item>',
      `<title>${escapeXml(locale === 'pl' ? item.title_pl : item.title_en)}</title>`,
      `<link>${escapeXml(link)}</link>`,
      `<guid isPermaLink="false">${escapeXml(`${item.source_key}:${item.dataset_key}:${item.at}`)}</guid>`,
      `<pubDate>${escapeXml(rfc822(item.at))}</pubDate>`,
      '</item>',
    );
  }
  lines.push('</channel>', '</rss>');
  return lines.join('\n');
}
