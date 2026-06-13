import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useCourses, useTestimonials } from '../lib/useData';
import type { Course } from '../lib/types';
import { COURSE_CATEGORY_LABELS } from '../lib/types';
import { useTheme } from '../lib/ThemeContext';

const CAT_COLORS: Record<string, string> = {
  ui_ux: '#004CD2',
  web_dev: '#627289',
  mobile_app: '#38485D',
  specialized: '#fff',
};

function FadeInSmall({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);
  React.useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
      translateY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) });
    }, delay);
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export default function CoursesScreen() {
  const [search, setSearch] = useState('');
  const { data: courses } = useCourses();
  const { data: testimonials } = useTestimonials();
  const { theme: t } = useTheme();

  // Extract unique categories from courses
  const uniqueCategories = Array.from(new Set(courses.map(course => course.category).filter(Boolean) as string[]));
  // Create filters: "All Courses" + unique categories
  const filters = ['All Courses', ...uniqueCategories];
  // Generate display labels for categories
  const getCategoryLabel = (category: string) => {
    return COURSE_CATEGORY_LABELS[category] || 
      category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Track active filter
  const [activeFilter, setActiveFilter] = useState('All Courses');

  // Filter courses based on active filter and search
  const filteredCourses = courses.filter(course => {
    const matchesFilter = activeFilter === 'All Courses' || course.category === activeFilter;
    const matchesSearch = search === '' || 
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: t.BG }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Title */}
        <View style={styles.titleSection}>
          <FadeInSmall delay={50}>
            <Text style={[styles.pageTitle, { color: t.ON_SURFACE }]}>Master Your Craft</Text>
          </FadeInSmall>
          <FadeInSmall delay={80}>
            <Text style={[styles.pageSub, { color: t.TEXT2 }]}>Expert-led courses for digital visionary leaders.</Text>
          </FadeInSmall>
        </View>

        {/* Search */}
        <FadeInSmall delay={110}>
          <View style={[styles.searchWrap, { backgroundColor: t.SURF_LOW }]}>
            <Ionicons name="search-outline" size={18} color={t.OUTLINE} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: t.ON_SURFACE }]}
              placeholder="Search courses..."
              placeholderTextColor={t.OUTLINE}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </FadeInSmall>

        {/* Filter Chips */}
        <FadeInSmall delay={140}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {filters.map((filter) => {
              const displayLabel = filter === 'All Courses' ? 'All Courses' : getCategoryLabel(filter);
              const active = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.chip, { backgroundColor: t.SURFACE, borderColor: t.OUTLINE + '60' }, active && { backgroundColor: t.PRIMARY, borderColor: t.PRIMARY }]}
                  onPress={() => setActiveFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, { color: t.TEXT2 }, active && { color: '#fff' }]}>{displayLabel}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </FadeInSmall>

        {/* Course Cards */}
        <View style={styles.grid}>
          {filteredCourses.map((course, index) => {
            const accent = course.category ? (CAT_COLORS[course.category] || t.PRIMARY) : t.PRIMARY;
            const categoryLabel = course.category ? getCategoryLabel(course.category) : 'Course';
            const gradColor1 = course.grad_color_1 || t.PRIMARY;
            const gradColor2 = course.grad_color_2 || '#003399';
            return (
              <FadeInSmall key={course.id} delay={170 + index * 40}>
                <TouchableOpacity style={[styles.courseCard, { backgroundColor: t.SURFACE, borderColor: t.SURF_LOW }]} activeOpacity={0.92}>
                  {course.is_special ? (
                    <LinearGradient colors={[gradColor1, gradColor2]} style={styles.courseImg}>
                      <View style={styles.specialOverlay}>
                        <Ionicons name={(course.icon_name || 'cube-outline') as any} size={40} color="#fff" />
                        <Text style={styles.specialTitle}>{course.title}</Text>
                      </View>
                      <View style={[styles.catBadge, { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }]}>
                        <Text style={[styles.catBadgeText, { color: '#fff' }]}>{categoryLabel.toUpperCase()}</Text>
                      </View>
                    </LinearGradient>
                  ) : (
                    <LinearGradient colors={[gradColor1, gradColor2]} style={styles.courseImg}>
                      <Ionicons name={(course.icon_name || 'cube-outline') as any} size={48} color={accent + '40'} />
                      <View style={[styles.catBadge, { backgroundColor: accent + 'E6' }]}>
                        <Text style={[styles.catBadgeText, { color: '#fff' }]}>{categoryLabel.toUpperCase()}</Text>
                      </View>
                    </LinearGradient>
                  )}
                  <View style={styles.courseBody}>
                    <Text style={[styles.courseTitle, { color: t.ON_SURFACE }]}>{course.title}</Text>
                    <Text style={[styles.courseDesc, { color: t.TEXT2 }]} numberOfLines={2}>{course.description}</Text>
                    <View style={styles.courseMeta}>
                      <View style={styles.metaGroup}>
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={14} color={t.TEXT2} />
                          <Text style={[styles.metaText, { color: t.TEXT2 }]}>{course.duration || 'Self-paced'}</Text>
                        </View>
                        {course.students_count ? (
                          <View style={styles.metaItem}>
                            <Ionicons name="people-outline" size={14} color={t.TEXT2} />
                            <Text style={[styles.metaText, { color: t.TEXT2 }]}>{course.students_count}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={[styles.coursePrice, { color: t.PRIMARY }]}>₹{course.price.toLocaleString()}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </FadeInSmall>
            );
          })}
        </View>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <FadeInSmall delay={450}>
            <View style={styles.testimonialsSection}>
              <Text style={[styles.sectionTitle, { color: t.ON_SURFACE }]}>What Students Say</Text>
              <Text style={[styles.sectionSub, { color: t.TEXT2 }]}>Success stories from our learners</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.testimonialRow}>
                {testimonials.map((testimonial, idx) => (
                  <FadeInSmall key={testimonial.id} delay={480 + idx * 40}>
                    <View style={[styles.testimonialCard, { backgroundColor: t.SURFACE, borderColor: t.OUTLINE + '30' }]}>
                      <View style={styles.testimonialHeader}>
                        <View style={[styles.testimonialAvatar, { backgroundColor: t.PRIMARY + '18' }]}>
                          {testimonial.avatar_url ? (
                            <Image source={{ uri: testimonial.avatar_url }} style={styles.testimonialAvatarImage} />
                          ) : (
                            <Ionicons name="person" size={20} color={t.PRIMARY} />
                          )}
                        </View>
                        <View>
                          <Text style={[styles.testimonialName, { color: t.ON_SURFACE }]}>{testimonial.name}</Text>
                          <Text style={[styles.testimonialRole, { color: t.TEXT2 }]}>{testimonial.role || 'Student'}</Text>
                        </View>
                      </View>
                      <Text style={[styles.testimonialText, { color: t.TEXT2 }]} numberOfLines={3}>{testimonial.text}</Text>
                      <View style={styles.starsRow}>
                        {Array.from({ length: testimonial.rating }, (_, i) => (
                          <Ionicons key={i} name="star" size={14} color="#F59E0B" />
                        ))}
                      </View>
                    </View>
                  </FadeInSmall>
                ))}
              </ScrollView>
            </View>
          </FadeInSmall>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 20 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  headerButton: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  brand: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  titleSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: '700' },
  pageSub: { fontSize: 13, marginTop: 4 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 14,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 13, fontWeight: '600' },
  filterRow: { paddingHorizontal: 20, gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
  grid: { paddingHorizontal: 20, gap: 16 },
  courseCard: {
    borderRadius: 16, overflow: 'hidden', borderWidth: 1,
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 3,
  },
  courseImg: { height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  catBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  catBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  specialOverlay: { alignItems: 'center', gap: 8 },
  specialTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  courseBody: { padding: 18 },
  courseTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  courseDesc: { fontSize: 13, lineHeight: 19 },
  courseMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  metaGroup: { flexDirection: 'row', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '600' },
  coursePrice: { fontSize: 18, fontWeight: '700' },
  testimonialsSection: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionSub: { fontSize: 13, marginTop: 2, marginBottom: 14 },
  testimonialRow: { gap: 12, paddingRight: 20 },
  testimonialCard: { width: 260, borderRadius: 16, padding: 16, borderWidth: 1 },
  testimonialHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  testimonialAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  testimonialAvatarImage: { width: 36, height: 36, borderRadius: 18 },
  testimonialName: { fontSize: 13, fontWeight: '700' },
  testimonialRole: { fontSize: 11 },
  testimonialText: { fontSize: 12, lineHeight: 18, marginBottom: 8 },
  starsRow: { flexDirection: 'row', gap: 2 },
});


