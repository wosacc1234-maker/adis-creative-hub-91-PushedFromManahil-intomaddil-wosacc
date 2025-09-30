import { useState, useEffect } from "react"
import { Palette, Play, Zap, CheckCircle, Settings, Brush, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { fetchServices } from "@/utils/api"
import { Service } from "@/types"
import { ServiceCardSkeleton } from "@/components/skeleton-loader"

const iconMap: Record<string, LucideIcon> = {
  Palette,
  Play,
  Zap,
  Settings,
  Brush,
}

export function ServicesOverview() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true)
        const data = await fetchServices()
        setServices(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load services")
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  if (error) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-destructive">{error}</div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Services That <span className="text-gradient-youtube">Drive Results</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional design services tailored to grow your business and increase conversions.
          </p>
        </div>

        {/* Services Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 pt-6">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <CarouselItem key={idx} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <ServiceCardSkeleton />
                  </CarouselItem>
                ))
              ) : (
                services.map((service) => {
                  const Icon = iconMap[service.icon] || Palette
                  return (
                    <CarouselItem key={service.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <div className={`relative card-premium h-full ${service.popular ? 'ring-2 ring-youtube-red' : ''}`}>
                        {service.popular && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-gradient-youtube text-white px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                              Most Popular
                            </span>
                          </div>
                        )}

                      <div className="text-center h-full flex flex-col">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-youtube rounded-xl mb-6 mx-auto">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        
                        <h3 className="text-xl font-semibold text-foreground mb-3">{service.name}</h3>
                        <p className="text-muted-foreground mb-6 flex-grow">{service.tagline}</p>
                        
                        <div className="space-y-3 mb-8">
                          {service.features?.map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-youtube-red flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-2xl font-bold text-foreground mb-6">
                          From ${Math.min(...service.pricingTiers.map(t => t.price))}
                        </div>
                        
                        <Button 
                          className={`w-full font-medium ${
                            service.popular 
                              ? 'bg-gradient-youtube hover:shadow-glow' 
                              : 'variant-outline border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white'
                          } transition-all duration-300`}
                        >
                          Get Started
                        </Button>
                      </div>
                    </div>
                  </CarouselItem>
                  )
                })
              )}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white" />
            <CarouselNext className="hidden md:flex -right-12 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white" />
          </Carousel>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-gradient-subtle rounded-2xl">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Need a Custom Package?
          </h3>
          <p className="text-muted-foreground mb-6">
            Let's discuss your project and create a tailored solution that fits your needs and budget.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-semibold px-8 py-4"
          >
            Schedule Free Consultation
          </Button>
        </div>
      </div>
    </section>
  )
}