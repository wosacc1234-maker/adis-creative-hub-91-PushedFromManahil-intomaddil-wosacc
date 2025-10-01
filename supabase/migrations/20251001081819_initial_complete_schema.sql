/*
  # Complete Adil GFX Database Schema - Production Ready
  
  ## Overview
  This migration creates the complete database structure for the Adil GFX design services platform,
  including all content management, user management, gamification, funnel tracking, and API integration features.
  
  ## Tables Created
  
  ### 1. Authentication & Users
  - users: Core user accounts with authentication
  - user_profiles: Extended user profile information
  - user_tokens: Gamification token system
  - token_history: Token earning/spending history
  - user_streaks: Daily login streak tracking
  - user_achievements: Achievement unlocks and progress
  
  ### 2. Content Management
  - blogs: Blog posts with SEO optimization
  - portfolio: Portfolio project showcase
  - services: Service offerings with pricing tiers
  - testimonials: Client testimonials and reviews
  - pages: Dynamic page management for CMS
  - carousel_slides: Hero and section carousels
  - media_uploads: File upload tracking
  
  ### 3. Global Settings & Configuration
  - settings: Site-wide configuration (branding, contact, social, features)
  - api_integrations: Third-party API credentials and toggles
  - api_usage_logs: API call tracking and monitoring
  
  ### 4. Lead Management & Funnel Tracking
  - contact_submissions: Contact form submissions
  - leads: Lead capture and enrichment data
  - lead_activities: Lead engagement tracking
  - funnel_events: Funnel step tracking and analytics
  - referrals: Referral program tracking
  
  ### 5. E-commerce & Orders
  - orders: Project orders and tracking
  - payments: Payment transaction records
  
  ### 6. Notifications & Communication
  - notifications: User notification system
  - email_campaigns: Email marketing campaigns
  - campaign_sends: Email campaign tracking
  
  ### 7. Analytics & Monitoring
  - page_views: Page view analytics
  - admin_audit_log: Admin action tracking
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict access to authenticated users and admins
  - Sensitive data protected with appropriate access controls
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    membership_tier TEXT DEFAULT 'basic' CHECK (membership_tier IN ('basic', 'premium', 'enterprise')),
    verified BOOLEAN DEFAULT FALSE,
    join_date TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (additional user data)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    phone TEXT,
    company TEXT,
    website TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User tokens (gamification)
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Token history
CREATE TABLE IF NOT EXISTS token_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('earned', 'spent')),
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User streaks
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_check_in DATE,
    next_milestone INTEGER DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    target_value INTEGER DEFAULT 1,
    reward_tokens INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    UNIQUE(user_id, achievement_id)
);

-- =====================================================
-- 2. CONTENT MANAGEMENT
-- =====================================================

-- Blogs
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author_name TEXT DEFAULT 'Adil',
    author_avatar TEXT,
    author_bio TEXT,
    featured_image TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    publish_date TIMESTAMPTZ,
    unpublish_date TIMESTAMPTZ,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio
CREATE TABLE IF NOT EXISTS portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    client TEXT NOT NULL,
    completion_date DATE NOT NULL,
    featured_image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    before_image TEXT,
    after_image TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    results JSONB DEFAULT '{}'::jsonb,
    featured BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    publish_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    pricing_tiers JSONB DEFAULT '[]'::jsonb,
    delivery_time TEXT NOT NULL,
    popular BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    avatar TEXT NOT NULL,
    project_type TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic pages
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    schema_type TEXT DEFAULT 'WebPage',
    sections JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    sort_order INTEGER DEFAULT 0,
    show_in_nav BOOLEAN DEFAULT TRUE,
    nav_label TEXT,
    publish_date TIMESTAMPTZ,
    unpublish_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carousel slides
CREATE TABLE IF NOT EXISTS carousel_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carousel_name TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    cta_text TEXT,
    cta_url TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media uploads
CREATE TABLE IF NOT EXISTS media_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    alt_text TEXT,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. GLOBAL SETTINGS & API INTEGRATIONS
-- =====================================================

-- Global settings
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'json', 'boolean', 'number', 'file')),
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API integrations configuration
CREATE TABLE IF NOT EXISTS api_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    api_key TEXT,
    api_secret TEXT,
    webhook_url TEXT,
    enabled BOOLEAN DEFAULT FALSE,
    config JSONB DEFAULT '{}'::jsonb,
    rate_limit INTEGER DEFAULT 1000,
    rate_window TEXT DEFAULT '1 hour',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API usage logs
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_name TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. LEAD MANAGEMENT & FUNNEL TRACKING
-- =====================================================

-- Contact submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    service TEXT,
    budget TEXT,
    timeline TEXT,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    ip_address TEXT,
    user_agent TEXT,
    source TEXT DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (enriched contact data)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_submission_id UUID REFERENCES contact_submissions(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    company_size TEXT,
    industry TEXT,
    job_title TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    enrichment_data JSONB DEFAULT '{}'::jsonb,
    lead_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead activities
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('email', 'call', 'meeting', 'note', 'whatsapp', 'telegram')),
    subject TEXT,
    description TEXT,
    outcome TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funnel events (analytics)
CREATE TABLE IF NOT EXISTS funnel_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    page_url TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_email TEXT,
    referred_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referral_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    earnings INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- =====================================================
-- 5. E-COMMERCE & ORDERS
-- =====================================================

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    package_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    order_date TIMESTAMPTZ DEFAULT NOW(),
    expected_completion DATE,
    completion_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'coinbase', 'paypal', 'manual')),
    transaction_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. NOTIFICATIONS & COMMUNICATION
-- =====================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('success', 'info', 'reward', 'promo', 'milestone', 'warning', 'error')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    icon TEXT DEFAULT 'Bell',
    read BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    from_email TEXT NOT NULL,
    from_name TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    segment_filter JSONB,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign sends (tracking)
CREATE TABLE IF NOT EXISTS campaign_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    source TEXT DEFAULT 'website',
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- =====================================================
-- 7. ANALYTICS & MONITORING
-- =====================================================

-- Page views
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_url TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    session_id TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(featured);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_slug ON portfolio(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_name ON carousel_slides(carousel_name);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_funnel_events_session ON funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_type ON funnel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_integration ON api_usage_logs(integration_name);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published blogs" ON blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published portfolio" ON portfolio FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (active = TRUE);
CREATE POLICY "Public can view published testimonials" ON testimonials FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published pages" ON pages FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view active carousel slides" ON carousel_slides FOR SELECT USING (active = TRUE);
CREATE POLICY "Public can view global settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public can view achievements" ON achievements FOR SELECT USING (active = TRUE);

-- User policies (own data only)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own tokens" ON user_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own token history" ON token_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = (SELECT user_id FROM orders WHERE orders.id = order_id));
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id);

-- Admin policies (full access)
CREATE POLICY "Admins have full access to users" ON users FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to blogs" ON blogs FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to portfolio" ON portfolio FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to services" ON services FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to testimonials" ON testimonials FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to pages" ON pages FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to carousel" ON carousel_slides FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to media" ON media_uploads FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to settings" ON settings FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to api_integrations" ON api_integrations FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to api_usage_logs" ON api_usage_logs FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to contacts" ON contact_submissions FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to leads" ON leads FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to lead_activities" ON lead_activities FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to orders" ON orders FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to campaigns" ON email_campaigns FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to campaign_sends" ON campaign_sends FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins have full access to subscribers" ON newsletter_subscribers FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can view audit log" ON admin_audit_log FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Public submission policies
CREATE POLICY "Anyone can submit contact form" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can track funnel events" ON funnel_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can track page views" ON page_views FOR INSERT WITH CHECK (true);