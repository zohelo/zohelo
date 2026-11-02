export type ProductStatus = 'concept' | 'building' | 'live';

export interface ProductItem {
  id: string;
  name: string;
  oneLine: string;
  status: ProductStatus;
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
