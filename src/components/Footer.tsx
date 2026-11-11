import React from 'react';
import { localizedPath, useLocale, useT } from '../i18n';
import { CONTAINER } from './container';

const links = [
  { key: 'indicators', path: '/indicators' },
  { key: 'regions', path: '/regions' },
  { key: 'changes', path: '/changes' },
  { key: 'sources', path: '/sources' },
] as const;

/** `sources`: the names of the sources that feed something shown, in the page language, read by the root loader at build. */
/** `dataAsOf`: the catalog's generated_at as a Warsaw date and time, shown on every page (zohelo#470). */
export const Footer: React.FC<{ sources?: string[]; dataAsOf?: string }> = ({ sources = [], dataAsOf = '' }) => {
  const t = useT();
  const locale = useLocale();
  return (
    <footer className="w-full bg-[#1E252B] text-slate-300 border-t border-slate-800 text-xs">
      <div className={`${CONTAINER} py-12`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Col (Cols 1-5) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-baseline space-x-2">
              <span className="font-serif-heading text-2xl font-bold text-white tracking-tight">
                {t.common.brand}
              </span>
              <span className="text-[10px] font-mono-code font-semibold tracking-wider text-[#4EB0BA] bg-[#3B8B94]/20 px-2 py-0.5 rounded">
                {t.footer.badge}
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {t.footer.about}
            </p>
          </div>

          {/* Nav Links (Cols 6-8) */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.footer.navHeading}
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              {links.map((link) => (
                <li key={link.path}>
                  <a
                    href={localizedPath(link.path, locale)}
                    className="inline-flex min-h-6 items-center hover:text-white transition-colors"
                  >
                    {t.nav[link.key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div>
            © {new Date().getFullYear()} {t.common.site} • {t.footer.foundedBy} <strong className="text-slate-300">{t.footer.founder}</strong>.
          </div>
          <div className="flex items-center space-x-4">
            <span>
              <a href={localizedPath('/sources', locale)} className="underline hover:text-white">
                {t.footer.sources}
              </a>
              {sources.length > 0 ? ` ${sources.join(', ')}` : null}
            </span>
          </div>
        </div>
        {dataAsOf ? <p className="pt-3 text-xs text-slate-400">{t.footer.dataAsOf} {dataAsOf}</p> : null}
      </div>
    </footer>
  );
};
