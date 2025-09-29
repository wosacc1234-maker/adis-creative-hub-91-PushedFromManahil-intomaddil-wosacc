import { useState, useEffect } from "react"
import { Calendar, Clock, Video, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CalendlyBookingProps {
  url?: string
  variant?: "inline" | "popup" | "button"
  buttonText?: string
}

export function CalendlyBooking({ 
  url = "https://calendly.com/adilgfx/consultation",
  variant = "inline",
  buttonText = "Book Free Consultation"
}: CalendlyBookingProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    script.onload = () => setIsLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const openCalendly = () => {
    if (window.Calendly && isLoaded) {
      window.Calendly.initPopupWidget({ url })
    } else {
      // Fallback to direct link if widget doesn't load
      window.open(url, '_blank')
    }
  }

  if (variant === "button") {
    return (
      <Button
        onClick={openCalendly}
        className="bg-gradient-youtube hover:shadow-glow font-semibold"
      >
        <Calendar className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    )
  }

  if (variant === "popup") {
    return (
      <>
        <Button
          onClick={() => setShowPopup(!showPopup)}
          className="bg-gradient-youtube hover:shadow-glow"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
        
        {showPopup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="p-6">
                <button
                  onClick={() => setShowPopup(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
                
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Book Your Free Consultation
                </h3>
                
                <div className="calendly-inline-widget" 
                  data-url={url}
                  style={{ minWidth: '320px', height: '630px' }}
                />
              </div>
            </Card>
          </div>
        )}
      </>
    )
  }

  // Default inline variant
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-subtle p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Schedule Your Free Consultation
            </h3>
            <p className="text-sm text-muted-foreground">
              Let's discuss your project and how I can help you achieve your goals
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-gradient-youtube rounded-full flex items-center justify-center">
              <Video className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-youtube-red" />
            <div>
              <p className="text-sm font-medium text-foreground">15-30 min</p>
              <p className="text-xs text-muted-foreground">Quick call</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Video className="h-5 w-5 text-youtube-red" />
            <div>
              <p className="text-sm font-medium text-foreground">Zoom/Google Meet</p>
              <p className="text-xs text-muted-foreground">Video optional</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-youtube-red" />
            <div>
              <p className="text-sm font-medium text-foreground">100% Free</p>
              <p className="text-xs text-muted-foreground">No obligation</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-foreground mb-3">What we'll discuss:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Your project goals and requirements
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Timeline and budget considerations
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Design strategy and best practices
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              How we can work together effectively
            </li>
          </ul>
        </div>

        <Button 
          onClick={openCalendly}
          className="w-full bg-gradient-youtube hover:shadow-glow font-semibold"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Book Your Free Consultation Now
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-3">
          📅 Available Monday-Friday, 9 AM - 6 PM EST
        </p>
      </div>
    </Card>
  )
}

// Add Calendly type to window
declare global {
  interface Window {
    Calendly: any
  }
}