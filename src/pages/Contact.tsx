/**
 * Contact Page with Form Validation
 * Real-time validation, submission states, and success/error handling
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, MessageCircle, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitContactForm } from "@/utils/api";
import { SEOHead } from "@/components/seo-head";
import { useAnalytics } from "@/utils/analytics";
import type { ContactFormData, SubmissionState } from "@/types";

export default function Contact() {
  const [searchParams] = useSearchParams();
  const analytics = useAnalytics();
  
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    service: searchParams.get('service') || "",
    budget: "",
    message: "",
    timeline: "",
    phone: ""
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormData, boolean>>>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    // Pre-fill with query params if available
    const service = searchParams.get('service');
    const estimatedPrice = searchParams.get('estimated_price');
    
    if (service) {
      setFormData(prev => ({ ...prev, service }));
    }
    if (estimatedPrice) {
      setFormData(prev => ({ 
        ...prev, 
        message: prev.message + `\n\nEstimated budget from calculator: $${estimatedPrice}`
      }));
    }
  }, [searchParams]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const validateField = (field: keyof ContactFormData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name must be less than 100 characters';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        if (value.length > 255) return 'Email must be less than 255 characters';
        break;
      case 'service':
        if (!value) return 'Please select a service';
        break;
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.length < 10) return 'Message must be at least 10 characters';
        if (value.length > 1000) return 'Message must be less than 1000 characters';
        break;
      case 'phone':
        if (value && !validatePhone(value)) return 'Please enter a valid phone number';
        break;
    }
    return undefined;
  };

  const handleBlur = (field: keyof ContactFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for touched fields
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
    
    (Object.keys(formData) as Array<keyof ContactFormData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      service: true,
      message: true,
      phone: true,
      budget: true,
      timeline: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Track submission attempt
    analytics.track(analytics.events.CONTACT_SUBMIT, {
      service: formData.service,
      has_budget: !!formData.budget,
      has_timeline: !!formData.timeline,
    });

    if (!validateForm()) {
      setSubmitMessage("Please fix the errors before submitting.");
      return;
    }

    setSubmissionState('submitting');
    setSubmitMessage("");

    try {
      const response = await submitContactForm(formData);
      
      if (response.success) {
        setSubmissionState('success');
        setSubmitMessage(response.message);
        
        // Track successful submission
        analytics.track(analytics.events.CONTACT_SUBMIT_SUCCESS, {
          service: formData.service,
        });
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          service: "",
          budget: "",
          message: "",
          timeline: "",
          phone: ""
        });
        setTouched({});
        setErrors({});
      } else {
        setSubmissionState('error');
        setSubmitMessage(response.message);
      }
    } catch (error) {
      setSubmissionState('error');
      setSubmitMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleRetry = () => {
    setSubmissionState('idle');
    setSubmitMessage("");
  };

  return (
    <>
      <SEOHead
        title="Contact Us - Let's Create Something Amazing | Adil GFX"
        description="Get in touch for professional design services. Fast response time, free consultation, and transparent pricing for logos, thumbnails, and video editing."
        keywords="contact design services, hire designer, logo design quote, YouTube thumbnail service"
      />

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
                
                {submissionState === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <h4 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h4>
                    <p className="text-muted-foreground mb-6">{submitMessage}</p>
                    <Button 
                      onClick={handleRetry}
                      variant="outline"
                      className="border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                          Your Name *
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          onBlur={() => handleBlur('name')}
                          aria-required="true"
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "name-error" : undefined}
                          className={errors.name && touched.name ? 'border-destructive' : ''}
                        />
                        {errors.name && touched.name && (
                          <p id="name-error" className="text-sm text-destructive mt-1">{errors.name}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          onBlur={() => handleBlur('email')}
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "email-error" : undefined}
                          className={errors.email && touched.email ? 'border-destructive' : ''}
                        />
                        {errors.email && touched.email && (
                          <p id="email-error" className="text-sm text-destructive mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="service" className="block text-sm font-medium text-foreground mb-2">
                          Service Needed *
                        </Label>
                        <Select 
                          value={formData.service} 
                          onValueChange={(value) => handleChange('service', value)}
                        >
                          <SelectTrigger 
                            id="service"
                            aria-required="true"
                            aria-invalid={!!errors.service}
                            className={errors.service && touched.service ? 'border-destructive' : ''}
                          >
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
                        {errors.service && touched.service && (
                          <p className="text-sm text-destructive mt-1">{errors.service}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="budget" className="block text-sm font-medium text-foreground mb-2">
                          Budget Range
                        </Label>
                        <Select 
                          value={formData.budget} 
                          onValueChange={(value) => handleChange('budget', value)}
                        >
                          <SelectTrigger id="budget">
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
                      <Label htmlFor="timeline" className="block text-sm font-medium text-foreground mb-2">
                        Timeline
                      </Label>
                      <Select 
                        value={formData.timeline} 
                        onValueChange={(value) => handleChange('timeline', value)}
                      >
                        <SelectTrigger id="timeline">
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
                      <Label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                        Phone Number (Optional)
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        onBlur={() => handleBlur('phone')}
                        aria-invalid={!!errors.phone}
                        className={errors.phone && touched.phone ? 'border-destructive' : ''}
                      />
                      {errors.phone && touched.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Project Description *
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell me about your project, vision, target audience, and any specific requirements..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        onBlur={() => handleBlur('message')}
                        aria-required="true"
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "message-error" : undefined}
                        className={errors.message && touched.message ? 'border-destructive' : ''}
                      />
                      <div className="flex justify-between mt-1">
                        <div>
                          {errors.message && touched.message && (
                            <p id="message-error" className="text-sm text-destructive">{errors.message}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formData.message.length}/1000
                        </span>
                      </div>
                    </div>

                    {submitMessage && submissionState === 'error' && (
                      <div className="flex items-start space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-destructive font-medium">Error submitting form</p>
                          <p className="text-sm text-destructive/80 mt-1">{submitMessage}</p>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={submissionState === 'submitting'}
                      className="w-full bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-semibold py-4"
                    >
                      {submissionState === 'submitting' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Project Details'
                      )}
                    </Button>
                  </form>
                )}
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
    </>
  );
}
