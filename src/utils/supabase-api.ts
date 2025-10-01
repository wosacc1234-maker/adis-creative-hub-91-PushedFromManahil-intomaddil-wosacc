import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Tables = Database['public']['Tables'];
type Blog = Tables['blogs']['Row'];
type Portfolio = Tables['portfolio']['Row'];
type Service = Tables['services']['Row'];
type Testimonial = Tables['testimonials']['Row'];
type ContactSubmission = Tables['contact_submissions']['Row'];
type Setting = Tables['settings']['Row'];
type ApiIntegration = Tables['api_integrations']['Row'];
type Notification = Tables['notifications']['Row'];

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}

export async function fetchGlobalSettings(): Promise<Record<string, any>> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*');

    if (error) throw error;

    const settings: Record<string, any> = {};

    data?.forEach((setting: Setting) => {
      const category = setting.category;
      if (!settings[category]) {
        settings[category] = {};
      }

      let value = setting.setting_value;
      if (setting.setting_type === 'boolean') {
        value = setting.setting_value === 'true';
      } else if (setting.setting_type === 'json' && value) {
        value = JSON.parse(value);
      } else if (setting.setting_type === 'number' && value) {
        value = parseFloat(value);
      }

      settings[category][setting.setting_key.replace(`${category}_`, '')] = value;
    });

    return settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}

export async function fetchBlogs(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Blog>> {
  try {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    return {
      data: data || [],
      page,
      totalPages: Math.ceil((count || 0) / limit),
      totalItems: count || 0,
    };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return { data: [], page: 1, totalPages: 0, totalItems: 0 };
  }
}

export async function fetchBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;

    if (data) {
      await supabase
        .from('blogs')
        .update({ views: data.views + 1 })
        .eq('id', data.id);
    }

    return data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

export async function fetchPortfolio(
  page: number = 1,
  limit: number = 10,
  category?: string
): Promise<PaginatedResponse<Portfolio>> {
  try {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
      .from('portfolio')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    return {
      data: data || [],
      page,
      totalPages: Math.ceil((count || 0) / limit),
      totalItems: count || 0,
    };
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return { data: [], page: 1, totalPages: 0, totalItems: 0 };
  }
}

export async function fetchPortfolioBySlug(slug: string): Promise<Portfolio | null> {
  try {
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;

    if (data) {
      await supabase
        .from('portfolio')
        .update({ views: data.views + 1 })
        .eq('id', data.id);
    }

    return data;
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    return null;
  }
}

export async function fetchServices(): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('popular', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function fetchServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

export async function submitContactForm(formData: {
  name: string;
  email: string;
  service?: string;
  budget?: string;
  timeline?: string;
  phone?: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name: formData.name,
        email: formData.email,
        service: formData.service || null,
        budget: formData.budget || null,
        timeline: formData.timeline || null,
        phone: formData.phone || null,
        message: formData.message,
        status: 'new',
        source: 'website',
      });

    if (error) throw error;

    await trackFunnelEvent({
      event_type: 'contact_form_submission',
      event_data: {
        service: formData.service,
        budget: formData.budget,
      },
    });

    return {
      success: true,
      message: "Thank you for your message! We'll get back to you within 2 hours.",
    };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return {
      success: false,
      message: 'Failed to send message. Please try again.',
    };
  }
}

export async function subscribeNewsletter(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        status: 'active',
        source: 'website',
      });

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          message: 'This email is already subscribed.',
        };
      }
      throw error;
    }

    await trackFunnelEvent({
      event_type: 'newsletter_subscription',
      event_data: { email },
    });

    return {
      success: true,
      message: 'Successfully subscribed to our newsletter!',
    };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return {
      success: false,
      message: 'Failed to subscribe. Please try again.',
    };
  }
}

export async function trackFunnelEvent(event: {
  event_type: string;
  event_data?: Record<string, any>;
  page_url?: string;
  referrer?: string;
}): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    const urlParams = new URLSearchParams(window.location.search);

    await supabase.from('funnel_events').insert({
      session_id: sessionId,
      event_type: event.event_type,
      event_data: event.event_data || {},
      page_url: event.page_url || window.location.href,
      referrer: event.referrer || document.referrer,
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
    });
  } catch (error) {
    console.error('Error tracking funnel event:', error);
  }
}

export async function trackPageView(pageData: {
  page_url: string;
  page_title: string;
}): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();

    await supabase.from('page_views').insert({
      page_url: pageData.page_url,
      page_title: pageData.page_title,
      referrer: document.referrer,
      session_id: sessionId,
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }

  return sessionId;
}

