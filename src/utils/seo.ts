/**
 * SEO Utilities
 * Helper functions for generating structured data and meta tags
 */

import type { Blog, Service, Testimonial, PortfolioItem } from '@/types';

/**
 * Generate Article schema (JSON-LD) for blog posts
 */
export const generateArticleSchema = (blog: Blog) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.featuredImage,
    datePublished: blog.date,
    dateModified: blog.date,
    author: {
      '@type': 'Person',
      name: blog.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Adil GFX',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png',
      },
    },
    keywords: blog.tags.join(', '),
  };
};

/**
 * Generate Service schema (JSON-LD) for services
 */
export const generateServiceSchema = (service: Service) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'Adil GFX',
    },
    offers: service.pricingTiers.map(tier => ({
      '@type': 'Offer',
      name: tier.name,
      price: tier.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    })),
  };
};

/**
 * Generate Review schema (JSON-LD) for testimonials
 */
export const generateReviewSchema = (testimonial: Testimonial) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: testimonial.name,
    },
    datePublished: testimonial.date,
    reviewBody: testimonial.content,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: testimonial.rating,
      bestRating: 5,
    },
    itemReviewed: {
      '@type': 'Service',
      name: testimonial.projectType,
    },
  };
};

/**
 * Generate Organization schema (JSON-LD)
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Adil GFX',
    url: 'https://adilgfx.com',
    logo: '/logo.png',
    description: 'Professional design services for logos, thumbnails, video editing, and YouTube branding.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-123-4567',
      contactType: 'Customer Service',
      email: 'hello@adilgfx.com',
    },
    sameAs: [
      'https://twitter.com/adilgfx',
      'https://instagram.com/adilgfx',
      'https://youtube.com/@adilgfx',
    ],
  };
};

/**
 * Generate Creative Work schema for portfolio items
 */
export const generateCreativeWorkSchema = (item: PortfolioItem) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: item.title,
    description: item.description,
    image: item.featuredImage,
    creator: {
      '@type': 'Person',
      name: 'Adil',
    },
    dateCreated: item.completionDate,
    keywords: item.tags.join(', '),
  };
};

/**
 * Helper to inject JSON-LD script into head
 */
export const injectStructuredData = (schema: Record<string, any>) => {
  if (typeof document === 'undefined') return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);

  return () => {
    document.head.removeChild(script);
  };
};
