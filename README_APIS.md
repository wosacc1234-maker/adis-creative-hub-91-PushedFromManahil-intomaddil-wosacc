# API Integrations Documentation

## Overview

This document provides comprehensive documentation for all third-party API integrations in the Adil GFX platform. The system includes 13 pre-configured API integrations with toggle controls, rate limiting, usage tracking, and error logging.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Integration List](#api-integration-list)
3. [Setup Guide](#setup-guide)
4. [Usage Examples](#usage-examples)
5. [Rate Limits & Quotas](#rate-limits--quotas)
6. [Error Handling](#error-handling)
7. [Testing Guide](#testing-guide)

---

## Architecture Overview

### System Design

The API integration system follows a modular, database-driven architecture:

```
┌─────────────────────────────────────────────┐
│          Admin Panel Dashboard              │
│  - Enable/Disable Integrations             │
│  - Configure API Keys                      │
│  - Monitor Usage & Logs                    │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│     Supabase: api_integrations Table       │
│  Stores: keys, config, enabled status       │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│      Frontend API Integration Layer         │
│  - supabase-api.ts: callApiIntegration()   │
│  - Automatic logging & error tracking       │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Third-Party APIs                    │
│  Hunter.io, OpenAI, SendGrid, etc.         │
└─────────────────────────────────────────────┘
```

### Key Features

- **Toggle System**: Enable/disable any integration without code changes
- **Secure Storage**: API keys encrypted in Supabase database
- **Usage Tracking**: All requests logged with timestamps, status, and duration
- **Rate Limiting**: Configurable limits per integration
- **Error Logging**: Automatic capture of failed requests
- **Admin Dashboard**: Visual interface for managing all integrations

---

## API Integration List

### 1. Hunter.io - Email Discovery & Verification

**Purpose**: Find and verify email addresses for lead enrichment

**Free Tier**: 100 searches/month

**API Endpoint**: `https://api.hunter.io/v2`

**Use Cases**:
- Verify contact form email addresses
- Find company emails for outreach
- Enrich lead data with verified contacts

**Example Request**:
```typescript
const result = await callApiIntegration(
  'hunter_io',
  `/email-verifier?email=test@example.com`,
  'GET'
);
```

**Response**:
```json
{
  "data": {
    "status": "valid",
    "score": 98,
    "email": "test@example.com",
    "regexp": true,
    "smtp_server": true
  }
}
```

---

### 2. Clearbit - Company & Person Enrichment

**Purpose**: Enrich lead data with company information

**Free Tier**: 600 requests/month (trial)

**API Endpoint**: `https://company.clearbit.com/v2`

**Use Cases**:
- Get company size, industry, and revenue data
- Enrich contact submissions with company details
- Lead scoring based on company attributes

**Example Request**:
```typescript
const result = await callApiIntegration(
  'clearbit',
  `/companies/find?email=test@company.com`,
  'GET'
);
```

**Response**:
```json
{
  "name": "Company Inc",
  "domain": "company.com",
  "category": {
    "sector": "Information Technology",
    "industry": "Software"
  },
  "metrics": {
    "employees": 250,
    "annualRevenue": 25000000
  },
  "linkedin": {
    "handle": "company-inc"
  }
}
```

---

### 3. WhatsApp Business Cloud API

**Purpose**: Send WhatsApp messages for outreach and notifications

**Free Tier**: 1,000 conversations/month

**API Endpoint**: `https://graph.facebook.com/v18.0`

**Setup Requirements**:
1. Create Meta Business account
2. Set up WhatsApp Business API access
3. Get Phone Number ID and Access Token

**Use Cases**:
- Send order confirmations
- Lead nurturing messages
- Appointment reminders
- Support notifications

**Example Request**:
```typescript
const result = await sendWhatsAppMessage(
  '+1234567890',
  'Thank you for contacting Adil GFX! We received your inquiry and will respond within 2 hours.'
);
```

---

### 4. Telegram Bot API

**Purpose**: Send push notifications via Telegram

**Free Tier**: Completely free, 30 messages/sec rate limit

**API Endpoint**: `https://api.telegram.org/bot{token}`

**Setup**:
1. Create bot via @BotFather on Telegram
2. Get bot token
3. Get your chat ID

**Use Cases**:
- Admin notifications for new leads
- Order status updates
- System alerts

**Example Request**:
```typescript
const result = await sendTelegramMessage(
  'YOUR_CHAT_ID',
  '<b>New Contact Submission!</b>\nName: John Doe\nEmail: john@example.com'
);
```

---

### 5. SendGrid - Email Marketing

**Purpose**: Send transactional and marketing emails

**Free Tier**: 100 emails/day forever

**API Endpoint**: `https://api.sendgrid.com/v3`

**Use Cases**:
- Contact form auto-replies
- Newsletter campaigns
- Order confirmations
- Lead nurturing sequences

**Example Request**:
```typescript
const result = await sendEmailCampaign(
  'customer@example.com',
  'Thanks for Your Interest in Adil GFX!',
  '<h1>Hello!</h1><p>We received your message and will respond soon.</p>'
);
```

---

### 6. OpenAI - AI Chatbot & Content

**Purpose**: AI-powered chatbot and content generation

**Free Tier**: $5 credit on signup

**API Endpoint**: `https://api.openai.com/v1`

**Models**:
- GPT-4: Most capable, $0.03/1K tokens
- GPT-3.5-turbo: Fast & cheap, $0.002/1K tokens

**Use Cases**:
- Customer support chatbot
- Blog content assistance
- Service recommendations
- FAQ automation

**Example Request**:
```typescript
const response = await chatWithAI(
  'What services does Adil GFX offer?',
  []
);
```

---

### 7. Stripe - Payment Processing

**Purpose**: Accept credit card payments

**Free Tier**: No monthly fees, 2.9% + $0.30 per transaction

**API Endpoint**: `https://api.stripe.com/v1`

**Use Cases**:
- Service payments
- Subscription billing
- Invoice management

**Setup**:
1. Create Stripe account
2. Get publishable and secret keys
3. Set up webhooks for payment confirmations

---

### 8. Coinbase Commerce - Crypto Payments

**Purpose**: Accept cryptocurrency payments

**Free Tier**: 1% transaction fee

**API Endpoint**: `https://api.commerce.coinbase.com`

**Supported Cryptos**: Bitcoin, Ethereum, Litecoin, Bitcoin Cash, USDC

**Use Cases**:
- Alternative payment option
- Global customer reach
- Lower transaction fees

---

### 9. Google Search Console API

**Purpose**: Track SEO performance and rankings

**Free Tier**: Completely free, 1,200 requests/hour

**API Endpoint**: `https://www.googleapis.com/webmasters/v3`

**Use Cases**:
- Monitor keyword rankings
- Track impressions and CTR
- Identify SEO opportunities
- Performance dashboards

---

### 10. Google PageSpeed Insights API

**Purpose**: Monitor site performance and SEO scores

**Free Tier**: 25 requests/day

**API Endpoint**: `https://www.googleapis.com/pagespeedonline/v5`

**Use Cases**:
- Automated performance monitoring
- SEO audits
- Competitor analysis
- Performance dashboards

---

### 11. LinkedIn API

**Purpose**: Auto-share blogs and portfolio updates

**Free Tier**: Limited to personal profile posts

**API Endpoint**: `https://api.linkedin.com/v2`

**Use Cases**:
- Auto-publish new blog posts
- Share portfolio projects
- Increase content reach

---

### 12. Twitter/X API

**Purpose**: Post updates and announcements

**Free Tier**: Free tier available with limitations

**API Endpoint**: `https://api.twitter.com/2`

**Use Cases**:
- Auto-tweet new blog posts
- Share client testimonials
- Announce new services

---

### 13. Instagram Basic Display API

**Purpose**: Display portfolio on Instagram feed

**Free Tier**: Completely free

**API Endpoint**: `https://graph.instagram.com`

**Use Cases**:
- Sync portfolio to Instagram
- Display Instagram feed on website
- Social proof automation

---

## Setup Guide

### Step 1: Obtain API Keys

For each service you want to use:

1. **Hunter.io**:
   - Go to https://hunter.io/api
   - Sign up for free account
   - Copy API key from dashboard

2. **Clearbit**:
   - Visit https://clearbit.com
   - Sign up for trial
   - Get API key from settings

3. **WhatsApp Business**:
   - Create Meta Business account
   - Apply for WhatsApp Business API access
   - Get Phone Number ID and Access Token

4. **Telegram**:
   - Message @BotFather on Telegram
   - Send `/newbot` and follow instructions
   - Copy bot token
   - Get your chat ID by messaging your bot and visiting:
     `https://api.telegram.org/bot{TOKEN}/getUpdates`

5. **SendGrid**:
   - Sign up at https://sendgrid.com
   - Create API key in Settings > API Keys
   - Verify sender email

6. **OpenAI**:
   - Sign up at https://platform.openai.com
   - Add payment method ($5 minimum)
   - Create API key in API Keys section

7. **Stripe**:
   - Create account at https://stripe.com
   - Get test keys from Developers > API Keys
   - Switch to live keys for production

... (Continue for all services)

### Step 2: Configure in Admin Panel

1. Log into admin panel
2. Navigate to **Settings** > **API Integrations**
3. For each integration:
   - Click **Configure**
   - Enter API Key
   - Enter API Secret (if required)
   - Set Webhook URL (if required)
   - Click **Save**
   - Toggle **Enable** switch

### Step 3: Test Integration

1. Go to **API Integrations** dashboard
2. Select an integration
3. Click **Test Connection**
4. Verify success message
5. Check **API Usage Logs** for logged request

---

## Usage Examples

### Lead Enrichment Workflow

```typescript
// 1. Capture contact form submission
const submission = await submitContactForm({
  name: 'John Doe',
  email: 'john@company.com',
  service: 'Logo Design',
  message: 'I need a professional logo'
});

// 2. Automatically enrich the lead
const enrichedData = await enrichLead('john@company.com');

// 3. Create lead record with enrichment
await supabase.from('leads').insert({
  email: 'john@company.com',
  name: 'John Doe',
  company: enrichedData.company,
  company_size: enrichedData.company_size,
  industry: enrichedData.industry,
  enrichment_data: enrichedData,
  lead_score: calculateLeadScore(enrichedData),
  status: 'new'
});

// 4. Send automated WhatsApp welcome message
await sendWhatsAppMessage(
  '+1234567890',
  'Hi John! Thanks for your interest in our Logo Design service. Our team will review your inquiry and respond within 2 hours.'
);

// 5. Notify admin via Telegram
await sendTelegramMessage(
  process.env.ADMIN_TELEGRAM_ID,
  `<b>New Qualified Lead!</b>\nCompany: ${enrichedData.company}\nIndustry: ${enrichedData.industry}\nService: Logo Design`
);
```

### AI Chatbot Example

```typescript
// Initialize conversation
const conversationHistory = [];

// User asks question
const userMessage = 'What is the turnaround time for logo design?';

// Get AI response
const aiResponse = await chatWithAI(userMessage, conversationHistory);

// Update conversation history
conversationHistory.push(
  { role: 'user', content: userMessage },
  { role: 'assistant', content: aiResponse }
);

// Display to user
console.log('AI:', aiResponse);
// Output: "Our logo design turnaround time varies by package: Basic (3-5 days), Standard (5-7 days), and Premium (7-10 days)..."
```

### Automated Social Posting

```typescript
// When new blog post is published
const blog = await supabase
  .from('blogs')
  .insert({
    title: '10 Logo Design Trends for 2024',
    slug: '10-logo-design-trends-2024',
    content: '...',
    status: 'published'
  })
  .select()
  .single();

// Auto-post to LinkedIn
await callApiIntegration(
  'linkedin',
  '/posts',
  'POST',
  {
    author: 'urn:li:person:YOUR_ID',
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: '🎨 New Blog Post: 10 Logo Design Trends for 2024\n\nDiscover the latest trends shaping logo design...'
        },
        shareMediaCategory: 'ARTICLE',
        media: [{
          status: 'READY',
          originalUrl: `https://adilgfx.com/blog/${blog.slug}`
        }]
      }
    }
  }
);

