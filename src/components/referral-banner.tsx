import { useState } from "react"
import { Users, Copy, Gift, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function ReferralBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const { toast } = useToast()
  const referralLink = "https://adilgfx.com/ref/WELCOME2024"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    })
  }

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-youtube text-white py-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">
                🎉 Refer Friends & Earn 100 Tokens Each!
              </h3>
              <p className="text-sm text-white/90">
                Share the love and get rewarded. Both you and your friend earn tokens!
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden md:block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-mono text-sm">
              {referralLink}
            </div>
            <Button 
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
              className="bg-white text-youtube-red hover:bg-white/90 font-semibold"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
