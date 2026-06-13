import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useServices } from '../lib/useData';
import type { Service, ServiceCategory } from '../lib/types';
import { SERVICE_CATEGORY_LABELS } from '../lib/types';
import { useTheme } from '../lib/ThemeContext';

const CAT_COLORS: Record<ServiceCategory, string> = {
  web_static: '#004CD2',
  web_dynamic: '#627289',
  web_fullstack: '#38485D',
  web_ecommerce: '#1B63FF',
  mobile_app: '#4A5A6F',
  java_proxy: '#1B63FF',
  courses: '#565E74',
  ui_ux: '#565E74',
};

interface Props {
  onServiceSelect: (service: Service) => void;
}

function FadeInUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  React.useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
      translateY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) });
    }, delay);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default function ServicesScreen({ onServiceSelect }: Props) {
  const [activeFilter, setActiveFilter] = useState('All Services');
  const [search, setSearch] = useState('');
  const { data: services } = useServices();
  const { theme: t } = useTheme();

  // Extract unique categories from services (filter out any undefined/null)
  const uniqueCategories = Array.from(
    new Set(
      services
        .map(service => service.category)
        .filter((cat): cat is ServiceCategory => cat != null)
    )
  );
  // Create filters: "All Services" + unique categories
  const filters = ['All Services', ...uniqueCategories];

  // Helper to get category label with fallback
  const getCategoryLabel = (category: ServiceCategory | undefined | null): string => {
    if (!category) return 'Other';
    return SERVICE_CATEGORY_LABELS[category] || category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filter services based on active filter and search
  const filteredServices = services.filter(service => {
    const matchesFilter = activeFilter === 'All Services' || service.category === activeFilter;
    const matchesSearch = search === '' || 
      service.title.toLowerCase().includes(search.toLowerCase()) ||
      service.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: t.BG }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* ── Title Section ── */}
        <View style={styles.titleSection}>
          <FadeInUp delay={50}>
            <Text style={[styles.pageTitle, { color: t.ON_SURFACE }]}>Our Services</Text>
          </FadeInUp>
          <FadeInUp delay={80}>
            <Text style={[styles.pageSub, { color: t.TEXT2 }]}>Tailored digital solutions for visionary teams.</Text>
          </FadeInUp>
        </View>

        {/* ── Search ── */}
        <FadeInUp delay={110}>
          <View style={[styles.searchWrap, { backgroundColor: t.SURF_LOW }]}>
            <Ionicons name="search-outline" size={18} color={t.OUTLINE} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: t.ON_SURFACE }]}
              placeholder="Search services..."
              placeholderTextColor={t.OUTLINE}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </FadeInUp>

        {/* ── Filter Chips ── */}
        <FadeInUp delay={140}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {filters.map((filter) => {
              const displayLabel = filter === 'All Services' ? 'All Services' : getCategoryLabel(filter as ServiceCategory);
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
        </FadeInUp>

        {/* ── Service Cards Grid ── */}
        <View style={styles.grid}>
          {filteredServices.map((svc, index) => {
            const accent = CAT_COLORS[svc.category] || t.PRIMARY;
            const categoryLabel = getCategoryLabel(svc.category);
            return (
              <FadeInUp key={svc.id} delay={170 + index * 40}>
                <TouchableOpacity
                  style={[styles.serviceCard, { backgroundColor: t.SURFACE, borderColor: t.SURF_LOW }]}
                  activeOpacity={0.92}
                  onPress={() => onServiceSelect(svc)}
                >
                  {svc.is_special ? (
                    <LinearGradient colors={['#1B63FF', t.PRIMARY]} style={styles.cardImg}>
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
                      <Image source={{ uri: svc.image_url }} style={styles.cardImg} resizeMode="cover" />
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
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: t.ON_SURFACE }]}>{svc.title}</Text>
                    <Text style={[styles.cardDesc, { color: t.TEXT2 }]} numberOfLines={2}>{svc.description}</Text>
                    <View style={styles.cardMeta}>
                      <View style={styles.metaGroup}>
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={14} color={t.TEXT2} />
                          <Text style={[styles.metaText, { color: t.TEXT2 }]}>{svc.duration || 'Custom'}</Text>
                        </View>
                      </View>
                      <View style={styles.priceWrap}>
                        <Text style={[styles.cardPrice, { color: t.PRIMARY }]}>₹{svc.price_start.toLocaleString()}</Text>
                        <Text style={[styles.priceSuffix, { color: t.TEXT2 }]}>onwards</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </FadeInUp>
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
  container: { flex: 1 },
  content: { paddingBottom: 20 },

  /* Title */
  titleSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14 },
  pageTitle: { fontSize: 24, fontWeight: '700' },
  pageSub: { fontSize: 13, marginTop: 4 },

  /* Search */
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 14,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { paddingVertical: 13, fontSize: 13, fontWeight: '600', flex: 1 },

  /* Filters */
  filterRow: { paddingHorizontal: 20, gap: 8, marginBottom: 18 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },

  /* Service Cards */
  grid: { paddingHorizontal: 20, gap: 16 },
  serviceCard: {
    borderRadius: 18, overflow: 'hidden', borderWidth: 1,
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 3,
  },
  cardImgWrap: { height: 160, overflow: 'hidden', position: 'relative' },
  cardImg: { height: 160, width: '100%' },
  imgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.06)' },
  catBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  catBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: '#fff' },
  specialOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  specialTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardBody: { padding: 18 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  cardDesc: { fontSize: 13, lineHeight: 19 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 },
  metaGroup: { flexDirection: 'row', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '600' },
  priceWrap: { alignItems: 'flex-end' },
  cardPrice: { fontSize: 18, fontWeight: '700' },
  priceSuffix: { fontSize: 10, fontWeight: '600', marginTop: 1 },
});
