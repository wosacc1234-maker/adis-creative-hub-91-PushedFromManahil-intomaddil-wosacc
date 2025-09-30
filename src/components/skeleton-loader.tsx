/**
 * Skeleton Loader Components
 * Provides loading states for various content types
 */

import { Skeleton } from '@/components/ui/skeleton';

export const BlogCardSkeleton = () => (
  <div className="card-premium h-full flex flex-col">
    <Skeleton className="aspect-video rounded-lg mb-4" />
    <div className="flex-1 flex flex-col">
      <div className="flex items-center space-x-2 mb-3">
        <Skeleton className="h-6 w-24 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex flex-wrap gap-1 mb-4">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-20 rounded" />
        <Skeleton className="h-6 w-14 rounded" />
      </div>
      <div className="flex items-center justify-between mt-auto">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </div>
);

export const PortfolioCardSkeleton = () => (
  <div className="bg-card rounded-xl overflow-hidden shadow-small">
    <Skeleton className="aspect-video" />
    <div className="p-6">
      <div className="flex flex-wrap gap-2 mb-3">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-14 rounded-md" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-3" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  </div>
);

export const ServiceCardSkeleton = () => (
  <div className="card-premium">
    <div className="text-center">
      <Skeleton className="h-8 w-32 mx-auto mb-2" />
      <Skeleton className="h-12 w-24 mx-auto mb-2" />
      <Skeleton className="h-6 w-40 mx-auto mb-6" />
      
      <div className="space-y-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
      
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  </div>
);

export const TestimonialSkeleton = () => (
  <div className="card-premium">
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

export const BlogGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: 6 }).map((_, i) => (
      <BlogCardSkeleton key={i} />
    ))}
  </div>
);

export const PortfolioGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: 6 }).map((_, i) => (
      <PortfolioCardSkeleton key={i} />
    ))}
  </div>
);
