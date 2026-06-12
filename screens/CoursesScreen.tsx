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
import type { Course, CourseCategory } from '../lib/types';
import { COURSE_CATEGORY_LABELS } from '../lib/types';

/* ── Theme ──────────────────────────────────────── */
const PRIMARY    = '#004CD2';
const BG         = '#F7F9FB';
const SURFACE    = '#FFFFFF';
const ON_SURFACE = '#191C1E';
const TEXT2      = '#424656';
const OUTLINE    = '#C3C5D8';
const SURF_LOW   = '#F2F4F6';
const TER_CONT   = '#627289';

const CAT_COLORS: Record<string, string> = {
  ui_ux: PRIMARY,
  web_dev: TER_CONT,
  mobile_app: '#38485D',
  specialized: '#fff',
};

const FILTERS = ['All Courses', 'UI/UX Design', 'Web Dev', 'Mobile App', 'Specialized'];

function FadeInSmall({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);

  React.useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.quad),
      });
      translateY.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.quad),
      });
    }, delay);
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export default function CoursesScreen() {
  const [activeFilter, setActiveFilter] = useState('All Courses');
  const [search, setSearch] = useState('');
  const { data: courses } = useCourses();
  const { data: testimonials } = useTestimonials();

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <FadeInSmall delay={0}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.brand}>Visionary Agency</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity activeOpacity={0.7} style={styles.headerButton}>
              <Ionicons name="search-outline" size={22} color={PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={22} color={PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>
      </FadeInSmall>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* ── Title Section ── */}
        <View style={styles.titleSection}>
          <FadeInSmall delay={50}>
            <Text style={styles.pageTitle}>Master Your Craft</Text>
          </FadeInSmall>
          <FadeInSmall delay={80}>
            <Text style={styles.pageSub}>Expert-led courses for digital visionary leaders.</Text>
          </FadeInSmall>
        </View>

      {/* ── Search ── */}
      <FadeInSmall delay={110}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={OUTLINE} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor={OUTLINE}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </FadeInSmall>

      {/* ── Filter Chips ── */}
      <FadeInSmall delay={140}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f, i) => {
            const active = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </FadeInSmall>

      {/* ── Course Cards ── */}
      <View style={styles.grid}>
        {courses.map((course, index) => {
          const accent = course.category ? CAT_COLORS[course.category] : PRIMARY;
          const categoryLabel = course.category || 'Course';
          const gradColor1 = course.grad_color_1 || PRIMARY;
          const gradColor2 = course.grad_color_2 || '#003399';
          
          return (
            <FadeInSmall key={course.id} delay={170 + index * 40}>
              <TouchableOpacity style={styles.courseCard} activeOpacity={0.92}>
                {/* Image area */}
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

                {/* Content */}
                <View style={styles.courseBody}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>
                  <View style={styles.courseMeta}>
                    <View style={styles.metaGroup}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={TEXT2} />
                        <Text style={styles.metaText}>{course.duration || 'Self-paced'}</Text>
                      </View>
                      {course.students_count ? (
                        <View style={styles.metaItem}>
                          <Ionicons name="people-outline" size={14} color={TEXT2} />
                          <Text style={styles.metaText}>{course.students_count}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.coursePrice}>₹{course.price.toLocaleString()}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </FadeInSmall>
          );
        })}
      </View>

      {/* ── Testimonials ── */}
      {testimonials.length > 0 && (
        <FadeInSmall delay={450}>
          <View style={styles.testimonialsSection}>
            <Text style={styles.sectionTitle}>What Students Say</Text>
            <Text style={styles.sectionSub}>Success stories from our learners</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.testimonialRow}>
              {testimonials.map((testimonial, idx) => (
                <FadeInSmall key={testimonial.id} delay={480 + idx * 40}>
                  <View style={styles.testimonialCard}>
                    <View style={styles.testimonialHeader}>
                      <View style={styles.testimonialAvatar}>
                        {testimonial.avatar_url ? (
                          <Image
                            source={{ uri: testimonial.avatar_url }}
                            style={styles.testimonialAvatarImage}
                          />
                        ) : (
                          <Ionicons name="person" size={20} color={PRIMARY} />
                        )}
                      </View>
                      <View>
                        <Text style={styles.testimonialName}>{testimonial.name}</Text>
                        <Text style={styles.testimonialRole}>{testimonial.role || 'Student'}</Text>
                      </View>
                    </View>
                    <Text style={styles.testimonialText} numberOfLines={3}>{testimonial.text}</Text>
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

/* ── Styles ──────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { paddingBottom: 20 },

  /* Header */
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    width: 44, height: 44,
    borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  brand: { fontSize: 18, fontWeight: '800', color: PRIMARY, letterSpacing: -0.5 },

  /* Title */
  titleSection: { paddingHorizontal: 20, paddingTop: 70, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: ON_SURFACE },
  pageSub: { fontSize: 13, color: TEXT2, marginTop: 4 },

  /* Search */
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: SURF_LOW,
    borderRadius: 12, marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 14,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 13, color: ON_SURFACE, fontSize: 13, fontWeight: '600' },

  /* Filters */
  filterRow: { paddingHorizontal: 20, gap: 8, marginBottom: 20 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: OUTLINE + '60',
  },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipText: { fontSize: 12, color: TEXT2, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  /* Course Grid */
  grid: { paddingHorizontal: 20, gap: 16 },
  courseCard: {
    backgroundColor: SURFACE, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: SURF_LOW,
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 3,
  },
  courseImg: {
    height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  catBadge: {
    position: 'absolute', top: 12, left: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  catBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  specialOverlay: { alignItems: 'center', gap: 8 },
  specialTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },

  courseBody: { padding: 18 },
  courseTitle: { fontSize: 16, fontWeight: '700', color: ON_SURFACE, marginBottom: 6 },
  courseDesc: { fontSize: 13, color: TEXT2, lineHeight: 19 },
  courseMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  metaGroup: { flexDirection: 'row', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: TEXT2, fontWeight: '600' },
  coursePrice: { fontSize: 18, fontWeight: '700', color: PRIMARY },

  /* Testimonials */
  testimonialsSection: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: ON_SURFACE },
  sectionSub: { fontSize: 13, color: TEXT2, marginTop: 2, marginBottom: 14 },
  testimonialRow: { gap: 12, paddingRight: 20 },
  testimonialCard: {
    width: 260, backgroundColor: SURFACE, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: OUTLINE + '30',
  },
  testimonialHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  testimonialAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: PRIMARY + '18',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  testimonialAvatarImage: {
    width: 36, height: 36, borderRadius: 18,
  },
  testimonialName: { fontSize: 13, fontWeight: '700', color: ON_SURFACE },
  testimonialRole: { fontSize: 11, color: TEXT2 },
  testimonialText: { fontSize: 12, color: TEXT2, lineHeight: 18, marginBottom: 8 },
  starsRow: { flexDirection: 'row', gap: 2 },
});
