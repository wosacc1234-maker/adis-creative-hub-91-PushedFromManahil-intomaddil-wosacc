import { useState } from "react"
import { Mail, Phone, MapPin, MessageCircle, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    budget: "",
    message: "",
    timeline: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <main className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Let's Create Something <span className="text-gradient-youtube">Amazing</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to transform your brand? Get in touch and let's discuss how we can bring your vision to life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              <div className="card-premium">
                <h3 className="text-xl font-semibold text-foreground mb-6">Get In Touch</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-youtube rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Email</div>
                      <div className="text-muted-foreground">hello@adilgfx.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-youtube rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">WhatsApp</div>
                      <div className="text-muted-foreground">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-youtube rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Response Time</div>
                      <div className="text-muted-foreground">Within 2 hours</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <Button 
                    className="w-full bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-medium"
                    onClick={() => window.open('https://wa.me/1234567890', '_blank')}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Quick WhatsApp Chat
                  </Button>
                </div>
              </div>

              <div className="card-premium">
                <h4 className="font-semibold text-foreground mb-4">What to Expect</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-youtube-red" />
                    <span className="text-sm text-muted-foreground">Response within 2 hours</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-youtube-red" />
                    <span className="text-sm text-muted-foreground">Free consultation call</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-youtube-red" />
                    <span className="text-sm text-muted-foreground">Custom project proposal</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-youtube-red" />
                    <span className="text-sm text-muted-foreground">Clear timeline & pricing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="card-premium">
              <h3 className="text-xl font-semibold text-foreground mb-6">Project Details</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Your Name *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-foreground mb-2">
                      Service Needed *
                    </label>
                    <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="logo">Logo Design</SelectItem>
                        <SelectItem value="thumbnails">YouTube Thumbnails</SelectItem>
                        <SelectItem value="video">Video Editing</SelectItem>
                        <SelectItem value="branding">Complete Branding</SelectItem>
                        <SelectItem value="other">Other/Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-foreground mb-2">
                      Budget Range
                    </label>
                    <Select value={formData.budget} onValueChange={(value) => setFormData({ ...formData, budget: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-500">Under $500</SelectItem>
                        <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                        <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                        <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                        <SelectItem value="over-5000">Over $5,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-foreground mb-2">
                    Timeline
                  </label>
                  <Select value={formData.timeline} onValueChange={(value) => setFormData({ ...formData, timeline: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="When do you need this completed?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">ASAP (Rush order)</SelectItem>
                      <SelectItem value="1-week">Within 1 week</SelectItem>
                      <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                      <SelectItem value="1-month">Within 1 month</SelectItem>
                      <SelectItem value="flexible">I'm flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Project Description *
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell me about your project, vision, target audience, and any specific requirements..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-semibold py-4"
                >
                  Send Project Details
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-subtle rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Prefer a Quick Call?
            </h2>
            <p className="text-muted-foreground mb-6">
              Book a free 15-minute consultation to discuss your project and get instant feedback.
            </p>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white font-semibold px-8 py-4 transition-smooth"
            >
              Schedule Free Call
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}