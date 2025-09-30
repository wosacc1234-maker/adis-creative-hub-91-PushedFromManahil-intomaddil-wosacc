# Adil GFX - Production-Ready Design Services Platform

A modern, conversion-focused React + TypeScript web application for professional design services. Built with pagination, form validation, analytics, SEO optimization, and personalization features.

---

## Project Info

**URL**: https://lovable.dev/projects/bb856f5c-3dfe-464a-a465-9444f237ec06

---

## 🚀 Features Implemented

### 1. **Pagination & Filtering**
- ✅ Blog pagination with query params (`/blog?page=1`)
- ✅ Portfolio pagination with category filtering (`/portfolio?page=1&category=Logos`)
- ✅ 10 items per page with crawlable pagination links
- ✅ Loading states with skeleton loaders during transitions
- ✅ Centralized data fetching ready for server-side pagination

### 2. **Contact Form Validation**
- ✅ Real-time client-side validation with inline errors
- ✅ Email & phone regex validation
- ✅ Min/max length constraints (name: 2-100, message: 10-1000 chars)
- ✅ Submission states: idle → submitting → success/error
- ✅ Friendly confirmation on success + retry option on error
- ✅ CSRF-ready with placeholder header
- ✅ ARIA attributes for accessibility

### 3. **Service Pricing Calculator**
- ✅ Interactive calculator with real-time price updates
- ✅ Inputs: service type, quantity, complexity slider, turnaround
- ✅ Price breakdown with add-ons and rush fees
- ✅ Analytics tracking on calculator usage
- ✅ Redirect to contact form with pre-filled data

### 4. **Loading & Error Handling**
- ✅ Skeleton loaders for Blog, Portfolio, Services, Testimonials
- ✅ React Error Boundary with friendly fallback UI
- ✅ Retry button with exponential backoff capability
- ✅ Network error handling with user-friendly messages

### 5. **SEO & Structured Data**
- ✅ Per-page meta tags (title, description, canonical)
- ✅ OpenGraph & Twitter Card tags
- ✅ JSON-LD structured data:
  - Blog posts → Article schema
  - Services → Service schema  
  - Testimonials → Review schema
  - Portfolio → CreativeWork schema
- ✅ Centralized in `/src/utils/seo.ts`

### 6. **Personalization Features**
- ✅ Returning visitor detection via `localStorage`
- ✅ Welcome-back banner with exclusive 15% discount
- ✅ Last visit timestamp tracking
- ✅ Non-intrusive UI (dismissable, session-based)

### 7. **Analytics Integration**
- ✅ GDPR-compliant opt-in/opt-out system
- ✅ Reusable `useAnalytics()` hook
- ✅ Standard event names: `page_view`, `contact_submit`, `calculator_use`, etc.
- ✅ Ready for GA4 and Facebook Pixel integration
- ✅ Consent modal with privacy-first defaults
- ✅ Gated tracking (disabled by default until opt-in)

### 8. **Responsive Design**
- ✅ Mobile-first design (320px - 768px)
- ✅ Tablet optimization (768px - 1024px)
- ✅ Desktop layouts (1024px+)
- ✅ Touch-friendly targets (≥44px) on mobile
- ✅ Verified across all breakpoints

---

## 📁 Project Structure

