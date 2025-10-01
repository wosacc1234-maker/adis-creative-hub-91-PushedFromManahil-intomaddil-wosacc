/**
 * Dynamic Page Renderer Component
 * Renders pages based on CMS-defined sections
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPageBySlug } from '@/utils/api';
import { SEOHead } from '@/components/seo-head';
import { HeroSection } from '@/components/hero-section';
import { ServicesOverview } from '@/components/services-overview';
import { PortfolioHighlights } from '@/components/portfolio-highlights';
import { TestimonialsSection } from '@/components/testimonials-section';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PageSection {
  type: string;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  settings?: Record<string, any>;
}

interface DynamicPage {
  id: number;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  schemaType?: string;
  sections: PageSection[];
}

export function DynamicPageRenderer() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<DynamicPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadPage(slug);
    }
  }, [slug]);

  const loadPage = async (pageSlug: string) => {
    try {
      setLoading(true);
      const pageData = await fetchPageBySlug(pageSlug);
      
      if (pageData) {
        setPage(pageData);
      } else {
        setError('Page not found');
      }
    } catch (err) {
      setError('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section: PageSection, index: number) => {
    switch (section.type) {
      case 'hero':
        return (
          <section key={index} className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-subtle"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
              {section.title && (
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                  {section.title}
                </h1>
              )}
              {section.subtitle && (
                <h2 className="text-xl sm:text-2xl text-muted-foreground mb-6">
                  {section.subtitle}
                </h2>
              )}
              {section.description && (
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                  {section.description}
                </p>
              )}
              {section.ctaText && section.ctaUrl && (
                <Button 
                  size="lg"
                  className="bg-gradient-youtube hover:shadow-glow transition-all duration-300"
                  onClick={() => window.location.href = section.ctaUrl}
                >
                  {section.ctaText}
                </Button>
              )}
            </div>
          </section>
        );

      case 'services':
        return <ServicesOverview key={index} />;

      case 'portfolio':
        return <PortfolioHighlights key={index} />;

      case 'testimonials':
        return <TestimonialsSection key={index} />;

      case 'content':
        return (
          <section key={index} className="py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {section.title && (
                <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
                  {section.title}
                </h2>
              )}
              {section.subtitle && (
                <h3 className="text-xl text-muted-foreground mb-8 text-center">
                  {section.subtitle}
                </h3>
              )}
              {section.imageUrl && (
                <div className="aspect-video bg-muted rounded-xl overflow-hidden mb-8">
                  <img 
                    src={section.imageUrl} 
                    alt={section.title || 'Content image'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {section.content && (
                <div 
                  className="prose prose-lg max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}
              {section.ctaText && section.ctaUrl && (
                <div className="text-center mt-8">
                  <Button 
                    size="lg"
                    className="bg-gradient-youtube hover:shadow-glow transition-all duration-300"
                    onClick={() => window.location.href = section.ctaUrl}
                  >
                    {section.ctaText}
                  </Button>
                </div>
              )}
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key={index} className="py-16 bg-gradient-subtle">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              {section.title && (
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {section.title}
                </h2>
              )}
              {section.description && (
                <p className="text-xl text-muted-foreground mb-8">
                  {section.description}
                </p>
              )}
              {section.ctaText && section.ctaUrl && (
                <Button 
                  size="lg"
                  className="bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-semibold px-8 py-4"
                  onClick={() => window.location.href = section.ctaUrl}
                >
                  {section.ctaText}
                </Button>
              )}
            </div>
          </section>
        );

      default:
        return (
          <section key={index} className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-muted rounded-lg p-6 text-center">
                <p className="text-muted-foreground">
                  Unknown section type: {section.type}
                </p>
              </div>
            </div>
          </section>
        );
    }
  };

  if (loading) {
    return (
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-5/6 mb-8" />
          <Skeleton className="aspect-video w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !page) {
    return (
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {error || 'Page Not Found'}
          </h1>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-youtube"
          >
            Go Home
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <SEOHead
        title={page.metaTitle || page.title}
        description={page.metaDescription}
        keywords={page.metaKeywords}
        image={page.ogImage}
        url={`https://adilgfx.com/${page.slug}`}
      />
      
      <main className="pt-16">
        {page.sections.map((section, index) => renderSection(section, index))}
      </main>
    </>
  );
}