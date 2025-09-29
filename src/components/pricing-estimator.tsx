import { useState } from "react"
import { Calculator, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

interface ServiceOption {
  name: string
  basePrice: number
  variations: {
    name: string
    multiplier: number
  }[]
}

const services: ServiceOption[] = [
  {
    name: "YouTube Thumbnails",
    basePrice: 49,
    variations: [
      { name: "Single Thumbnail", multiplier: 1 },
      { name: "5 Thumbnail Pack", multiplier: 4 },
      { name: "10 Thumbnail Pack", multiplier: 7.5 },
      { name: "Monthly Retainer (20 thumbnails)", multiplier: 15 }
    ]
  },
  {
    name: "Logo Design",
    basePrice: 149,
    variations: [
      { name: "Logo Only", multiplier: 1 },
      { name: "Logo + Business Card", multiplier: 1.5 },
      { name: "Complete Brand Identity", multiplier: 3 },
      { name: "Multiple Logo Concepts", multiplier: 2 }
    ]
  },
  {
    name: "Video Editing",
    basePrice: 299,
    variations: [
      { name: "Basic Editing (up to 5 min)", multiplier: 1 },
      { name: "Advanced Editing with Effects", multiplier: 1.5 },
      { name: "Full Production (10+ min)", multiplier: 2.5 },
      { name: "Monthly Package (4 videos)", multiplier: 3.5 }
    ]
  },
  {
    name: "Complete Branding",
    basePrice: 999,
    variations: [
      { name: "Basic Package", multiplier: 1 },
      { name: "Professional Package", multiplier: 1.5 },
      { name: "Premium Package", multiplier: 2.5 },
      { name: "Enterprise Package", multiplier: 4 }
    ]
  },
  {
    name: "YouTube Channel Setup",
    basePrice: 499,
    variations: [
      { name: "Basic Setup", multiplier: 1 },
      { name: "Setup + SEO Optimization", multiplier: 1.5 },
      { name: "Complete Channel Makeover", multiplier: 2 },
      { name: "Full Service + 10 Thumbnails", multiplier: 3 }
    ]
  }
]

export function PricingEstimator() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(0)
  const [selectedVariation, setSelectedVariation] = useState(0)
  const [rushDelivery, setRushDelivery] = useState(false)
  const [revisions, setRevisions] = useState([5])
  const [bulkDiscount, setBulkDiscount] = useState(0)

  const calculatePrice = () => {
    const service = services[selectedService]
    const variation = service.variations[selectedVariation]
    let price = service.basePrice * variation.multiplier
    
    // Rush delivery adds 50%
    if (rushDelivery) price *= 1.5
    
    // Extra revisions add cost
    if (revisions[0] > 5) {
      price += (revisions[0] - 5) * 10
    }
    
    // Apply bulk discount
    price *= (1 - bulkDiscount / 100)
    
    return Math.round(price)
  }

  const estimatedPrice = calculatePrice()

  return (
    <div className="w-full">
      <Card className="overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-youtube rounded-full flex items-center justify-center">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-foreground">
                Instant Price Estimator
              </h3>
              <p className="text-sm text-muted-foreground">
                Calculate your project cost in seconds
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {isOpen && (
          <div className="border-t border-border p-6 space-y-6">
            {/* Service Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Select Service
              </Label>
              <RadioGroup
                value={selectedService.toString()}
                onValueChange={(value) => {
                  setSelectedService(parseInt(value))
                  setSelectedVariation(0)
                }}
              >
                {services.map((service, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={index.toString()} id={`service-${index}`} />
                    <Label htmlFor={`service-${index}`} className="cursor-pointer">
                      {service.name} (from ${service.basePrice})
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Variation Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Package Type
              </Label>
              <RadioGroup
                value={selectedVariation.toString()}
                onValueChange={(value) => setSelectedVariation(parseInt(value))}
              >
                {services[selectedService].variations.map((variation, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={index.toString()} id={`variation-${index}`} />
                    <Label htmlFor={`variation-${index}`} className="cursor-pointer">
                      {variation.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Rush Delivery */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Rush Delivery</Label>
                <p className="text-sm text-muted-foreground">24-hour turnaround (+50%)</p>
              </div>
              <Button
                variant={rushDelivery ? "default" : "outline"}
                size="sm"
                onClick={() => setRushDelivery(!rushDelivery)}
                className={rushDelivery ? "bg-youtube-red hover:bg-youtube-red/90" : ""}
              >
                {rushDelivery ? "Yes" : "No"}
              </Button>
            </div>

            {/* Revisions */}
            <div>
              <div className="flex justify-between mb-3">
                <Label className="text-base font-semibold">Revisions</Label>
                <span className="text-sm text-muted-foreground">
                  {revisions[0]} revisions {revisions[0] > 5 && `(+$${(revisions[0] - 5) * 10})`}
                </span>
              </div>
              <Slider
                value={revisions}
                onValueChange={setRevisions}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Bulk Discount */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Bulk Order Discount
              </Label>
              <RadioGroup
                value={bulkDiscount.toString()}
                onValueChange={(value) => setBulkDiscount(parseInt(value))}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="0" id="discount-0" />
                  <Label htmlFor="discount-0" className="cursor-pointer">No bulk order</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="10" id="discount-10" />
                  <Label htmlFor="discount-10" className="cursor-pointer">3-5 projects (-10%)</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="15" id="discount-15" />
                  <Label htmlFor="discount-15" className="cursor-pointer">6-10 projects (-15%)</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="20" id="discount-20" />
                  <Label htmlFor="discount-20" className="cursor-pointer">10+ projects (-20%)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Estimated Price */}
            <div className="bg-gradient-subtle rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Estimated Project Cost</p>
              <div className="text-4xl font-bold text-youtube-red mb-4">
                ${estimatedPrice}
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                * Final price may vary based on specific requirements
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 bg-gradient-youtube hover:shadow-glow"
                  onClick={() => {
                    // This would trigger the contact form with pre-filled data
                    window.location.href = '/contact?estimate=' + estimatedPrice
                  }}
                >
                  Get Exact Quote
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white"
                  onClick={() => {
                    // This would open WhatsApp with the estimate
                    const message = `Hi Adil! I used your price estimator. My project (${services[selectedService].name} - ${services[selectedService].variations[selectedVariation].name}) estimate is $${estimatedPrice}. Can we discuss?`
                    window.open(`https://wa.me/+1234567890?text=${encodeURIComponent(message)}`, '_blank')
                  }}
                >
                  Discuss on WhatsApp
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}