// Auto-tweet
await callApiIntegration(
  'twitter',
  '/tweets',
  'POST',
  {
    text: '🎨 New blog post: 10 Logo Design Trends for 2024\n\nRead more: https://adilgfx.com/blog/10-logo-design-trends-2024'
  }
);
```

---

## Rate Limits & Quotas

| Integration | Free Tier Limit | Rate Limit | Reset Period |
|------------|-----------------|------------|--------------|
| Hunter.io | 100/month | 10/min | Monthly |
| Clearbit | 600/month | 600/hour | Monthly |
| WhatsApp Business | 1000 conversations/month | 80/sec | Monthly |
| Telegram Bot | Unlimited | 30/sec | Per second |
| SendGrid | 100/day | No limit | Daily |
| OpenAI | $5 credit | 60/min | Per minute |
| Stripe | Unlimited | 100/sec | No limit |
| Coinbase Commerce | Unlimited | 10/sec | No limit |
| Google Search Console | 1200/hour | 1200/hour | Hourly |
| PageSpeed Insights | 25/day | 25/day | Daily |
| LinkedIn | Limited | Varies | Per app |
| Twitter | Varies | 50/15min | 15 minutes |
| Instagram | Unlimited | 200/hour | Hourly |

**Note**: These limits are for free tiers. Paid plans offer significantly higher limits.

---

## Error Handling

### Common Error Codes

```typescript
// 401 Unauthorized - Invalid API key
{
  "error": "Invalid API key",
  "code": 401
}

