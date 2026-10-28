import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { flatten, themeCss, tokensCss } from './build-tokens';
import { tokens } from '../src/generated/tokens';

const root = join(import.meta.dir, '..');
const flat = flatten(JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8')));

test('tokens.css has the light value and a dark block', () => {
  const css = tokensCss(flat);
  expect(css).toContain('--z-color-brand-teal-strong: #2C6E76');
  expect(css).toContain(':root[data-theme=dark]');
  expect(css).toContain(':root:not([data-theme=light])');
});

test('theme.css is a Tailwind @theme block', () => {
  expect(themeCss(flat)).toContain('@theme');
});

test('tokens.ts dark bg', () => {
  expect(tokens.dark.bg).toBe('#111315');
});

test('every token appears in tokens.css', () => {
  const css = tokensCss(flat);
  for (const t of flat) expect(css).toContain(`--z-${t.group}-${t.name}: ${t.value};`);
});
