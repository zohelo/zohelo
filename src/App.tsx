import React, { useState } from 'react';
import { Header } from './components/Header';
import { PulseSection } from './components/PulseSection';
import { ProductsSection } from './components/ProductsSection';
import { HeroConsultingSection } from './components/HeroConsultingSection';
import { Footer } from './components/Footer';
import { ProductItem } from './types';
import { CheckCircle2 } from 'lucide-react';
import type { Locale } from './i18n';
import { TodayStrip, type TodayTile } from './indicators/TodayStrip';
import { HomeChanges } from './growth/HomeChanges';
import type { ChangeItem, Source } from './published';
import { HomeSpotlight, type SpotlightData } from './regions/HomeSpotlight';
import { ChartOfDayBlock } from './growth/ChartOfDayBlock';
import type { HomeChartOfDay } from './growth/homeChartOfDay';

export default function App({
  tiles,
  items,
  sources,
  spotlight,
  chartOfDay,
  locale,
}: {
  tiles: TodayTile[];
  items: ChangeItem[];
  sources: Source[];
  spotlight: SpotlightData | null;
  chartOfDay: HomeChartOfDay | null;
  locale: Locale;
}) {
  const [activeSection, setActiveSection] = useState('top');
  
  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
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
    <div className="min-h-screen bg-[#F3F6F8] text-[#24292E] flex flex-col selection:bg-[#3B8B94]/20 selection:text-[#18484F]">
      
      {/* 1. The Header matching Mockup */}
      <Header activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main 8-Section Sequential Flow as mandated by PRD & Mockup */}
      <main className="flex-1">
        
        {/* 2. The Pulse: Live Ticker & Indicators */}
        <PulseSection
          onSelectIndicator={(ind) => {
            showToast(`Inspecting live quote for ${ind.name}`);
          }}
        />

        <TodayStrip tiles={tiles} locale={locale} />
        <HomeChanges items={items} sources={sources} locale={locale} />

        <HomeSpotlight data={spotlight} locale={locale} />
        {chartOfDay ? (
          <section aria-label={locale === 'pl' ? 'Wykres dnia' : 'Chart of the day'} className="mx-auto max-w-6xl px-4 py-8">
            <ChartOfDayBlock pick={chartOfDay.pick} sourceName={chartOfDay.sourceName} date={chartOfDay.date} locale={locale} />
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

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

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