// 429 Too Many Requests - Rate limit exceeded
{
  "error": "Rate limit exceeded",
  "code": 429,
  "retry_after": 60 // seconds
}

// 404 Not Found - Resource doesn't exist
{
  "error": "Email not found",
  "code": 404
}

// 500 Internal Server Error - API issue
{
  "error": "Internal server error",
  "code": 500
}
```

### Error Handling Best Practices

```typescript
try {
  const result = await callApiIntegration(
    'hunter_io',
    `/email-verifier?email=${email}`,
    'GET'
  );

  return result;
} catch (error) {
  // Log error to Supabase
  await supabase.from('api_usage_logs').insert({
    integration_name: 'hunter_io',
    endpoint: '/email-verifier',
    method: 'GET',
    status_code: error.status || 500,
    error_message: error.message,
    request_data: { email }
  });

  // Return graceful fallback
  return {
    verified: false,
    reason: 'Verification service unavailable'
  };
}
```

---

## Testing Guide

### Testing Individual Integrations

```typescript
// Test Hunter.io
const testEmail = 'test@hunter.io';
const result = await callApiIntegration(
  'hunter_io',
  `/email-verifier?email=${testEmail}`,
  'GET'
);
console.log('Hunter.io Test:', result);

// Test OpenAI
const aiResponse = await chatWithAI(
  'What is 2+2?',
  []
);
console.log('OpenAI Test:', aiResponse);

