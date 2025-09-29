import { ExternalLink, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

const portfolioItems = [
  {
    id: 1,
    title: "Gaming Channel Logo",
    category: "Logo Design",
    description: "Bold gaming logo that increased brand recognition by 300%",
    image: "/api/placeholder/400/300",
    tags: ["Logo", "Gaming", "Branding"]
  },
  {
    id: 2,
    title: "Viral YouTube Thumbnail",
    category: "Thumbnail Design",
    description: "This thumbnail achieved 2M+ views and 15% CTR",
    image: "/api/placeholder/400/300",
    tags: ["Thumbnail", "YouTube", "High CTR"]
  },
  {
    id: 3,
    title: "Brand Identity Package",
    category: "Complete Branding",
    description: "Full brand identity that tripled client conversions",
    image: "/api/placeholder/400/300",
    tags: ["Branding", "Identity", "Package"]
  },
  {
    id: 4,
    title: "Product Launch Video",
    category: "Video Editing",
    description: "Launch video that generated $100K+ in first week",
    image: "/api/placeholder/400/300",
    tags: ["Video", "Launch", "Sales"]
  }
]

export function PortfolioHighlights() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Portfolio That <span className="text-gradient-youtube">Converts</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real projects, real results. See how my designs helped clients grow their businesses and increase engagement.
          </p>
        </div>

        {/* Portfolio grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {portfolioItems.map((item) => (
            <div 
              key={item.id} 
              className="portfolio-item bg-card rounded-xl overflow-hidden shadow-small hover:shadow-premium transition-all duration-500 group"
            >
              {/* Image container */}
              <div className="relative aspect-video bg-muted">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="portfolio-overlay">
                  <div className="text-white">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm opacity-90">{item.category}</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white font-semibold px-8 py-4 transition-smooth"
          >
            View Full Portfolio
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}