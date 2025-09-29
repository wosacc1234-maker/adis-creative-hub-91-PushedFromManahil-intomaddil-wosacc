import { useState } from "react"
import { Link } from "react-router-dom"
import { Calendar, Clock, User, ArrowRight, Search, Tag, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const categories = ["All", "Design Tips", "YouTube Growth", "Branding", "Tutorials", "Case Studies"]

const blogPosts = [
  {
    id: 1,
    title: "5 YouTube Thumbnail Secrets That Boost CTR by 300%",
    excerpt: "Discover the psychology behind high-converting thumbnails and the exact techniques I use to create click-magnets for my clients.",
    content: "Creating thumbnails that stand out in the crowded YouTube ecosystem requires understanding both design principles and viewer psychology. After analyzing 1000+ successful thumbnails, I've identified 5 key secrets that consistently boost click-through rates...",
    category: "YouTube Growth",
    author: "Adil",
    date: "2024-01-20",
    readTime: "8 min read",
    image: "/api/placeholder/800/400",
    tags: ["YouTube", "Thumbnails", "CTR", "Growth"],
    featured: true
  },
  {
    id: 2,
    title: "The Ultimate Logo Design Checklist for 2024",
    excerpt: "Everything you need to know to create logos that build trust, recognition, and drive business growth in today's competitive market.",
    content: "A great logo is more than just a pretty symbol. It's the foundation of your brand identity and often the first impression potential customers have of your business. This comprehensive checklist covers every aspect of modern logo design...",
    category: "Design Tips",
    author: "Adil",
    date: "2024-01-18",
    readTime: "12 min read",
    image: "/api/placeholder/800/400",
    tags: ["Logo", "Branding", "Design", "Business"]
  },
  {
    id: 3,
    title: "Case Study: How a Simple Rebrand Generated $2M in Revenue",
    excerpt: "Deep dive into a complete brand transformation that took a struggling startup to unicorn status in just 18 months.",
    content: "When TechFlow approached me in early 2023, they were struggling with brand recognition and customer trust. Their logo looked outdated, their marketing materials were inconsistent, and investors weren't taking them seriously. Here's how we transformed everything...",
    category: "Case Studies",
    author: "Adil",
    date: "2024-01-16",
    readTime: "15 min read",
    image: "/api/placeholder/800/400",
    tags: ["Case Study", "Rebranding", "Revenue", "Success"],
    featured: true
  },
  {
    id: 4,
    title: "Color Psychology in Brand Design: What Your Colors Say About You",
    excerpt: "Learn how to choose colors that not only look great but also communicate the right message to your target audience.",
    content: "Color is one of the most powerful tools in a designer's arsenal. It can evoke emotions, influence decisions, and create lasting memories. Understanding color psychology is crucial for creating effective brand designs...",
    category: "Branding",
    author: "Adil",
    date: "2024-01-14",
    readTime: "10 min read",
    image: "/api/placeholder/800/400",
    tags: ["Color", "Psychology", "Branding", "Design"]
  },
  {
    id: 5,
    title: "From Photoshop to Figma: My Complete Design Workflow",
    excerpt: "Step-by-step breakdown of my design process, tools, and techniques that help me deliver premium results consistently.",
    content: "Over the years, I've refined my design workflow to maximize efficiency while maintaining the highest quality standards. Here's my complete process from initial concept to final delivery...",
    category: "Tutorials",
    author: "Adil",
    date: "2024-01-12",
    readTime: "18 min read",
    image: "/api/placeholder/800/400",
    tags: ["Workflow", "Photoshop", "Figma", "Tutorial"]
  },
  {
    id: 6,
    title: "Why Your YouTube Channel Needs Consistent Visual Branding",
    excerpt: "Discover how consistent visual branding can increase subscriber retention by up to 80% and boost viewer trust.",
    content: "Visual consistency across your YouTube channel is more than just aesthetics—it's a powerful tool for building audience loyalty and trust. Here's why it matters and how to implement it...",
    category: "YouTube Growth",
    author: "Adil",
    date: "2024-01-10",
    readTime: "7 min read",
    image: "/api/placeholder/800/400",
    tags: ["YouTube", "Branding", "Consistency", "Growth"]
  },
  {
    id: 7,
    title: "The Psychology of High-Converting Landing Page Design",
    excerpt: "Learn the design principles and psychological triggers that turn visitors into customers and boost conversion rates.",
    content: "A well-designed landing page is like a digital salesperson that never sleeps. Every element, from color choice to button placement, plays a crucial role in guiding visitors toward conversion...",
    category: "Design Tips",
    author: "Adil",
    date: "2024-01-08",
    readTime: "14 min read",
    image: "/api/placeholder/800/400",
    tags: ["Landing Page", "Conversion", "Psychology", "UX"]
  },
  {
    id: 8,
    title: "Building a Million-Dollar Brand Identity: Lessons from Top Startups",
    excerpt: "Analyze the branding strategies of successful startups and learn how to apply these insights to your own brand.",
    content: "What makes some brands instantly recognizable while others fade into obscurity? The answer lies in strategic brand identity development. Let's examine what the most successful startups do right...",
    category: "Branding",
    author: "Adil",
    date: "2024-01-06",
    readTime: "16 min read",
    image: "/api/placeholder/800/400",
    tags: ["Startup", "Brand Identity", "Strategy", "Success"]
  },
  {
    id: 9,
    title: "YouTube SEO: How to Optimize Your Channel for Maximum Growth",
    excerpt: "Complete guide to YouTube SEO including channel setup, keyword research, and optimization strategies that actually work.",
    content: "YouTube SEO is more than just stuffing keywords into your titles. It's about understanding how the algorithm works and optimizing every aspect of your channel for discovery and growth...",
    category: "YouTube Growth",
    author: "Adil",
    date: "2024-01-04",
    readTime: "20 min read",
    image: "/api/placeholder/800/400",
    tags: ["YouTube", "SEO", "Growth", "Optimization"],
    featured: true
  },
  {
    id: 10,
    title: "The $50K Logo: When Premium Design Pays Off",
    excerpt: "Real case study of a high-value logo project and why investing in premium design can transform your business.",
    content: "Not all logos are created equal. Sometimes, investing in premium design can be the difference between success and failure. Here's the story of a $50K logo project that changed everything...",
    category: "Case Studies",
    author: "Adil",
    date: "2024-01-02",
    readTime: "11 min read",
    image: "/api/placeholder/800/400",
    tags: ["Case Study", "Premium", "Logo", "Investment"]
  }
]

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredPosts = blogPosts.filter(post => post.featured)
  const latestPosts = blogPosts.slice(0, 4)

  return (
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
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
            <TrendingUp className="h-6 w-6 text-youtube-red mr-2" />
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <Link 
                key={post.id}
                to={`/blog/${post.id}`}
                className="block group"
              >
                <div className="card-premium hover:scale-105 transition-all duration-500">
                  <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={post.image} 
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredPosts.map((post) => (
            <Link 
              key={post.id}
              to={`/blog/${post.id}`}
              className="block group"
            >
              <div className="card-premium hover:scale-105 transition-all duration-500 h-full flex flex-col">
                <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={post.image} 
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
                      <span>{post.author}</span>
                    </div>
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

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
  )
}