// Test SendGrid
const emailResult = await sendEmailCampaign(
  'your-email@example.com',
  'Test Email',
  '<h1>Test successful!</h1>'
);
console.log('SendGrid Test:', emailResult);
```

### Monitoring API Usage

```sql
-- View recent API calls
SELECT
  integration_name,
  endpoint,
  status_code,
  duration_ms,
  created_at
FROM api_usage_logs
ORDER BY created_at DESC
LIMIT 50;

-- Check error rate by integration
SELECT
  integration_name,
  COUNT(*) as total_calls,
  COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors,
  ROUND(COUNT(CASE WHEN status_code >= 400 THEN 1 END) * 100.0 / COUNT(*), 2) as error_rate
FROM api_usage_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY integration_name;

-- Average response time
SELECT
  integration_name,
  AVG(duration_ms) as avg_duration_ms,
  MIN(duration_ms) as min_duration_ms,
  MAX(duration_ms) as max_duration_ms
FROM api_usage_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY integration_name
ORDER BY avg_duration_ms DESC;
```

---

## Security Best Practices

1. **Never commit API keys to Git**
   - All keys stored in Supabase database
   - Environment variables for local development only

2. **Use least privilege access**
   - Grant only necessary permissions for each API key
   - Use read-only keys where possible

3. **Rotate keys regularly**
   - Change API keys every 90 days
   - Immediate rotation if key is compromised

4. **Monitor unusual activity**
   - Set up alerts for spike in API usage
   - Review error logs daily

5. **Implement rate limiting**
   - Respect API rate limits
   - Add your own rate limiting layer

---

## Support & Resources

### Official Documentation

- **Hunter.io**: https://hunter.io/api-documentation
- **Clearbit**: https://clearbit.com/docs
- **WhatsApp**: https://developers.facebook.com/docs/whatsapp
- **Telegram**: https://core.telegram.org/bots/api
- **SendGrid**: https://docs.sendgrid.com/
- **OpenAI**: https://platform.openai.com/docs
- **Stripe**: https://stripe.com/docs/api
- **Coinbase**: https://commerce.coinbase.com/docs/
- **Google APIs**: https://developers.google.com/
- **LinkedIn**: https://docs.microsoft.com/en-us/linkedin/
- **Twitter**: https://developer.twitter.com/en/docs
- **Instagram**: https://developers.facebook.com/docs/instagram-basic-display-api

### Troubleshooting

**Problem**: API integration not working after configuration

**Solution**:
1. Check API key is entered correctly (no spaces)
2. Verify integration is enabled (toggle switch)
3. Check API usage logs for error messages
4. Test with a simple request
5. Verify API account has sufficient quota

**Problem**: Rate limit errors

**Solution**:
1. Check current usage in API dashboard
2. Upgrade to paid plan if needed
3. Implement request queuing
4. Cache API responses when possible

---

## Next Steps

1. Configure your priority integrations (Hunter.io, OpenAI, SendGrid, WhatsApp)
2. Test each integration with sample data
3. Set up monitoring and alerts
4. Implement automated workflows
5. Review usage and costs monthly

For questions or issues, contact: dev@adilgfx.com
