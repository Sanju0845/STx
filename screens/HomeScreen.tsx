import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabKey } from '../lib/types';
import { useServices, useRecentWorks, useTestimonials, useAppSettings } from '../lib/useData';
import { useTheme } from '../lib/ThemeContext';

const CAT_COLORS: Record<string, string> = {
  web_static:    '#004CD2',
  web_dynamic:   '#627289',
  web_fullstack: '#38485D',
  web_ecommerce: '#1B63FF',
  mobile_app:    '#4A5A6F',
  java_proxy:    '#1B63FF',
  ui_ux:         '#565E74',
  courses:       '#565E74',
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

interface Props {
  onNavigate: (tab: TabKey) => void;
}

export default function HomeScreen({ onNavigate }: Props) {
  const { theme: t } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: services } = useServices();
  const { data: recentWorks } = useRecentWorks();
  const { data: testimonials } = useTestimonials();
  const { settings } = useAppSettings();
  const carouselRef = useRef<FlatList>(null);

  const handleViewPortfolio = async () => {
    try {
      const supported = await Linking.canOpenURL('https://mystx.space');
      if (supported) {
        await Linking.openURL('https://mystx.space');
      } else {
        console.log("Can't open URL: https://mystx.space");
      }
    } catch (error) {
      console.error('Error opening portfolio URL:', error);
    }
  };

  const expertiseItems = services.slice(0, 4);

  const fallbackExpertise = [
    { id: '1', icon_name: 'globe-outline',          title: 'Websites',         description: 'High-performance, accessible web architectures.', category: 'web_static' },
    { id: '2', icon_name: 'phone-portrait-outline',  title: 'Apps',             description: 'Native and cross-platform mobile experiences.',   category: 'mobile_app' },
    { id: '3', icon_name: 'school-outline',          title: 'Courses',          description: 'Learn the method. Mastering design.',             category: 'courses' },
    { id: '4', icon_name: 'mic-outline',             title: 'Proxy Interviews', description: 'Expert technical representation globally.',       category: 'java_proxy' },
  ];

  const fallbackProjects = [
    { id: '1', category: 'UI/UX Design',      title: 'Lumina Health',  color_hex: '#7C3AED' },
    { id: '2', category: 'Web Development',   title: 'Etheric Labs',   color_hex: '#06B6D4' },
    { id: '3', category: 'Product Strategy',  title: 'Synthetix AI',   color_hex: '#F59E0B' },
  ];

  const fallbackTestimonials = [
    { id: '1', name: 'Arjun Mehta',  role: 'CTO, Lumina Health',    text: 'Exceptional delivery. The team transformed our vision into a polished product.',    rating: 5, avatar_url: null },
    { id: '2', name: 'Priya Sharma', role: 'Founder, Etheric Labs',  text: 'Their full-stack expertise is unmatched. Our platform handles 10x the traffic.',    rating: 5, avatar_url: null },
    { id: '3', name: 'Rahul Verma',  role: 'PM, Synthetix AI',      text: 'From strategy to launch, every milestone was hit on time. A visionary team.',       rating: 5, avatar_url: null },
  ];

  const expertItems = expertiseItems.length > 0 ? expertiseItems : fallbackExpertise;
  const projects    = recentWorks.length > 0    ? recentWorks    : fallbackProjects;
  const reviews     = testimonials.length > 0   ? testimonials   : fallbackTestimonials;

  return (
    <View style={[styles.container, { backgroundColor: t.BG }]}>
      {/* Hero with Logo */}
      <View style={StyleSheet.absoluteFillObject}>
        {/* Logo Image with Overlay */}
        <View style={styles.logoContainer}>
          {settings.brand_logo_url ? (
            <Image 
              source={{ uri: settings.brand_logo_url }} 
              style={[
                styles.logoImage, 
                { 
                  width: 300,
                  height: 150,
                }
              ]} 
              resizeMode="contain" 
            />
          ) : (
            <Image 
              source={require('../assets/stX.png')} 
              style={[
                styles.logoImage, 
                { 
                  tintColor: t.isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
                  width: 300,
                  height: 150,
                }
              ]} 
              resizeMode="contain" 
            />
          )}
        </View>

        {/* Hero Content (moved down) */}
        <View style={{ paddingTop: 140 + (insets.top > 0 ? insets.top : 0), flex: 1 }}>
          <View style={styles.hero}>
            <FadeInSmall delay={30}>
              <View style={[styles.badge, { backgroundColor: t.SEC_CONT }]}>
                <Ionicons name="sparkles" size={14} color={t.TEXT2} />
                <Text style={[styles.badgeText, { color: t.TEXT2 }]}>The Future of Digital Strategy</Text>
              </View>
            </FadeInSmall>
            <FadeInSmall delay={60}>
              <Text style={[styles.heroTitle, { color: t.ON_SURFACE }]}>
                Transforming Ideas into{' '}
                <Text style={{ color: t.PRIMARY, fontStyle: 'italic' }}>Digital Reality</Text>
              </Text>
            </FadeInSmall>
            <FadeInSmall delay={110}>
              <Text style={[styles.heroSub, { color: t.TEXT2 }]}>
                We craft bespoke digital experiences that bridge the gap between human ambition and technological capability.
              </Text>
            </FadeInSmall>
            <FadeInSmall delay={160}>
              <View style={styles.heroBtns}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => onNavigate('Services')}>
                  <LinearGradient colors={[t.PRIMARY, '#1B63FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroBtnPrimary}>
                    <Text style={styles.heroBtnPrimaryText}>Book Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.heroBtnSecondary, { backgroundColor: t.SURF_LOW, borderColor: t.PRIMARY + '18' }]} 
                  activeOpacity={0.7}
                  onPress={handleViewPortfolio}
                >
                  <Text style={[styles.heroBtnSecText, { color: t.PRIMARY }]}>View Portfolio</Text>
                </TouchableOpacity>
              </View>
            </FadeInSmall>
          </View>
        </View>
      </View>

      {/* Content Sheet */}
      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
        <View style={{ height: 420 }} />

        <View style={[styles.sheetPanel, { backgroundColor: t.BG, borderTopColor: t.isDark ? '#2E3244' : '#E0E4E7' }]}>
          <View style={styles.dragHandleWrap}>
            <View style={[styles.dragHandle, { backgroundColor: t.isDark ? '#3A3D50' : '#8A8D9B' }]} />
          </View>

          {/* Our Expertise */}
          <FadeInSmall delay={200}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={[styles.sectionTitle, { color: t.ON_SURFACE }]}>Our Expertise</Text>
                  <Text style={[styles.sectionSub, { color: t.TEXT2 }]}>Precision digital solutions</Text>
                </View>
                <TouchableOpacity onPress={() => onNavigate('Services')}>
                  <Text style={[styles.seeAll, { color: t.PRIMARY }]}>All →</Text>
                </TouchableOpacity>
              </View>
              <FadeInSmall delay={250}>
                <View style={styles.bentoRow}>
                  <ExpertiseCard item={expertItems[0] || fallbackExpertise[0]} large t={t} />
                  <ExpertiseCard item={expertItems[1] || fallbackExpertise[1]} t={t} />
                </View>
              </FadeInSmall>
              <FadeInSmall delay={290}>
                <View style={styles.bentoRow}>
                  <ExpertiseCard item={expertItems[2] || fallbackExpertise[2]} t={t} />
                  <ExpertiseCard item={expertItems[3] || fallbackExpertise[3]} large t={t} />
                </View>
              </FadeInSmall>
            </View>
          </FadeInSmall>

          {/* Testimonials */}
          <FadeInSmall delay={340}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: t.ON_SURFACE }]}>What Clients Say</Text>
              <Text style={[styles.sectionSub, { color: t.TEXT2 }]}>Trusted by visionary teams</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.testimonialRow}>
                {reviews.map((rev, i) => (
                  <FadeInSmall key={rev.id} delay={380 + i * 50}>
                    <View style={[styles.testimonialCard, { backgroundColor: t.SURFACE, borderColor: t.OUTLINE + '30' }]}>
                      <View style={styles.testimonialHeader}>
                        <View style={[styles.testimonialAvatar, { backgroundColor: t.PRIMARY + '18' }]}>
                          {rev.avatar_url ? (
                            <Image source={{ uri: rev.avatar_url }} style={styles.testimonialAvatarImage} />
                          ) : (
                            <Ionicons name="person" size={20} color={t.PRIMARY} />
                          )}
                        </View>
                        <View>
                          <Text style={[styles.testimonialName, { color: t.ON_SURFACE }]}>{rev.name}</Text>
                          <Text style={[styles.testimonialRole, { color: t.TEXT2 }]}>{rev.role || 'Client'}</Text>
                        </View>
                      </View>
                      <Text style={[styles.testimonialText, { color: t.TEXT2 }]} numberOfLines={3}>{rev.text}</Text>
                      <View style={styles.starsRow}>
                        {Array.from({ length: rev.rating }, (_, i) => (
                          <Ionicons key={i} name="star" size={14} color="#F59E0B" />
                        ))}
                      </View>
                    </View>
                  </FadeInSmall>
                ))}
              </ScrollView>
            </View>
          </FadeInSmall>

          {/* Recent Work */}
          <FadeInSmall delay={440}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={[styles.sectionTitle, { color: t.ON_SURFACE }]}>Recent Work</Text>
                  <Text style={[styles.sectionSub, { color: t.TEXT2 }]}>Creative laboratory glimpse</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity style={[styles.carouselBtn, { borderColor: t.OUTLINE }]} onPress={() => carouselRef.current?.scrollToOffset({ offset: 0, animated: true })}>
                    <Ionicons name="chevron-back" size={16} color={t.ON_SURFACE} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.carouselBtn, { borderColor: t.OUTLINE }]} onPress={() => carouselRef.current?.scrollToOffset({ offset: 600, animated: true })}>
                    <Ionicons name="chevron-forward" size={16} color={t.ON_SURFACE} />
                  </TouchableOpacity>
                </View>
              </View>

              <FlatList
                ref={carouselRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={270}
                decelerationRate="fast"
                scrollEnabled={false}
                contentContainerStyle={{ gap: 14, paddingHorizontal: 4 }}
                data={projects}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => {
                  const color = item.color_hex || t.PRIMARY;
                  return (
                    <FadeInSmall key={item.id} delay={480 + index * 50}>
                      <View style={styles.projectCard}>
                        {(item as any).image_url ? (
                          <Image source={{ uri: (item as any).image_url }} style={styles.projectImg} resizeMode="cover" />
                        ) : (
                          <LinearGradient colors={[color + '30', color + '10']} style={styles.projectImg}>
                            <Ionicons name="image-outline" size={48} color={color + '60'} />
                          </LinearGradient>
                        )}
                        <Text style={[styles.projectCat, { color: t.TEXT2 }]}>{item.category}</Text>
                        <Text style={[styles.projectTitle, { color: t.ON_SURFACE }]}>{item.title}</Text>
                      </View>
                    </FadeInSmall>
                  );
                }}
              />
            </View>
          </FadeInSmall>

          {/* Footer */}
          <FadeInSmall delay={580}>
            <View style={[styles.footer, { borderTopColor: t.OUTLINE + '20' }]}>
              <Text style={[styles.footerText, { color: t.TEXT2 }]}>© 2024 Visionary Agency</Text>
            </View>
          </FadeInSmall>

          <View style={{ height: 20 + (insets.bottom > 0 ? insets.bottom : 0) }} />
        </View>
      </ScrollView>
    </View>
  );
}

