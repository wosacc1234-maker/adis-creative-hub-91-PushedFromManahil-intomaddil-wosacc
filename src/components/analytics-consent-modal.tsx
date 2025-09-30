/**
 * Analytics Consent Modal Component
 * GDPR-compliant analytics opt-in modal
 */

import { useState, useEffect } from 'react';
import { X, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { enableAnalytics, disableAnalytics, hasAnalyticsConsent } from '@/utils/analytics';

const CONSENT_SHOWN_KEY = 'analytics_consent_shown';

export function AnalyticsConsentModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkConsentStatus();
  }, []);

  const checkConsentStatus = () => {
    const hasConsent = hasAnalyticsConsent();
    const hasBeenShown = localStorage.getItem(CONSENT_SHOWN_KEY);
    
    // Show modal if consent hasn't been given and modal hasn't been shown
    if (!hasConsent && !hasBeenShown) {
      // Delay showing modal by 2 seconds for better UX
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }
  };

  const handleAccept = () => {
    enableAnalytics();
    localStorage.setItem(CONSENT_SHOWN_KEY, 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    disableAnalytics();
    localStorage.setItem(CONSENT_SHOWN_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-premium p-6">
        <button
          onClick={handleDecline}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start space-x-4 mb-4">
          <div className="w-10 h-10 bg-youtube-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart3 className="h-5 w-5 text-youtube-red" />
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Help Us Improve
            </h3>
            <p className="text-sm text-muted-foreground">
              We use analytics to understand how visitors interact with our site and improve your experience. 
              Your privacy is important to us.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4 text-xs text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Your data is never sold. Opt out anytime in settings.</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleAccept}
            className="flex-1 bg-gradient-youtube hover:shadow-glow transition-all duration-300"
            size="sm"
          >
            Accept & Continue
          </Button>
          <Button
            onClick={handleDecline}
            variant="outline"
            className="flex-1 border-border hover:bg-muted"
            size="sm"
          >
            Decline
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          By accepting, you agree to our use of analytics cookies.
        </p>
      </div>
    </div>
  );
}
