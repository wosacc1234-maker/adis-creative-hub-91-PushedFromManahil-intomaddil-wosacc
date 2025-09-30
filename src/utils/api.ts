/**
 * Centralized API utility for all data fetching
 * 
 * This module provides a unified interface for fetching data from either:
 * 1. Mock JSON files (for development)
 * 2. Live API endpoints (for production)
 * 
 * Usage:
 * import { fetchBlogs, fetchTestimonials } from '@/utils/api';
 * 
 * const blogs = await fetchBlogs();
 * const testimonials = await fetchTestimonials();
 */

// Import mock data
import blogsData from '@/data/blogs.json';
import testimonialsData from '@/data/testimonials.json';
import portfolioData from '@/data/portfolio.json';
import servicesData from '@/data/services.json';
import notificationsData from '@/data/notifications.json';
import userDataFile from '@/data/userData.json';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'; // Default to true

// Types
export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  date: string;
  readTime: string;
  featuredImage: string;
  tags: string[];
  featured: boolean;
  views: number;
  likes: number;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  date: string;
  projectType: string;
  verified: boolean;
}

export interface PortfolioItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  longDescription: string;
  client: string;
  completionDate: string;
  featuredImage: string;
  images: string[];
  beforeImage: string;
  afterImage: string;
  tags: string[];
  results: {
    metric1: string;
    metric2: string;
    metric3: string;
  };
  featured: boolean;
  views: number;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  icon: string;
  tagline: string;
  description: string;
  features: string[];
  pricingTiers: {
    name: string;
    price: number;
    duration: string;
    features: string[];
    popular?: boolean;
  }[];
  deliveryTime: string;
  popular: boolean;
  testimonialIds: number[];
}

export interface Notification {
  id: number;
  type: 'success' | 'info' | 'reward' | 'promo' | 'milestone';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl: string;
  icon: string;
}

export interface UserData {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string;
    joinDate: string;
    membershipTier: string;
    verified: boolean;
  };
  tokens: {
    balance: number;
    totalEarned: number;
    totalSpent: number;
    history: Array<{
      id: string;
      type: 'earned' | 'spent';
      amount: number;
      description: string;
      date: string;
    }>;
  };
  streak: {
    current: number;
    longest: number;
    lastCheckIn: string;
    nextMilestone: number;
    rewards: Record<number, number>;
  };
  referrals: {
    code: string;
    totalReferred: number;
    successfulConversions: number;
    earningsFromReferrals: number;
    referralLink: string;
  };
  orders: Array<{
    id: string;
    service: string;
    package: string;
    status: string;
    orderDate: string;
    completionDate?: string;
    expectedCompletion?: string;
    amount: number;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    date?: string;
    progress?: number;
    target?: number;
  }>;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newsletter: boolean;
    theme: string;
  };
}

// Utility: Simulate network delay
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Utility: Handle API errors
const handleApiError = (error: any, fallbackData: any) => {
  console.error('API Error:', error);
  return fallbackData;
};

/**
 * Fetch all blog posts with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise<PaginatedResponse<Blog>>
 */
export async function fetchBlogs(page: number = 1, limit: number = 10): Promise<{ data: Blog[]; page: number; totalPages: number; totalItems: number; }> {
  if (USE_MOCK_DATA) {
    await simulateDelay();
    const allBlogs = blogsData as Blog[];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBlogs = allBlogs.slice(startIndex, endIndex);
    
    return {
      data: paginatedBlogs,
      page,
      totalPages: Math.ceil(allBlogs.length / limit),
      totalItems: allBlogs.length,
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/blogs?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch blogs');
    return await response.json();
  } catch (error) {
    const allBlogs = blogsData as Blog[];
    return {
      data: allBlogs.slice(0, limit),
      page: 1,
      totalPages: Math.ceil(allBlogs.length / limit),
      totalItems: allBlogs.length,
    };
  }
}

/**
 * Fetch single blog post by ID or slug
 * @param identifier - Blog ID or slug
 * @returns Promise<Blog | null>
 */
export async function fetchBlogById(identifier: string | number): Promise<Blog | null> {
  if (USE_MOCK_DATA) {
    await simulateDelay();
    const blog = blogsData.find(b => 
      b.id === Number(identifier) || b.slug === identifier
    );
    return blog as Blog || null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/blogs/${identifier}`);
    if (!response.ok) throw new Error('Blog not found');
    return await response.json();
  } catch (error) {
    return handleApiError(error, null);
  }
}

/**
 * Fetch all testimonials
 * @returns Promise<Testimonial[]>
 */
export async function fetchTestimonials(): Promise<Testimonial[]> {
  if (USE_MOCK_DATA) {
    await simulateDelay();
    return testimonialsData as Testimonial[];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/testimonials`);
    if (!response.ok) throw new Error('Failed to fetch testimonials');
    return await response.json();
  } catch (error) {
    return handleApiError(error, testimonialsData);
  }
}

