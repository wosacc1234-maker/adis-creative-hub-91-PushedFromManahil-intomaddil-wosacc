/**
 * Blog Page with Pagination
 * Displays blog posts with pagination, search, and category filtering
 */

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, Clock, User, ArrowRight, Search, Tag, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchBlogs } from "@/utils/api";
import { BlogGridSkeleton } from "@/components/skeleton-loader";
import { SEOHead } from "@/components/seo-head";
import { useAnalytics } from "@/utils/analytics";
import type { Blog } from "@/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const categories = ["All", "Design Tips", "YouTube Growth", "Branding", "Tutorials", "Case Studies"];
const ITEMS_PER_PAGE = 10;

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const analytics = useAnalytics();
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    setCurrentPage(page);
    loadBlogs(page);
  }, [searchParams]);

  const loadBlogs = async (page: number) => {
    setLoading(true);
    const response = await fetchBlogs(page, ITEMS_PER_PAGE);
    setBlogs(response.data);
    setTotalPages(response.totalPages);
    setLoading(false);
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredPosts = blogs.filter(post => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogs.filter(post => post.featured).slice(0, 3);

  return (
    <>
      <SEOHead
        title="Design Insights & Tips | Adil GFX Blog"
        description="Practical design tips, case studies, and insights for YouTube creators, startups, and brands. Learn from real projects and proven strategies."
        keywords="design tips, YouTube growth, branding, logo design, video editing"
      />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Design <span className="text-gradient-youtube">Insights</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Practical tips, case studies, and insights to help you create designs that convert. 
              Learn from real projects and proven strategies.
            </p>
          </div>

          {/* Featured posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
                <TrendingUp className="h-6 w-6 text-youtube-red mr-2" />
                Featured Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                  <Link 
                    key={post.id}
                    to={`/blog/${post.slug || post.id}`}
                    className="block group"
                  >
                    <div className="card-premium hover:scale-105 transition-all duration-500">
                      <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                        <img 
                          src={post.featuredImage} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-gradient-youtube text-white px-3 py-1 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                        <span className="text-sm text-muted-foreground">{post.readTime}</span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-youtube-red transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-youtube-red group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Search and filter */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label="Search articles"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                    className={`font-medium transition-smooth ${
                      activeCategory === category
                        ? "bg-gradient-youtube text-white"
                        : "border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white"
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Blog posts grid */}
          {loading ? (
            <BlogGridSkeleton />
          ) : (
            <>
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No articles found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {filteredPosts.map((post) => (
                    <Link 
                      key={post.id}
                      to={`/blog/${post.slug || post.id}`}
                      className="block group"
                    >
                      <div className="card-premium hover:scale-105 transition-all duration-500 h-full flex flex-col">
                        <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                          <img 
                            src={post.featuredImage} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium">
                              {post.category}
                            </span>
                            <span className="text-xs text-muted-foreground">{post.readTime}</span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-youtube-red transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                            {post.excerpt}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mb-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>{post.author.name}</span>
                            </div>
                            <span>{new Date(post.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mb-16">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === currentPage}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}

          {/* Newsletter signup */}
          <div className="text-center">
            <div className="bg-gradient-subtle rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Stay Updated with Design Trends
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get weekly insights, case studies, and design tips delivered to your inbox. 
                Plus, get access to exclusive design resources and templates.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1"
                  aria-label="Email address for newsletter"
                />
                <Button 
                  className="bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-semibold px-8"
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Free resources included. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
