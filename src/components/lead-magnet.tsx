import { useState } from "react"
import { Download, Gift, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface LeadMagnetProps {
  title: string
  description: string
  buttonText?: string
  variant?: "banner" | "popup" | "inline"
}

export function LeadMagnet({ 
  title = "5 Free YouTube Thumbnail Templates",
  description = "Get instant access to pro-level templates that convert viewers into subscribers",
  buttonText = "Get Free Templates",
  variant = "inline" 
}: LeadMagnetProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !name) {
      toast({
        title: "Required fields",
        description: "Please enter your name and email",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true)
      setIsLoading(false)
      
      toast({
        title: "Success! 🎉",
        description: "Check your email for the download link",
      })
      
      // In production, this would trigger actual download or email
      console.log("Lead captured:", { name, email })
      
      // Reset after delay
      setTimeout(() => {
        setIsSubmitted(false)
        setEmail("")
        setName("")
      }, 5000)
    }, 1500)
  }

  if (variant === "banner") {
    return (
      <div className="bg-gradient-youtube text-white rounded-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center space-x-2 mb-3">
                <Gift className="h-6 w-6" />
                <span className="font-semibold text-sm uppercase tracking-wider">Free Download</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
              <p className="text-white/90">{description}</p>
            </div>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-youtube-red hover:bg-white/90 font-semibold"
                >
                  {isLoading ? "Processing..." : buttonText}
                </Button>
              </form>
            ) : (
              <div className="flex items-center space-x-3 bg-white/20 rounded-lg px-6 py-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span className="font-semibold">Check your email!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === "popup") {
    return (
      <div className="fixed bottom-24 left-6 z-40 max-w-sm animate-fade-in">
        <Card className="p-6 shadow-glow border-youtube-red/20">
          <button 
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            onClick={() => {/* Handle close */}}
          >
            ×
          </button>
          
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 bg-gradient-youtube rounded-full flex items-center justify-center">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-sm text-youtube-red">LIMITED TIME</span>
          </div>
          
          <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-sm"
                required
              />
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm"
                required
              />
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-youtube hover:shadow-glow"
              >
                <Download className="h-4 w-4 mr-2" />
                {isLoading ? "Processing..." : buttonText}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Success!</p>
              <p className="text-xs text-muted-foreground">Check your email</p>
            </div>
          )}
        </Card>
      </div>
    )
  }

  // Default inline variant
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-subtle p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-youtube rounded-full flex items-center justify-center flex-shrink-0">
            <Gift className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-youtube hover:shadow-glow"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isLoading ? "Processing..." : buttonText}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  🔒 Your email is safe. No spam, unsubscribe anytime.
                </p>
              </form>
            ) : (
              <div className="bg-green-500/10 rounded-lg p-4 flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-semibold text-foreground">Success! Templates sent!</p>
                  <p className="text-sm text-muted-foreground">Check your email for the download link</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export function MediaKitDownload() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email to download the media kit",
        variant: "destructive"
      })
      return
    }

    setIsSubmitted(true)
    
    toast({
      title: "Media Kit Sent! 📧",
      description: "Check your email for the download link",
    })
    
    // In production, this would trigger actual download
    console.log("Media kit requested by:", email)
    
    setTimeout(() => {
      setIsSubmitted(false)
      setEmail("")
    }, 5000)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Mail className="h-6 w-6 text-youtube-red" />
        <h3 className="text-lg font-semibold text-foreground">Download Media Kit</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Get our complete media kit with portfolio samples, pricing guide, and case studies
      </p>
      
      {!isSubmitted ? (
        <form onSubmit={handleDownload} className="flex gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" className="bg-gradient-youtube hover:shadow-glow">
            Download PDF
          </Button>
        </form>
      ) : (
        <div className="bg-green-500/10 rounded-lg p-3 text-center">
          <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
          <p className="text-sm font-semibold text-foreground">Sent to your email!</p>
        </div>
      )}
    </Card>
  )
}