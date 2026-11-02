import React, { useState, type ReactNode } from 'react';
import { ProductsSection } from './components/ProductsSection';
import { HeroConsultingSection } from './components/HeroConsultingSection';
import { ProductItem } from './types';
import { CheckCircle2 } from 'lucide-react';
import type { Locale } from './i18n';
import { TodayStrip, type TodayTile } from './indicators/TodayStrip';
import { HomeChanges } from './growth/HomeChanges';
import type { ChangeItem, Source } from './published';
import { HomeSpotlight, type SpotlightData } from './regions/HomeSpotlight';
import { ChartOfDayBlock } from './growth/ChartOfDayBlock';
import type { HomeChartOfDay } from './growth/homeChartOfDay';
import { CONTAINER } from './components/container';

export default function App({
  tiles,
  items,
  sources,
  spotlight,
  spotlightMap,
  chartOfDay,
  chartOfDayChart,
  locale,
}: {
  tiles: TodayTile[];
  items: ChangeItem[];
  sources: Source[];
  spotlight: SpotlightData | null;
  spotlightMap: ReactNode;
  chartOfDay: HomeChartOfDay | null;
  /** The series chart and its table for the chart of the day; the chart is client-only (D25). */
  chartOfDayChart?: ReactNode;
  locale: Locale;
}) {
  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNavigate = (sectionId: string) => {
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectProduct = (product: ProductItem) => {
    // Scroll to consulting section to book demo or open exploration
    handleNavigate('consulting');
    showToast(`Selected "${product.name}". Consultation request ready below.`);
  };

  return (
    <div className="flex-1 flex flex-col">
      
      {/* The header, footer and page background come from root.tsx (#385, #386). */}
      {/* Main 8-Section Sequential Flow as mandated by PRD & Mockup */}
      <main className="flex-1">
        
        <TodayStrip tiles={tiles} locale={locale} />
        <HomeChanges items={items} sources={sources} locale={locale} />

        <HomeSpotlight data={spotlight} locale={locale}>
          {spotlightMap}
        </HomeSpotlight>
        {chartOfDay ? (
          <section aria-label={locale === 'pl' ? 'Wykres dnia' : 'Chart of the day'} className={`${CONTAINER} py-8`}>
            <ChartOfDayBlock pick={chartOfDay.pick} sourceName={chartOfDay.sourceName} date={chartOfDay.date} locale={locale}>
              {chartOfDayChart}
            </ChartOfDayBlock>
          </section>
        ) : null}

        {/* 7. The Products: Commercial Analytics Suites */}
        <ProductsSection
          onSelectProduct={handleSelectProduct}
        />

        {/* 8. The Hero Section / The Gateway: B2B Consulting & Radosław Utkała Profile */}
        <HeroConsultingSection
          onSubmitSuccess={() => {
            showToast('Consultation request transmitted to Radosław Utkała.');
          }}
        />

      </main>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#24292E] text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-2.5 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#3B8B94] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
