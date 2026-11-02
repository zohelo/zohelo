import React, { useState } from 'react';
import { Database, Menu, X } from 'lucide-react';
import { useLocation } from 'react-router';
import { localizedPath, useLocale, useT } from '../i18n';
import { CONTAINER } from './container';

/** The site header, rendered once per page from root.tsx on every route (#385). */
export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useT();
  const locale = useLocale();
  const { pathname } = useLocation();
  // The active item is the page or any page under it (/indicators/inflation marks "Wskaźniki").
  const current = (path: string) => {
    const href = localizedPath(path, locale);
    return pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined;
  };

  const navItems = [
    { label: t.nav.indicators, path: '/indicators' },
    { label: t.nav.regions, path: '/regions' },
    { label: t.nav.changes, path: '/changes' },
    { label: t.nav.sources, path: '/sources' },
  ];

  const languageToggle = (
    <nav aria-label={t.common.language} className="flex items-center text-xs font-mono-code font-semibold">
      {(['pl', 'en'] as const).map((l, i) => (
        <React.Fragment key={l}>
          {i > 0 && <span className="px-1 text-slate-400">|</span>}
          <a
            href={localizedPath(pathname, l)}
            hrefLang={l}
            aria-current={l === locale ? 'true' : undefined}
            className={l === locale ? 'text-[#2C6E76]' : 'text-slate-500 hover:text-[#3B8B94]'}
          >
            {t.common[l]}
          </a>
        </React.Fragment>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 bg-[#F4F7F9]/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className={CONTAINER}>
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - Crisp Newsreader Serif */}
          <div className="flex items-center space-x-3">
            <a
              href={localizedPath('/', locale)}
              aria-label={t.common.site}
              className="group flex items-baseline space-x-2 text-left focus:outline-none"
            >
              <span className="font-serif-heading text-3xl sm:text-4xl font-bold tracking-tight text-[#24292E] group-hover:text-[#3B8B94] transition-colors">
                {t.common.brand}
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono-code font-semibold tracking-wider text-[#3B8B94] bg-[#3B8B94]/10 px-2 py-0.5 rounded">
                {t.nav.badge}
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links matching Mockup (Research, Dashboards, Products, About...) */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={localizedPath(item.path, locale)}
                aria-current={current(item.path)}
                className="text-sm font-medium text-slate-700 hover:text-[#3B8B94] transition-colors py-1 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3B8B94] transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Action Tools */}
          <div className="hidden sm:flex items-center space-x-3">
            {languageToggle}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <span className="sm:hidden">{languageToggle}</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-200/60 focus:outline-none"
              aria-label={t.nav.toggleNav}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={localizedPath(item.path, locale)}
                aria-current={current(item.path)}
                className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#3B8B94] rounded-md"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
