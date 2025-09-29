import { useState } from "react"
import { Eye, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BeforeAfterSlider } from "@/components/before-after-slider"

const categories = ["All", "Logos", "Thumbnails", "Video Editing", "YouTube Branding"]

const portfolioItems = [
  {
    id: 1,
    title: "TechFlow Startup Logo",
    category: "Logos",
    description: "Modern logo design for a fintech startup that raised $5M Series A funding",
    image: "/api/placeholder/400/300",
    beforeImage: "/api/placeholder/400/300",
    afterImage: "/api/placeholder/400/300",
    tags: ["Logo", "Fintech", "Startup"],
    results: "Helped secure $5M funding"
  },
  {
    id: 2,
    title: "Gaming Channel Thumbnail Pack",
    category: "Thumbnails",
    description: "High-converting thumbnail series that boosted CTR from 2% to 15%",
    image: "/api/placeholder/400/300",
    tags: ["Gaming", "YouTube", "CTR"],
    results: "650% CTR improvement"
  },
  {
    id: 3,
    title: "SaaS Product Launch Video",
    category: "Video Editing",
    description: "Professional launch video with motion graphics that drove $2M in first-month sales",
    image: "/api/placeholder/400/300",
    tags: ["SaaS", "Launch", "Motion Graphics"],
    results: "$2M first-month revenue"
  },
  {
    id: 4,
    title: "MrBeast Style Channel Setup",
    category: "YouTube Branding",
    description: "Complete channel transformation including branding, SEO setup, and content strategy",
    image: "/api/placeholder/400/300",
    tags: ["YouTube", "Channel Setup", "SEO"],
    results: "500K subscribers in 6 months"
  },
  {
    id: 5,
    title: "E-commerce Brand Identity",
    category: "Logos",
    description: "Complete logo suite and brand identity for $10M e-commerce company",
    image: "/api/placeholder/400/300",
    tags: ["E-commerce", "Brand Identity", "Premium"],
    results: "300% brand recognition increase"
  },
  {
    id: 6,
    title: "Viral Cooking Thumbnails",
    category: "Thumbnails",
    description: "Thumbnail series that generated over 50M combined views for cooking channel",
    image: "/api/placeholder/400/300",
    tags: ["Cooking", "Viral", "YouTube"],
    results: "50M+ total views"
  },
  {
    id: 7,
    title: "Tech Review Channel Rebrand",
    category: "Video Editing",
    description: "Complete video editing overhaul with custom intro, transitions, and graphics",
    image: "/api/placeholder/400/300",
    tags: ["Tech", "Reviews", "Branding"],
    results: "200% engagement increase"
  },
  {
    id: 8,
    title: "Fitness Influencer Channel",
    category: "YouTube Branding",
    description: "Full YouTube setup with channel art, SEO optimization, and content planning",
    image: "/api/placeholder/400/300",
    tags: ["Fitness", "Influencer", "Growth"],
    results: "1M+ subscribers gained"
  },
  {
    id: 9,
    title: "Cryptocurrency Exchange Logo",
    category: "Logos",
    description: "Professional logo design for cryptocurrency platform handling $500M+ transactions",
    image: "/api/placeholder/400/300",
    tags: ["Crypto", "Finance", "Trust"],
    results: "Increased user trust by 400%"
  }
]

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("All")
  
  const filteredItems = activeCategory === "All" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeCategory)

  return (
    <main className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Portfolio That <span className="text-gradient-youtube">Drives Results</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real projects, real results. Each design is crafted to not just look amazing, but to drive measurable business growth for my clients.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
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

        {/* Before/After showcase */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            See the <span className="text-gradient-youtube">Transformation</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <BeforeAfterSlider
                beforeImage="/api/placeholder/600/400"
                afterImage="/api/placeholder/600/400"
                beforeLabel="Old Design"
                afterLabel="New Design"
                className="mb-4"
              />
              <h3 className="font-semibold text-foreground mb-2">YouTube Thumbnail Redesign</h3>
              <p className="text-sm text-muted-foreground">CTR increased from 2% to 15% after the redesign</p>
            </div>
            <div>
              <BeforeAfterSlider
                beforeImage="/api/placeholder/600/400"
                afterImage="/api/placeholder/600/400"
                beforeLabel="Before"
                afterLabel="After"
                className="mb-4"
              />
              <h3 className="font-semibold text-foreground mb-2">Brand Logo Evolution</h3>
              <p className="text-sm text-muted-foreground">Modern redesign that helped secure $2M funding</p>
            </div>
          </div>
        </div>

        {/* Portfolio grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="portfolio-item bg-card rounded-xl overflow-hidden shadow-small hover:shadow-premium transition-all duration-500 group"
            >
              <div className="relative aspect-video bg-muted">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="portfolio-overlay">
                  <div className="text-white">
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="secondary" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="secondary" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

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
                <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                
                <div className="bg-gradient-youtube/10 text-youtube-red px-3 py-2 rounded-lg text-sm font-medium">
                  📈 {item.results}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-subtle rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Get Similar Results?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Let's discuss your project and create designs that don't just look great, but drive real business growth.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-semibold px-8 py-4"
            >
              Start Your Project Today
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}