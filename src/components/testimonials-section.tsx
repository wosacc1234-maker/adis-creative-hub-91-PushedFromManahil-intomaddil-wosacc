import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "YouTube Creator (2M+ Subscribers)",
    content: "Adil's thumbnails increased my CTR by 200%! My channel growth exploded after working with him. The designs are simply outstanding.",
    rating: 5,
    avatar: "/api/placeholder/80/80"
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    role: "Tech Startup Founder",
    content: "The logo Adil designed became the face of our $10M startup. Professional, creative, and delivered exactly what we envisioned.",
    rating: 5,
    avatar: "/api/placeholder/80/80"
  },
  {
    id: 3,
    name: "Emma Chen",
    role: "Marketing Director",
    content: "Working with Adil was seamless. Fast delivery, unlimited revisions, and results that exceeded our expectations. Highly recommended!",
    rating: 5,
    avatar: "/api/placeholder/80/80"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            What Clients <span className="text-gradient-youtube">Say</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real feedback from real clients who saw real results.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="card-premium text-center">
              {/* Quote icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-youtube rounded-full mb-6">
                <Quote className="h-6 w-6 text-white" />
              </div>

              {/* Rating */}
              <div className="flex justify-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-youtube-red fill-current" />
                ))}
              </div>

              {/* Testimonial content */}
              <blockquote className="text-muted-foreground mb-6 italic">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center space-x-3">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-youtube-red fill-current" />
              <span className="font-medium">5.0 on Fiverr</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-youtube-red fill-current" />
              <span className="font-medium">Top Rated on Upwork</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-youtube-red fill-current" />
              <span className="font-medium">500+ Happy Clients</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}