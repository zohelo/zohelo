import { useMemo, useState, type ReactNode } from 'react';

export type DataTableColumn<T> = {
  key: keyof T & string;
  label: string;
  /** Numeric columns are right-aligned with tabular figures. */
  align?: 'left' | 'right';
  format?: (value: T[keyof T]) => ReactNode;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  sortable?: boolean;
  /** Read by screen readers; rendered as the table's caption. */
  caption: string;
};

type Sort = { key: string; dir: 'asc' | 'desc' } | null;

/** Numbers compare numerically, everything else with localeCompare; empty values sort last. */
export function compareValues(a: unknown, b: unknown): number {
  const empty = (v: unknown) => v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));
  if (empty(a) || empty(b)) return empty(a) === empty(b) ? 0 : empty(a) ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

/** A table with a sticky header; a click (or Enter/Space) on a header sorts ascending, then descending. */
export function DataTable<T extends Record<string, unknown>>({ columns, rows, sortable, caption }: DataTableProps<T>) {
  const [sort, setSort] = useState<Sort>(null);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => factor * compareValues(a[sort.key], b[sort.key]));
  }, [rows, sort]);

  const toggle = (key: string) =>
    setSort((s) => (s?.key === key && s.dir === 'asc' ? { key, dir: 'desc' } : { key, dir: 'asc' }));

  return (
    <table className="w-full border-collapse font-ui text-[length:var(--z-size-sm)] text-text">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {columns.map((c) => {
            const right = c.align === 'right';
            const active = sort?.key === c.key;
            const ariaSort = active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : sortable ? 'none' : undefined;
            return (
              <th
                key={c.key}
                scope="col"
                aria-sort={ariaSort}
                tabIndex={sortable ? 0 : undefined}
                onClick={sortable ? () => toggle(c.key) : undefined}
                onKeyDown={
                  sortable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggle(c.key);
                        }
                      }
                    : undefined
                }
                className={`sticky top-0 z-10 border-b border-border bg-surface-2 px-3 py-2 font-semibold text-text-muted ${
                  right ? 'text-right' : 'text-left'
                } ${sortable ? 'cursor-pointer select-none hover:text-text focus-visible:outline-2 focus-visible:outline-focus' : ''}`}
              >
                {c.label}
                {active ? <span aria-hidden="true">{sort.dir === 'asc' ? ' ▲' : ' ▼'}</span> : null}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, i) => (
          <tr key={i} className="border-b border-border">
            {columns.map((c) => (
              <td key={c.key} className={`px-3 py-2 ${c.align === 'right' ? 'z-figures text-right' : 'text-left'}`}>
                {c.format ? c.format(row[c.key]) : String(row[c.key] ?? '–')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
