import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { Service, RecentWork, Testimonial, Course } from './types';

interface QueryResult<T> {
  data: T[];
  loading: boolean;
}

export function useServices(): QueryResult<Service> {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!cancelled && !error && data) setData(data as Service[]);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}

export function useRecentWorks(): QueryResult<RecentWork> {
  const [data, setData] = useState<RecentWork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('recent_works')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!cancelled && !error && data) setData(data as RecentWork[]);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}

export function useTestimonials(): QueryResult<Testimonial> {
  const [data, setData] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!cancelled && !error && data) setData(data as Testimonial[]);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}

export function useCourses(): QueryResult<Course> {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!cancelled && !error && data) setData(data as Course[]);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}

export function useAppSettings() {
  const [settings, setSettings] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('app_settings')
      .select('key, value')
      .then(({ data, error }) => {
        if (!cancelled && !error && data) {
          const settingsObj = data.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {} as Record<string, string | null>);
          setSettings(settingsObj);
        }
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { settings, loading };
}
