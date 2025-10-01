-- Extended Database Schema for CMS Features
-- Run this after the main schema to add CMS capabilities

-- Global settings table for site-wide configuration
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value LONGTEXT,
    setting_type ENUM('text', 'json', 'boolean', 'number', 'file') DEFAULT 'text',
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_setting_key (setting_key)
);

-- Pages management table for dynamic page creation
CREATE TABLE IF NOT EXISTS pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    og_title VARCHAR(255),
    og_description TEXT,
    og_image VARCHAR(255),
    schema_type VARCHAR(100) DEFAULT 'WebPage',
    sections JSON,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    sort_order INT DEFAULT 0,
    show_in_nav BOOLEAN DEFAULT TRUE,
    nav_label VARCHAR(100),
    publish_date TIMESTAMP NULL,
    unpublish_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order),
    INDEX idx_show_in_nav (show_in_nav)
);

-- Carousel slides management
CREATE TABLE IF NOT EXISTS carousel_slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carousel_name VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    cta_text VARCHAR(100),
    cta_url VARCHAR(255),
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_carousel_name (carousel_name),
    INDEX idx_sort_order (sort_order),
    INDEX idx_active (active)
);

-- Media uploads tracking
CREATE TABLE IF NOT EXISTS media_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by INT,
    alt_text VARCHAR(255),
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_mime_type (mime_type),
    INDEX idx_created_at (created_at)
);

-- Enhanced content tables with scheduling
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS publish_date TIMESTAMP NULL;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS unpublish_date TIMESTAMP NULL;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS status ENUM('draft', 'published', 'archived') DEFAULT 'published';

ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS publish_date TIMESTAMP NULL;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS unpublish_date TIMESTAMP NULL;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS status ENUM('draft', 'published', 'archived') DEFAULT 'published';

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS publish_date TIMESTAMP NULL;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS unpublish_date TIMESTAMP NULL;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS status ENUM('draft', 'published', 'archived') DEFAULT 'published';

-- Insert default global settings
INSERT IGNORE INTO settings (setting_key, setting_value, setting_type, category, description) VALUES
-- Branding
('site_logo', '/logo.png', 'file', 'branding', 'Main site logo'),
('site_favicon', '/favicon.ico', 'file', 'branding', 'Site favicon'),
('primary_color', '#FF0000', 'text', 'branding', 'Primary brand color'),
('secondary_color', '#1F2937', 'text', 'branding', 'Secondary brand color'),
('font_family', 'Inter', 'text', 'branding', 'Primary font family'),

-- Contact Info
('contact_email', 'hello@adilgfx.com', 'text', 'contact', 'Primary contact email'),
('contact_phone', '+1 (555) 123-4567', 'text', 'contact', 'Contact phone number'),
('contact_address', '', 'text', 'contact', 'Business address'),
('whatsapp_number', '+1234567890', 'text', 'contact', 'WhatsApp number'),

-- Social Links
('social_facebook', 'https://facebook.com/adilgfx', 'text', 'social', 'Facebook profile URL'),
('social_instagram', 'https://instagram.com/adilgfx', 'text', 'social', 'Instagram profile URL'),
('social_linkedin', 'https://linkedin.com/in/adilgfx', 'text', 'social', 'LinkedIn profile URL'),
('social_youtube', 'https://youtube.com/@adilgfx', 'text', 'social', 'YouTube channel URL'),
('social_fiverr', 'https://fiverr.com/adilgfx', 'text', 'social', 'Fiverr profile URL'),

-- Analytics
('google_analytics_id', '', 'text', 'analytics', 'Google Analytics tracking ID'),
('facebook_pixel_id', '', 'text', 'analytics', 'Facebook Pixel ID'),
('hotjar_id', '', 'text', 'analytics', 'Hotjar tracking ID'),

-- Integrations
('mailchimp_api_key', '', 'text', 'integrations', 'Mailchimp API key'),
('sendgrid_api_key', '', 'text', 'integrations', 'SendGrid API key'),
('chatbot_api_key', '', 'text', 'integrations', 'Chatbot API key'),
('calendly_url', 'https://calendly.com/adilgfx/consultation', 'text', 'integrations', 'Calendly booking URL'),

-- Feature Toggles
('enable_referrals', 'true', 'boolean', 'features', 'Enable referral system'),
('enable_streaks', 'true', 'boolean', 'features', 'Enable login streaks'),
('enable_tokens', 'true', 'boolean', 'features', 'Enable token rewards'),
('enable_popups', 'true', 'boolean', 'features', 'Enable popup offers'),
('enable_chatbot', 'true', 'boolean', 'features', 'Enable chatbot'),

-- Site Content
('site_title', 'Adil GFX - Professional Design Services', 'text', 'content', 'Site title'),
('site_description', 'Professional logo design, YouTube thumbnails, and video editing services', 'text', 'content', 'Site description'),
('footer_text', '© 2025 Adil GFX. All rights reserved.', 'text', 'content', 'Footer copyright text'),
('header_cta_text', 'Hire Me Now', 'text', 'content', 'Header CTA button text'),
('header_cta_url', '/contact', 'text', 'content', 'Header CTA button URL');

-- Insert default pages
INSERT IGNORE INTO pages (title, slug, meta_title, meta_description, status, sort_order, show_in_nav, nav_label, sections) VALUES
('Home', 'home', 'Adil GFX - Professional Design Services', 'Transform your brand with premium designs', 'published', 1, TRUE, 'Home', '[]'),
('Portfolio', 'portfolio', 'Portfolio - Adil GFX', 'View our portfolio of successful projects', 'published', 2, TRUE, 'Portfolio', '[]'),
('Services', 'services', 'Services & Pricing - Adil GFX', 'Professional design services with transparent pricing', 'published', 3, TRUE, 'Services', '[]'),
('About', 'about', 'About Adil - Professional Designer', 'Learn about Adil and his design expertise', 'published', 4, TRUE, 'About', '[]'),
('Testimonials', 'testimonials', 'Client Testimonials - Adil GFX', 'Read what clients say about our services', 'published', 5, TRUE, 'Testimonials', '[]'),
('Blog', 'blog', 'Design Blog - Adil GFX', 'Design tips, tutorials, and industry insights', 'published', 6, TRUE, 'Blog', '[]'),
('FAQ', 'faq', 'Frequently Asked Questions - Adil GFX', 'Common questions about our design services', 'published', 7, TRUE, 'FAQ', '[]'),
('Contact', 'contact', 'Contact Us - Adil GFX', 'Get in touch for your design project', 'published', 8, TRUE, 'Contact', '[]');

-- Insert default carousel slides
INSERT IGNORE INTO carousel_slides (carousel_name, title, subtitle, description, image_url, cta_text, cta_url, sort_order) VALUES
('hero', 'Transform Your Brand', 'Premium Design Services', 'Professional logo design, YouTube thumbnails, and video editing', '/api/placeholder/800/600', 'Get Started', '/contact', 1),
('services', 'Logo Design', 'Professional Brand Identity', 'Create memorable logos that build trust and recognition', '/api/placeholder/600/400', 'Learn More', '/services#logo', 1),
('services', 'YouTube Thumbnails', 'High-Converting Click Magnets', 'Eye-catching thumbnails that boost your CTR', '/api/placeholder/600/400', 'Learn More', '/services#thumbnails', 2),
('services', 'Video Editing', 'Professional Video Production', 'Transform raw footage into engaging videos', '/api/placeholder/600/400', 'Learn More', '/services#video', 3);