import { MessageCircle, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false)
  
  const whatsappNumber = "+1234567890" // Replace with actual WhatsApp number
  const defaultMessage = "Hi Adil! I'm interested in your design services. Can we discuss my project?"

  const openWhatsApp = () => {
    const url = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(defaultMessage)}`
    window.open(url, '_blank')
  }

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`transition-all duration-300 ${isOpen ? 'mb-4' : ''}`}>
          {isOpen && (
            <div className="bg-card border border-border rounded-xl p-4 shadow-premium max-w-sm mb-4 animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-youtube rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">Adil GFX</div>
                    <div className="text-xs text-success">● Online</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-muted rounded-lg p-3 mb-3">
                <p className="text-sm text-foreground">
                  👋 Hi there! Ready to transform your brand with premium designs?
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click below to start chatting on WhatsApp!
                </p>
              </div>
              
              <Button
                onClick={openWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20BC5A] text-white font-medium text-sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat on WhatsApp
              </Button>
            </div>
          )}
        </div>
        
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BC5A] text-white shadow-glow transition-all duration-300 hover:scale-110"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>
    </>
  )
}