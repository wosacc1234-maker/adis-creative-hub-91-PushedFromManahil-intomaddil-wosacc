import { useState, useEffect } from "react"
import { X, Gift, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface PopupOfferProps {
  variant?: 'first-time' | 'returning'
}

export function PopupOffer({ variant = 'first-time' }: PopupOfferProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Check if user has seen the popup before
    const hasSeenPopup = localStorage.getItem('hasSeenPopup')
    const lastVisit = localStorage.getItem('lastVisit')
    const now = Date.now()

    if (variant === 'first-time' && !hasSeenPopup) {
      // Show popup after 5 seconds for first-time visitors
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem('hasSeenPopup', 'true')
      }, 5000)
      return () => clearTimeout(timer)
    }

    if (variant === 'returning' && lastVisit) {
      const daysSinceLastVisit = (now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24)
      // Show popup for returning visitors after 7 days
      if (daysSinceLastVisit >= 7) {
        const timer = setTimeout(() => {
          setIsOpen(true)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }

    // Update last visit timestamp
    localStorage.setItem('lastVisit', now.toString())
  }, [variant])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      toast({
        title: "Success!",
        description: "Your discount code has been sent to your email",
      })
      setIsOpen(false)
    }
  }

  const content = variant === 'first-time' ? {
    icon: Gift,
    badge: "Welcome Offer",
    title: "Get 20% Off Your First Order!",
    description: "Join thousands of satisfied clients and start your design journey with us. Enter your email to claim your exclusive welcome discount.",
    discount: "20% OFF",
    buttonText: "Claim My Discount",
    ctaText: "Limited time offer for new customers"
  } : {
    icon: Sparkles,
    badge: "Welcome Back",
    title: "We Missed You! Here's 15% Off",
    description: "It's been a while! Come back and save on your next project. We've got new services and even faster delivery times.",
    discount: "15% OFF",
    buttonText: "Get My Code",
    ctaText: "Valid for the next 48 hours"
  }

  const Icon = content.icon

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        {/* Gradient header */}
        <div className="bg-gradient-youtube text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <Icon className="h-32 w-32 transform rotate-12" />
          </div>
          <div className="relative">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-3">
              {content.badge}
            </div>
            <h2 className="text-2xl font-bold mb-2">{content.title}</h2>
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <span className="text-3xl font-bold">{content.discount}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-muted-foreground mb-6">
            {content.description}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
            <Button 
              type="submit" 
              className="w-full bg-gradient-youtube hover:shadow-glow transition-all font-semibold"
            >
              {content.buttonText}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-4">
            {content.ctaText}
          </p>

          {/* Features */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-youtube-red mb-1">500+</div>
              <div className="text-xs text-muted-foreground">Happy Clients</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-youtube-red mb-1">24-48h</div>
              <div className="text-xs text-muted-foreground">Fast Delivery</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-youtube-red mb-1">5.0</div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