export async function fetchApiIntegrations(): Promise<ApiIntegration[]> {
  try {
    const { data, error } = await supabase
      .from('api_integrations')
      .select('id, name, display_name, description, enabled, config, rate_limit, rate_window')
      .order('display_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching API integrations:', error);
    return [];
  }
}

export async function updateApiIntegration(
  id: string,
  updates: {
    enabled?: boolean;
    api_key?: string;
    api_secret?: string;
    webhook_url?: string;
    config?: Record<string, any>;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('api_integrations')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return {
      success: true,
      message: 'API integration updated successfully',
    };
  } catch (error) {
    console.error('Error updating API integration:', error);
    return {
      success: false,
      message: 'Failed to update API integration',
    };
  }
}

export async function callApiIntegration(
  integrationName: string,
  endpoint: string,
  method: string = 'GET',
  data?: any
): Promise<any> {
  try {
    const { data: integration, error } = await supabase
      .from('api_integrations')
      .select('*')
      .eq('name', integrationName)
      .eq('enabled', true)
      .maybeSingle();

    if (error || !integration) {
      throw new Error(`Integration ${integrationName} not found or not enabled`);
    }

    const config = integration.config as Record<string, any>;
    const baseUrl = config.api_endpoint;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (integration.api_key) {
      if (integrationName === 'openai') {
        headers['Authorization'] = `Bearer ${integration.api_key}`;
      } else if (integrationName === 'hunter_io') {
        endpoint = `${endpoint}?api_key=${integration.api_key}`;
      } else {
        headers['Authorization'] = `Bearer ${integration.api_key}`;
      }
    }

    const startTime = Date.now();

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const duration = Date.now() - startTime;
    const responseData = await response.json();

    await supabase.from('api_usage_logs').insert({
      integration_name: integrationName,
      endpoint,
      method,
      status_code: response.status,
      request_data: data || {},
      response_data: responseData,
      error_message: response.ok ? null : responseData.error || 'Request failed',
      duration_ms: duration,
    });

    if (!response.ok) {
      throw new Error(responseData.error || 'API request failed');
    }

    return responseData;
  } catch (error) {
    console.error(`Error calling ${integrationName} API:`, error);
    throw error;
  }
}

export async function enrichLead(email: string): Promise<any> {
  try {
    const hunterData = await callApiIntegration(
      'hunter_io',
      `/email-verifier?email=${email}`,
      'GET'
    );

    let clearbitData = null;
    try {
      clearbitData = await callApiIntegration(
        'clearbit',
        `/companies/find?email=${email}`,
        'GET'
      );
    } catch (e) {
      console.log('Clearbit enrichment failed, continuing without it');
    }

    return {
      email_verified: hunterData?.data?.status === 'valid',
      company: clearbitData?.name || null,
      company_size: clearbitData?.metrics?.employees || null,
      industry: clearbitData?.category?.industry || null,
      linkedin_url: clearbitData?.linkedin?.handle ? `https://linkedin.com/company/${clearbitData.linkedin.handle}` : null,
    };
  } catch (error) {
    console.error('Error enriching lead:', error);
    return null;
  }
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; message: string }> {
  try {
    await callApiIntegration(
      'whatsapp_business',
      '/messages',
      'POST',
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }
    );

    return {
      success: true,
      message: 'WhatsApp message sent successfully',
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      message: 'Failed to send WhatsApp message',
    };
  }
}

export async function sendTelegramMessage(
  chatId: string,
  message: string
): Promise<{ success: boolean; message: string }> {
  try {
    await callApiIntegration(
      'telegram_bot',
      '/sendMessage',
      'POST',
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }
    );

    return {
      success: true,
      message: 'Telegram message sent successfully',
    };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return {
      success: false,
      message: 'Failed to send Telegram message',
    };
  }
}

export async function sendEmailCampaign(
  to: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; message: string }> {
  try {
    await callApiIntegration(
      'sendgrid',
      '/mail/send',
      'POST',
      {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'hello@adilgfx.com', name: 'Adil GFX' },
        subject,
        content: [{ type: 'text/html', value: htmlContent }],
      }
    );

    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: 'Failed to send email',
    };
  }
}

export async function chatWithAI(
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  try {
    const response = await callApiIntegration(
      'openai',
      '/chat/completions',
      'POST',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for Adil GFX, a professional design services company. Help customers with inquiries about logo design, YouTube thumbnails, video editing, and channel management services.',
          },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }
    );

    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error chatting with AI:', error);
    return 'Sorry, I am currently unavailable. Please try again later or contact us directly.';
  }
}

export async function fetchNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}
