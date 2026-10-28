import React from 'react';
import { useT } from '../i18n';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const t = useT();
  return (
    <footer className="w-full bg-[#1E252B] text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <li>
                <button onClick={() => onNavigate('pulse')} className="hover:text-white transition-colors">
                  {t.footer.pulse}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('metrics')} className="hover:text-white transition-colors">
                  {t.footer.metrics}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('compass')} className="hover:text-white transition-colors">
                  {t.footer.compass}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('vault')} className="hover:text-white transition-colors">
                  {t.footer.vault}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <div>
            © {new Date().getFullYear()} {t.common.site} • {t.footer.foundedBy} <strong className="text-slate-300">{t.footer.founder}</strong>.
          </div>
          <div className="flex items-center space-x-4">
            <span>{t.footer.sources}</span>
            <span>•</span>
            <span className="text-[#3B8B94]">{t.footer.credit}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
