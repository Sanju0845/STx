-- ============================================================
-- DIGITAL AGENCY — Full Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES (extends Supabase auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 2. SERVICES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price_start NUMERIC DEFAULT 0,
  price_end NUMERIC DEFAULT 0,
  duration TEXT,
  image_url TEXT,
  icon_name TEXT,
  features TEXT[] DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 3. RECENT WORKS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recent_works (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  color_hex TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 4. TESTIMONIALS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  avatar_url TEXT,
  text TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 5. COURSES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC DEFAULT 0,
  duration TEXT,
  students_count INTEGER DEFAULT 0,
  image_url TEXT,
  icon_name TEXT,
  grad_color_1 TEXT,
  grad_color_2 TEXT,
  is_special BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Public read policies for all content tables
CREATE POLICY "Services are viewable by everyone." ON services FOR SELECT USING (true);
CREATE POLICY "Recent works are viewable by everyone." ON recent_works FOR SELECT USING (true);
CREATE POLICY "Testimonials are viewable by everyone." ON testimonials FOR SELECT USING (true);
CREATE POLICY "Courses are viewable by everyone." ON courses FOR SELECT USING (true);

-- ────────────────────────────────────────────────────────────
-- 7. SEED DATA
-- ────────────────────────────────────────────────────────────
INSERT INTO services (title, description, category, price_start, price_end, duration, icon_name, features, tech_stack, is_active, sort_order) VALUES 
  ('Mobile App Development', 'Custom iOS & Android apps built with React Native / Expo. Full-cycle from design to deployment.', 'mobile_app', 15000, 80000, '4-12 weeks', 'phone-portrait', ARRAY['UI/UX Design', 'Cross-Platform', 'Push Notifications', 'Offline Support'], ARRAY['React Native', 'Expo', 'TypeScript'], true, 1),
  ('Website Development', 'Responsive websites & web apps. Landing pages, e-commerce, dashboards — you name it.', 'web_fullstack', 8000, 50000, '2-8 weeks', 'globe', ARRAY['Responsive Design', 'SEO Optimized', 'Fast Performance', 'Admin Panel'], ARRAY['React', 'Next.js', 'Tailwind'], true, 2),
  ('UI/UX Design', 'Pixel-perfect interfaces with Figma prototypes, user research, and design systems.', 'ui_ux', 5000, 30000, '1-4 weeks', 'color-palette', ARRAY['Figma Prototypes', 'User Research', 'Wireframing', 'Design System'], ARRAY['Figma', 'Adobe XD'], true, 3),
  ('Ready Templates', 'Pre-built app & website templates you can customize and ship fast. Great for MVPs.', 'web_static', 2000, 10000, 'Instant', 'cube', ARRAY['One-Click Setup', 'Full Documentation', 'Lifetime Updates', 'Customizable'], ARRAY['React', 'Tailwind'], true, 4),
  ('Java Proxy Interviews', '1-on-1 or group sessions on Java, Spring Boot, Microservices, React Native & more.', 'java_proxy', 500, 5000, 'Per session', 'school', ARRAY['Live Coding', 'Resume Review', 'Mock Interviews', 'Career Guidance'], ARRAY['Java', 'Spring Boot'], true, 5)
ON CONFLICT DO NOTHING;

INSERT INTO testimonials (name, role, avatar_url, text, rating, is_active, sort_order) VALUES 
  ('Sarah Johnson', 'Startup Founder', 'https://i.pravatar.cc/150?img=1', 'Amazing work! They delivered our app in record time and the quality is outstanding.', 5, true, 1),
  ('Michael Chen', 'Product Manager', 'https://i.pravatar.cc/150?img=2', 'Professional, responsive, and incredibly talented. Highly recommended!', 5, true, 2),
  ('Priya Patel', 'CTO', 'https://i.pravatar.cc/150?img=3', 'Best design agency we have worked with. The team is creative and technical.', 5, true, 3)
ON CONFLICT DO NOTHING;
