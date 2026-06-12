import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
import { useServices, useTestimonials } from '../lib/useData';
import type { Service, ServiceCategory } from '../lib/types';
import { SERVICE_CATEGORY_LABELS } from '../lib/types';

/* ── Theme ──────────────────────────────────────── */
const PRIMARY    = '#004CD2';
const BG         = '#F7F9FB';
const SURFACE    = '#FFFFFF';
const ON_SURFACE = '#191C1E';
const TEXT2      = '#424656';
const OUTLINE    = '#C3C5D8';
const SURF_LOW   = '#F2F4F6';
const TER_CONT   = '#627289';

const CAT_COLORS: Record<ServiceCategory, string> = {
  web_static: PRIMARY,
  web_dynamic: '#627289',
  web_fullstack: '#38485D',
  web_ecommerce: '#1B63FF',
  mobile_app: '#4A5A6F',
  java_proxy: '#1B63FF',
  courses: '#565E74',
  ui_ux: '#565E74',
};

const FILTERS = ['All Services', 'Web Static', 'Web Dynamic', 'Full Stack', 'E-Commerce', 'Mobile App', 'Java Proxy', 'Courses', 'UI/UX'];

interface Props {
  onServiceSelect: (service: Service) => void;
}

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

export default function ServicesScreen({ onServiceSelect }: Props) {
  const [activeFilter, setActiveFilter] = useState('All Services');
  const { data: services } = useServices();
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
            <Text style={styles.pageTitle}>Our Services</Text>
          </FadeInSmall>
          <FadeInSmall delay={80}>
            <Text style={styles.pageSub}>Tailored digital solutions for visionary teams.</Text>
          </FadeInSmall>
        </View>

        {/* ── Search ── */}
        <FadeInSmall delay={110}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color={OUTLINE} style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>Search services...</Text>
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

        {/* ── Service Cards Grid ── */}
        <View style={styles.grid}>
          {services.map((svc, index) => {
            const accent = CAT_COLORS[svc.category];
            const categoryLabel = SERVICE_CATEGORY_LABELS[svc.category];
            
            return (
              <FadeInSmall key={svc.id} delay={170 + index * 40}>
                <TouchableOpacity 
                  style={styles.serviceCard} 
                  activeOpacity={0.92}
                  onPress={() => onServiceSelect(svc)}
                >
                  {/* Image / Hero area */}
                  {svc.is_special ? (
                    <LinearGradient colors={['#1B63FF', PRIMARY]} style={styles.cardImg}>
                      <View style={styles.specialOverlay}>
                        <Ionicons name={(svc.icon_name || 'cube-outline') as any} size={40} color="#fff" />
                        <Text style={styles.specialTitle}>{svc.title}</Text>
                      </View>
                      <View style={[styles.catBadge, { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }]}>
                        <Text style={[styles.catBadgeText, { color: '#fff' }]}>{categoryLabel.toUpperCase()}</Text>
                      </View>
                    </LinearGradient>
                  ) : svc.image_url ? (
                    <View style={styles.cardImgWrap}>
                      <Image
                        source={{ uri: svc.image_url }}
                        style={styles.cardImg}
                        resizeMode="cover"
                      />
                      <View style={styles.imgOverlay} />
                      <View style={[styles.catBadge, { backgroundColor: accent + 'E6' }]}>
                        <Text style={styles.catBadgeText}>{categoryLabel.toUpperCase()}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.cardImg, { backgroundColor: accent + '18', alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name={(svc.icon_name || 'cube-outline') as any} size={48} color={accent} />
                      <View style={[styles.catBadge, { backgroundColor: accent + 'E6' }]}>
                        <Text style={styles.catBadgeText}>{categoryLabel.toUpperCase()}</Text>
                      </View>
                    </View>
                  )}

                  {/* Content */}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{svc.title}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{svc.description}</Text>
                    <View style={styles.cardMeta}>
                      <View style={styles.metaGroup}>
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={14} color={TEXT2} />
                          <Text style={styles.metaText}>{svc.duration || 'Custom'}</Text>
                        </View>
                      </View>
                      <View style={styles.priceWrap}>
                        <Text style={styles.cardPrice}>₹{svc.price_start.toLocaleString()}</Text>
                        <Text style={styles.priceSuffix}>onwards</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </FadeInSmall>
            );
          })}
        </View>

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
  titleSection: { paddingHorizontal: 20, paddingTop: 70, paddingBottom: 14 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: ON_SURFACE },
  pageSub: { fontSize: 13, color: TEXT2, marginTop: 4 },

  /* Search */
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: SURF_LOW,
    borderRadius: 14, marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 14,
  },
  searchIcon: { marginRight: 8 },
  searchPlaceholder: { paddingVertical: 13, color: OUTLINE, fontSize: 13, fontWeight: '600' },

  /* Filters */
  filterRow: { paddingHorizontal: 20, gap: 8, marginBottom: 18 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: OUTLINE + '60',
  },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipText: { fontSize: 12, color: TEXT2, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  /* Service Cards Grid */
  grid: { paddingHorizontal: 20, gap: 16 },
  serviceCard: {
    backgroundColor: SURFACE, borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: SURF_LOW,
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 3,
  },
  cardImgWrap: {
    height: 160, overflow: 'hidden', position: 'relative',
  },
  cardImg: {
    height: 160, width: '100%',
  },
  imgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  catBadge: {
    position: 'absolute', top: 12, left: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  catBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: '#fff' },
  specialOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  specialTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },

  cardBody: { padding: 18 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: ON_SURFACE, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: TEXT2, lineHeight: 19 },
  cardMeta: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16,
  },
  metaGroup: { flexDirection: 'row', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: TEXT2, fontWeight: '600' },
  priceWrap: { alignItems: 'flex-end' },
  cardPrice: { fontSize: 18, fontWeight: '700', color: PRIMARY },
  priceSuffix: { fontSize: 10, color: TEXT2, fontWeight: '600', marginTop: 1 },

  /* Section Card */
  sectionCard: {
    backgroundColor: SURFACE, borderRadius: 18, padding: 20,
    marginHorizontal: 20, marginBottom: 14, marginTop: 4,
    shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  sectionIconWrap: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PRIMARY + '18', marginBottom: 12,
  },
  sectionCardTitle: { fontSize: 20, fontWeight: '700', color: ON_SURFACE },
  sectionCardSub: { fontSize: 13, color: TEXT2, marginTop: 3 },

  /* Mobile Apps */
  mobileAppItem: { backgroundColor: SURF_LOW, borderRadius: 12, padding: 14 },
  mobileAppTitle: { fontSize: 13, fontWeight: '700', color: ON_SURFACE },
  mobileAppDesc: { fontSize: 11, color: TEXT2, marginTop: 3 },
  darkBtn: {
    marginTop: 18, backgroundColor: ON_SURFACE, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  darkBtnText: { color: SURFACE, fontWeight: '600', fontSize: 14 },

  /* Proxy */
  proxyCard: {
    marginHorizontal: 20, marginBottom: 14, borderRadius: 18, padding: 22, overflow: 'hidden',
  },
  proxyBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginBottom: 10,
  },
  proxyBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  proxyTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
  proxySub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 19, marginBottom: 18 },
  proxyFeature: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  proxyFeatureText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  proxyBtn: {
    alignSelf: 'flex-start', backgroundColor: '#fff',
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12,
  },
  proxyBtnText: { color: TER_CONT, fontWeight: '700', fontSize: 13 },

  /* Courses Preview */
  tagsRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  tag: { backgroundColor: '#E0E3E5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, fontWeight: '700', color: TEXT2 },
});
