/**
 * TypeScript Type Definitions
 * Centralized type declarations for the entire application
 */

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  date: string;
  readTime: string;
  featuredImage: string;
  tags: string[];
  featured: boolean;
  views: number;
  likes: number;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  date: string;
  projectType: string;
  verified: boolean;
}

export interface PortfolioItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  longDescription: string;
  client: string;
  completionDate: string;
  featuredImage: string;
  images: string[];
  beforeImage: string;
  afterImage: string;
  tags: string[];
  results: {
    metric1: string;
    metric2: string;
    metric3: string;
  };
  featured: boolean;
  views: number;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  icon: string;
  tagline: string;
  description: string;
  features: string[];
  pricingTiers: PricingTier[];
  deliveryTime: string;
  popular: boolean;
  testimonialIds: number[];
}

export interface PricingTier {
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

export interface Notification {
  id: number;
  type: 'success' | 'info' | 'reward' | 'promo' | 'milestone';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl: string;
  icon: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  service: string;
  budget: string;
  message: string;
  timeline: string;
  phone?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';
