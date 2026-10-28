import React from 'react';
import { ArrowRight } from 'lucide-react';
import { productsList } from '../content/productsData';
import { ProductItem, ProductStatus } from '../types';

interface ProductsSectionProps {
  /** Kept for App.tsx's current call; the roadmap has no actions (removed with the CTAs). */
  onSelectProduct?: (product: ProductItem) => void;
}

const statusLabel: Record<ProductStatus, string> = {
  concept: 'Koncepcja',
  building: 'W budowie',
  live: 'Dostępne',
};

const statusClass: Record<ProductStatus, string> = {
  concept: 'bg-slate-100 text-slate-600 border border-slate-200',
  building: 'bg-amber-50 text-amber-800 border border-amber-200',
  live: 'bg-[#EBF5F6] text-[#2C6E76] border border-[#3B8B94]/30',
};

export const ProductsSection: React.FC<ProductsSectionProps> = () => {
  return (
    <section id="products" className="w-full pt-4 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500">
            Produkty
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Części zohelo i etap, na którym jest każda z nich
          </p>
        </div>

        {/* Roadmap Grid */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {productsList.map((product) => {
            const body = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900">{product.name}</h3>
                  <span className={`shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusClass[product.status]}`}>
                    {statusLabel[product.status]}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{product.oneLine}</p>
                {product.href ? (
                  <span className="mt-4 inline-flex items-center text-xs font-semibold text-[#2C6E76]">
                    Zobacz <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                  </span>
                ) : null}
              </>
            );
            return (
              <li key={product.id}>
                {product.href ? (
                  <a href={product.href} className="zohelo-card p-6 block h-full hover:border-[#3B8B94]">
                    {body}
                  </a>
                ) : (
                  <div className="zohelo-card-no-hover p-6 h-full">{body}</div>
                )}
              </li>
            );
          })}
        </ul>

      </div>
    </section>
  );
};