/**
 * Fetch portfolio items with pagination and filtering
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param category - Optional category filter
 * @returns Promise<PaginatedResponse<PortfolioItem>>
 */
export async function fetchPortfolio(
  page: number = 1,
  limit: number = 10,
  category?: string
): Promise<{ data: PortfolioItem[]; page: number; totalPages: number; totalItems: number; }> {
  if (USE_MOCK_DATA) {
    await simulateDelay();
    let items = portfolioData as PortfolioItem[];
    
    // Filter by category
    if (category && category !== 'All') {
      items = items.filter(item => item.category === category);
    }
    
    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return {
      data: paginatedItems,
      page,
      totalPages: Math.ceil(items.length / limit),
      totalItems: items.length,
    };
  }

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (category && category !== 'All') {
      params.append('category', category);
    }
    
    const response = await fetch(`${API_BASE_URL}/api/portfolio?${params}`);
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return await response.json();
  } catch (error) {
    const items = portfolioData as PortfolioItem[];
    return {
      data: items.slice(0, limit),
      page: 1,
      totalPages: Math.ceil(items.length / limit),
      totalItems: items.length,
    };
  }
}

/**
 * Fetch single portfolio item by ID or slug
 * @param identifier - Portfolio ID or slug
 * @returns Promise<PortfolioItem | null>
 */
export async function fetchPortfolioById(identifier: string | number): Promise<PortfolioItem | null> {
  if (USE_MOCK_DATA) {
    await simulateDelay();
    const item = portfolioData.find(p => 
      p.id === Number(identifier) || p.slug === identifier
    );
    return item as PortfolioItem || null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/${identifier}`);
    if (!response.ok) throw new Error('Portfolio item not found');
    return await response.json();
  } catch (error) {
    return handleApiError(error, null);
  }
}

/**
 * Fetch all services
 * @returns Promise<Service[]>
 */
export async function fetchServices(): Promise<Service[]> {
  if (USE_MOCK_DATA) {
    await simulateDelay();
    return servicesData as Service[];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/services`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return await response.json();
  } catch (error) {
    return handleApiError(error, servicesData);
  }
}

/**
 * Fetch single service by ID or slug
 * @param identifier - Service ID or slug
 * @returns Promise<Service | null>
 */
export async function fetchServiceById(identifier: string | number): Promise<Service | null> {
  if (USE_MOCK_DATA) {
    await simulateDelay();
    const service = servicesData.find(s => 
      s.id === Number(identifier) || s.slug === identifier
    );
    return service as Service || null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/services/${identifier}`);
    if (!response.ok) throw new Error('Service not found');
    return await response.json();
  } catch (error) {
    return handleApiError(error, null);
  }
}

/**
 * Fetch user notifications
 * @param unreadOnly - If true, only fetch unread notifications
 * @returns Promise<Notification[]>
 */
export async function fetchNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
  if (USE_MOCK_DATA) {
    await simulateDelay();
    let notifications = notificationsData as Notification[];
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }
    return notifications;
  }

  try {
    const url = unreadOnly 
      ? `${API_BASE_URL}/api/notifications?unread=true`
      : `${API_BASE_URL}/api/notifications`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    return handleApiError(error, notificationsData);
  }
}

/**
 * Mark notification as read
 * @param notificationId - ID of notification to mark as read
 * @returns Promise<boolean>
 */
export async function markNotificationRead(notificationId: number): Promise<boolean> {
  if (USE_MOCK_DATA) {
    await simulateDelay();
    console.log(`Marked notification ${notificationId} as read`);
    return true;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}

/**
 * Fetch user data (requires authentication)
 * @returns Promise<UserData | null>
 */
export async function fetchUserData(): Promise<UserData | null> {
  if (USE_MOCK_DATA) {
    await simulateDelay();
    return userDataFile as UserData;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch user data');
    return await response.json();
  } catch (error) {
    return handleApiError(error, null);
  }
}

/**
 * Submit contact form
 * @param formData - Contact form data
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function submitContactForm(formData: {
  name: string;
  email: string;
  service: string;
  budget?: string;
  message: string;
  timeline?: string;
  phone?: string;
}): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK_DATA) {
    await simulateDelay(800);
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (success) {
      return {
        success: true,
        message: 'Thank you for your message! We\'ll get back to you within 2 hours.',
      };
    } else {
      return {
        success: false,
        message: 'Failed to send message. Please try again.',
      };
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'placeholder-for-csrf-token', // CSRF protection placeholder
      },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || 'Message sent successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
}

/**
 * Subscribe to newsletter
 * @param email - Email address
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK_DATA) {
    await simulateDelay(500);
    console.log('Newsletter subscription:', email);
    return {
      success: true,
      message: 'Successfully subscribed to our newsletter!',
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || 'Subscription successful',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to subscribe. Please try again later.',
    };
  }
}

// Export API configuration for reference
export const apiConfig = {
  baseUrl: API_BASE_URL,
  useMockData: USE_MOCK_DATA,
};
