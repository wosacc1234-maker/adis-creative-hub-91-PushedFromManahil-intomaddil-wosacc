import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar: string | null;
          role: 'user' | 'admin';
          membership_tier: 'basic' | 'premium' | 'enterprise';
          verified: boolean;
          join_date: string;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          category: string;
          author_name: string;
          author_avatar: string | null;
          author_bio: string | null;
          featured_image: string;
          tags: string[];
          featured: boolean;
          views: number;
          likes: number;
          status: 'draft' | 'published' | 'archived';
          publish_date: string | null;
          unpublish_date: string | null;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
      };
      portfolio: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string;
          description: string;
          long_description: string | null;
          client: string;
          completion_date: string;
          featured_image: string;
          images: string[];
          before_image: string | null;
          after_image: string | null;
          tags: string[];
          results: Record<string, any>;
          featured: boolean;
          views: number;
          status: 'draft' | 'published' | 'archived';
          publish_date: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          tagline: string;
          description: string;
          features: string[];
          pricing_tiers: Array<{
            name: string;
            price: number;
            duration: string;
            features: string[];
            popular?: boolean;
          }>;
          delivery_time: string;
          popular: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          role: string;
          company: string;
          content: string;
          rating: number;
          avatar: string;
          project_type: string;
          verified: boolean;
          featured: boolean;
          status: 'draft' | 'published' | 'archived';
          date: string;
          created_at: string;
          updated_at: string;
        };
      };
      settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: string | null;
          setting_type: 'text' | 'json' | 'boolean' | 'number' | 'file';
          category: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      api_integrations: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          api_key: string | null;
          api_secret: string | null;
          webhook_url: string | null;
          enabled: boolean;
          config: Record<string, any>;
          rate_limit: number;
          rate_window: string;
          created_at: string;
          updated_at: string;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          service: string | null;
          budget: string | null;
          timeline: string | null;
          phone: string | null;
          message: string;
          status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
          ip_address: string | null;
          user_agent: string | null;
          source: string;
          created_at: string;
          updated_at: string;
        };
      };
      leads: {
        Row: {
          id: string;
          contact_submission_id: string | null;
          email: string;
          name: string;
          phone: string | null;
          company: string | null;
          company_size: string | null;
          industry: string | null;
          job_title: string | null;
          linkedin_url: string | null;
          twitter_url: string | null;
          enrichment_data: Record<string, any>;
          lead_score: number;
          status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      funnel_events: {
        Row: {
          id: string;
          session_id: string;
          event_type: string;
          event_data: Record<string, any>;
          page_url: string | null;
          referrer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          type: 'success' | 'info' | 'reward' | 'promo' | 'milestone' | 'warning' | 'error';
          title: string;
          message: string;
          action_url: string | null;
          icon: string;
          read: boolean;
          expires_at: string | null;
          created_at: string;
        };
      };
    };
  };
};