\`\`\`
src/
├── components/
│   ├── ui/                          # shadcn UI components
│   ├── analytics-consent-modal.tsx  # GDPR analytics consent
│   ├── error-boundary.tsx           # Error handling component
│   ├── pricing-calculator.tsx       # Interactive pricing tool
│   ├── returning-visitor-banner.tsx # Personalization banner
│   ├── seo-head.tsx                 # SEO meta tags component
│   ├── skeleton-loader.tsx          # Loading state components
│   └── ...other components
├── pages/
│   ├── Blog.tsx                     # Blog list with pagination
│   ├── BlogDetail.tsx               # Individual blog post
│   ├── Contact.tsx                  # Contact form with validation
│   ├── Portfolio.tsx                # Portfolio with pagination
│   ├── Services.tsx                 # Services with calculator
│   └── ...other pages
├── data/                            # Mock JSON data files
│   ├── blogs.json                   # 10 blog posts
│   ├── testimonials.json            # 10 testimonials
│   ├── portfolio.json               # 9 portfolio items
│   ├── services.json                # 4 services with tiers
│   ├── notifications.json           # 5 notifications
│   └── userData.json                # User dashboard data
├── types/
│   └── index.ts                     # TypeScript type definitions
├── utils/
│   ├── api.ts                       # Centralized API calls
│   ├── analytics.ts                 # Analytics utilities
│   └── seo.ts                       # SEO helpers
└── ...
\`\`\`

---

## 🗂️ Data Architecture

All content is loaded dynamically from `/src/data/*.json` files. **No hardcoded content in components.**

### Mock Data Files

| File | Description | Schema |
|------|-------------|--------|
| **blogs.json** | Blog posts | \`{ id, title, slug, excerpt, content, category, author, date, readTime, featuredImage, tags, featured, views, likes }\` |
| **portfolio.json** | Portfolio items | \`{ id, title, slug, category, description, client, featuredImage, images, beforeImage, afterImage, tags, results, featured, views }\` |
| **testimonials.json** | Client testimonials | \`{ id, name, role, company, content, rating, avatar, date, projectType, verified }\` |
| **services.json** | Service offerings | \`{ id, name, slug, icon, tagline, description, features, pricingTiers, deliveryTime, popular }\` |
| **notifications.json** | User notifications | \`{ id, type, title, message, timestamp, read, actionUrl, icon }\` |
| **userData.json** | Dashboard data | \`{ user, tokens, streak, referrals, orders, achievements, preferences }\` |

### Data-to-Component Mapping

| Component | Data Source | Notes |
|-----------|-------------|-------|
| **Blog list** | `blogs.json` → `fetchBlogs(page, limit)` | Paginated, 10 items per page |
| **Blog detail** | `blogs.json` → `fetchBlogById(id)` | Individual post by ID or slug |
| **Portfolio** | `portfolio.json` → `fetchPortfolio(page, limit, category)` | Pagination + category filter |
| **Services** | `services.json` → `fetchServices()` | All services with pricing tiers |
| **Testimonials** | `testimonials.json` → `fetchTestimonials()` | Client reviews with ratings |
| **Dashboard** | `userData.json` → `fetchUserData()` | Requires auth token |

---

## 🔄 Switching from Mock Data to Live API

All API calls are centralized in `/src/utils/api.ts`. To switch to a live backend:

### Step 1: Update Environment Variables

Create a `.env` file:

\`\`\`env
VITE_API_BASE_URL=https://your-api.com
VITE_USE_MOCK_DATA=false
\`\`\`

### Step 2: Backend Endpoints Required

\`\`\`
GET  /api/blogs?page=1&limit=10
GET  /api/blogs/:id
GET  /api/portfolio?page=1&limit=10&category=Logos
GET  /api/portfolio/:id
GET  /api/services
GET  /api/services/:id
GET  /api/testimonials
POST /api/contact
POST /api/newsletter/subscribe
GET  /api/user/profile (requires auth)
\`\`\`

### Example Response Format (Paginated)

\`\`\`json
{
  "data": [...],
  "page": 1,
  "totalPages": 5,
  "totalItems": 50,
  "itemsPerPage": 10
}
\`\`\`

### Code Example

The API utility already handles both modes:

\`\`\`typescript
// In /src/utils/api.ts
export async function fetchBlogs(page = 1, limit = 10) {
  if (USE_MOCK_DATA) {
    // Return mock data with pagination
    return paginateMockData(blogsData, page, limit);
  }

  // Call live API
  const response = await fetch(\`\${API_BASE_URL}/api/blogs?page=\${page}&limit=\${limit}\`);
  return await response.json();
}
\`\`\`

**No component code needs to change!** Components use the same functions regardless of backend.

---

## 📊 Analytics Integration

### Setup Google Analytics 4

Add GA4 script to `index.html`:

\`\`\`html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
\`\`\`

Events are automatically tracked when user opts in via the consent modal.

### Available Analytics Events

\`\`\`typescript
import { useAnalytics } from '@/utils/analytics';

const analytics = useAnalytics();

// Track custom events
analytics.track(analytics.events.PAGE_VIEW, { page_path: '/services' });
analytics.track(analytics.events.CONTACT_SUBMIT, { service: 'logo' });
analytics.track(analytics.events.CALCULATOR_USE, { estimated_price: 500 });
analytics.track(analytics.events.CTA_CLICK, { cta_location: 'hero' });
\`\`\`

### GDPR Compliance

- ✅ Analytics disabled by default
- ✅ Consent modal shows on first visit (after 2s delay)
- ✅ User choice stored in localStorage
- ✅ Opt-out available anytime
- ✅ No tracking before explicit consent

---

## 🧪 Testing Instructions

### Test Pagination

**Blog:**
1. Navigate to `/blog`
2. Click pagination links
3. Verify URL changes to `/blog?page=2`
4. Check correct items load (items 11-20 on page 2)

**Portfolio:**
1. Navigate to `/portfolio`
2. Select a category (e.g., "Logos")
3. Verify URL: `/portfolio?page=1&category=Logos`
4. Test pagination with category filter active

### Test Contact Form Validation

**Try these scenarios:**
- Submit empty form → See validation errors
- Enter invalid email → "Please enter a valid email"
- Enter 1-character name → "Name must be at least 2 characters"
- Enter 1001-character message → "Message must be less than 1000 characters"
- Enter invalid phone (optional field) → "Please enter a valid phone number"
- Fill correctly and submit → Loading state → Success message

### Test Pricing Calculator

1. Navigate to `/services`
2. Find calculator at top
3. Select "Logo Design"
4. Adjust quantity slider → Price updates
5. Set complexity to "Premium" → Price multiplies
6. Set turnaround to 2 days → See "+50% Rush Delivery"
7. Click "Get Started" → Redirects to `/contact?service=logo&estimated_price=XXX`

### Test Error Boundary

Temporarily add to any component: `throw new Error('Test error');`

- Error boundary catches it
- Shows friendly error message
- Click "Try Again" → Component remounts
- Click "Go Home" → Navigate to homepage

### Test Analytics Consent

**First Visit (Incognito):**
1. Open site in incognito mode
2. Wait 2 seconds → Consent modal appears
3. Click "Decline" → Modal closes, tracking disabled
4. Refresh → Modal doesn't reappear

**Accept Consent:**
1. Clear localStorage
2. Refresh → Wait for modal
3. Click "Accept" → Tracking enabled
4. Check console for `[Analytics]` events

### Test Returning Visitor Banner

Simulate returning visitor in console:

\`\`\`javascript
localStorage.setItem('last_visit', Date.now() - (2 * 24 * 60 * 60 * 1000)); // 2 days ago
localStorage.removeItem('returning_banner_dismissed');
\`\`\`

Refresh → Banner shows: "It's been 2 days since your last visit"

---

## 🎨 Design System

All colors use semantic tokens from `index.css` and `tailwind.config.ts`:

\`\`\`tsx
// ✅ CORRECT - Uses design tokens
<div className="bg-card text-foreground border-border">

// ❌ WRONG - Hardcoded colors
<div className="bg-white text-black border-gray-200">
\`\`\`

### Available Design Tokens

| Token | Usage |
|-------|-------|
| \`bg-gradient-youtube\` | Primary CTA gradients |
| \`text-youtube-red\` | Accent text color |
| \`card-premium\` | Premium card styling |
| \`shadow-glow\` | Hover glow effect |
| \`transition-smooth\` | Smooth transitions |

---

## 🛠️ Development Setup

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Local Development

\`\`\`sh
# Clone repository
git clone <YOUR_GIT_URL>

# Navigate to project
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start dev server
npm run dev
\`\`\`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

Output in \`dist/\` folder.

---

## 🚀 Deployment

### Deploy via Lovable

Simply open [Lovable](https://lovable.dev/projects/bb856f5c-3dfe-464a-a465-9444f237ec06) and click Share → Publish.

### Custom Domain

Navigate to Project > Settings > Domains and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

### Environment Variables for Production

\`\`\`env
VITE_API_BASE_URL=https://api.adilgfx.com
VITE_USE_MOCK_DATA=false
\`\`\`

---

## 📝 Development Guidelines

1. **Never hardcode content** - Always use mock JSON or API calls
2. **Use TypeScript types** - Import from `/src/types`
3. **Centralize API calls** - All in `/src/utils/api.ts`
4. **Follow design system** - Use semantic tokens, not hardcoded colors
5. **Track events** - Use `useAnalytics()` hook for user actions
6. **Add SEO** - Use `<SEOHead>` component on all pages
7. **Handle errors** - Components wrapped in `<ErrorBoundary>`
8. **Show loading states** - Use skeleton loaders during data fetching

---

## 🐛 Troubleshooting

**Pagination not working:**
- Check browser console for errors
- Verify URL contains `?page=` parameter
- Ensure `fetchBlogs()` is called with correct page number

**Analytics not tracking:**
- Check if user has opted in via consent modal
- Open console → Look for `[Analytics]` logs
- Verify `localStorage.getItem('analytics_consent')` returns 'true'

**Form validation not showing:**
- Ensure field has been touched (blurred)
- Check `errors` state in React DevTools
- Verify ARIA attributes are present

**Mock data not loading:**
- Check `VITE_USE_MOCK_DATA` is not set to 'false'
- Verify JSON files exist in `/src/data/`
- Check browser console for import errors

---

## 🏗️ Technologies Used

- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **React 18** - UI library
- **shadcn-ui** - Component library
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **React Helmet** - SEO meta tags
- **React Query** - Data fetching

---

## 🎯 Success Criteria

✅ Pixel-perfect, fast, mobile-responsive  
✅ Zero hardcoded data (everything from mock files)  
✅ Clean, maintainable, documented code  
✅ Easy integration with PHP/Node.js backend  
✅ Production-ready with all features implemented  
✅ GDPR-compliant analytics  
✅ Comprehensive SEO optimization  
✅ Full accessibility (ARIA attributes)  

**Ready for deployment and backend integration!** 🚀

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Adil GFX**  
Professional Design Services  
[adilgfx.com](https://adilgfx.com)
