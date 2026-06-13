// ── Database row types ──────────────────────────────

export type ServiceCategory =
  | 'web_static'
  | 'web_dynamic'
  | 'web_fullstack'
  | 'web_ecommerce'
  | 'mobile_app'
  | 'java_proxy'
  | 'courses'
  | 'ui_ux';

export type CourseCategory = string;

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  price_start: number;
  price_end: number;
  duration: string | null;
  image_url: string | null;
  icon_name: string | null;
  features: string[];
  tech_stack: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  is_special?: boolean;
}

export const COURSE_CATEGORY_LABELS: Record<string, string> = {
  'ui_ux': 'UI/UX Design',
  'web_dev': 'Web Dev',
  'web_design': 'Web Design',
  'mobile_app': 'Mobile App',
  'specialized': 'Specialized',
  'full_stack': 'Full Stack',
  'frontend': 'Frontend',
  'backend': 'Backend',
};

export interface RecentWork {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  description: string | null;
  color_hex: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
  text: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: CourseCategory | null;
  price: number;
  duration: string | null;
  students_count: number;
  image_url: string | null;
  icon_name: string | null;
  grad_color_1: string | null;
  grad_color_2: string | null;
  is_special: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// ── UI types ────────────────────────────────────────

export type TabKey = 'Home' | 'Services' | 'Courses' | 'Profile';

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  web_static: 'Static',
  web_dynamic: 'Dynamic',
  web_fullstack: 'Full-Stack',
  web_ecommerce: 'E-Commerce',
  mobile_app: 'Mobile App',
  java_proxy: 'Java Proxy',
  courses: 'Courses',
  ui_ux: 'UI/UX Design',
};