function ExpertiseCard({ item, large, t }: { item: any; large?: boolean; t: any }) {
  const accent = CAT_COLORS[item.category] || t.PRIMARY;
  return (
    <TouchableOpacity activeOpacity={0.85} style={[styles.serviceCard, { backgroundColor: t.SURFACE, borderColor: t.OUTLINE + '30' }, large && styles.serviceCardLarge]}>
      <View style={[styles.serviceIconWrap, { backgroundColor: accent + '18' }]}>
        <Ionicons name={(item.icon_name || 'cube-outline') as any} size={20} color={accent} />
      </View>
      <Text style={[styles.serviceCardTitle, { color: t.ON_SURFACE }]}>{item.title}</Text>
      <Text style={[styles.serviceCardDesc, { color: t.TEXT2 }]} numberOfLines={2}>{item.description}</Text>
      <Text style={[styles.serviceLink, { color: accent }]}>Learn more →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
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
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  brand: { fontSize: 19, fontWeight: '800', letterSpacing: -0.5 },
  hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, marginBottom: 16 },
  badgeText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  heroTitle: { fontSize: 28, fontWeight: '800', textAlign: 'center', lineHeight: 36, letterSpacing: -0.5 },
  heroSub: { fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 21, paddingHorizontal: 8 },
  heroBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  heroBtnPrimary: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  heroBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  heroBtnSecondary: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  heroBtnSecText: { fontWeight: '700', fontSize: 14 },
  sheet: { flex: 1 },
  sheetContent: { },
  sheetPanel: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8, borderTopWidth: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  dragHandleWrap: { alignItems: 'center', paddingVertical: 8 },
  dragHandle: { width: 40, height: 4, borderRadius: 2 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '700' },
  sectionSub: { fontSize: 13, marginTop: 2 },
  seeAll: { fontSize: 13, fontWeight: '600' },
  bentoRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  serviceCard: { flex: 1, borderRadius: 18, padding: 16, borderWidth: 1 },
  serviceCardLarge: { flex: 1.6 },
  serviceIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  serviceCardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  serviceCardDesc: { fontSize: 12, lineHeight: 17 },
  serviceLink: { fontSize: 11, fontWeight: '600', marginTop: 10 },
  testimonialRow: { gap: 12, marginTop: 16, paddingRight: 20 },
  testimonialCard: { width: 260, borderRadius: 18, padding: 16, borderWidth: 1 },
  testimonialHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  testimonialAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  testimonialAvatarImage: { width: 36, height: 36, borderRadius: 18 },
  testimonialName: { fontSize: 13, fontWeight: '700' },
  testimonialRole: { fontSize: 11 },
  testimonialText: { fontSize: 12, lineHeight: 18, marginBottom: 8 },
  starsRow: { flexDirection: 'row', gap: 2 },
  carouselBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  projectCard: { width: 250 },
  projectImg: { width: '100%', aspectRatio: 4 / 5, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  projectCat: { fontSize: 11, fontWeight: '600', marginTop: 10, letterSpacing: 0.3 },
  projectTitle: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  footer: { alignItems: 'center', paddingTop: 32, paddingBottom: 16, borderTopWidth: 1, marginTop: 24 },
  footerText: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5 },
});
