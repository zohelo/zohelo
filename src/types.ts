export type ProductStatus = 'concept' | 'building' | 'live';

export interface ProductItem {
  id: string;
  /** Polish name and one-liner; `en` carries the English pair. */
  name: string;
  oneLine: string;
  en: { name: string; oneLine: string };
  status: ProductStatus;
  /** The sub-product's page (Polish path; localised when rendered). Live sub-products always have one. */
  href?: string;
}

export interface ConsultantProfile {
  name: string;
  title: string;
  headline: string;
  bio: string;
  experienceYears: number;
  email: string;
  timeline: {
    year: string;
    role: string;
    description: string;
    milestone: string;
  }[];
  consultingSpecialties: string[];
}
