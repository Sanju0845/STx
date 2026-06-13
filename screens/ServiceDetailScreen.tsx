import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { Service, ServiceCategory } from '../lib/types';
import { SERVICE_CATEGORY_LABELS } from '../lib/types';
import { useTheme } from '../lib/ThemeContext';

const CAT_COLORS: Record<ServiceCategory, string> = {
  web_static:    '#004CD2',
  web_dynamic:   '#627289',
  web_fullstack: '#38485D',
  web_ecommerce: '#1B63FF',
  mobile_app:    '#4A5A6F',
  java_proxy:    '#1B63FF',
  courses:       '#565E74',
  ui_ux:         '#565E74',
};

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

interface Props {
  service: Service;
  onBack: () => void;
}

export default function ServiceDetailScreen({ service, onBack }: Props) {
  const { theme: t } = useTheme();
  const accent = CAT_COLORS[service.category] || t.PRIMARY;
  const categoryLabel = SERVICE_CATEGORY_LABELS[service.category];

  return (
    <View style={[styles.container, { backgroundColor: t.BG }]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <FadeInUp delay={30}>
          <View style={[styles.hero, { paddingTop: 40 }]}>
            {service.is_special ? (
              <LinearGradient colors={['#1B63FF', t.PRIMARY]} style={styles.heroGradient}>
                <Ionicons name={(service.icon_name || 'cube-outline') as any} size={56} color="#fff" />
              </LinearGradient>
            ) : (
              <View style={[styles.heroGradient, { backgroundColor: accent + '18' }]}>
                <Ionicons name={(service.icon_name || 'cube-outline') as any} size={56} color={accent} />
              </View>
            )}
            <View style={[styles.categoryBadge, { backgroundColor: t.PRIMARY + '18' }]}>
              <Text style={[styles.categoryText, { color: t.PRIMARY }]}>{categoryLabel}</Text>
            </View>
            <Text style={[styles.title, { color: t.ON_SURFACE }]}>{service.title}</Text>
            <Text style={[styles.description, { color: t.TEXT2 }]}>{service.description}</Text>
          </View>
        </FadeInUp>

        {/* Price & Duration */}
        <FadeInUp delay={100}>
          <View style={styles.metaRow}>
            <View style={[styles.metaCard, { backgroundColor: t.SURFACE, borderColor: t.OUTLINE + '30' }]}>
              <Ionicons name="time-outline" size={20} color={accent} />
              <View>
                <Text style={[styles.metaLabel, { color: t.TEXT2 }]}>Duration</Text>
                <Text style={[styles.metaValue, { color: t.ON_SURFACE }]}>{service.duration || 'Custom'}</Text>
              </View>
            </View>
            <View style={[styles.metaCard, { backgroundColor: t.SURFACE, borderColor: t.OUTLINE + '30' }]}>
              <Ionicons name="pricetag-outline" size={20} color={accent} />
              <View>
                <Text style={[styles.metaLabel, { color: t.TEXT2 }]}>Price Range</Text>
                <Text style={[styles.metaValue, { color: t.ON_SURFACE }]}>₹{service.price_start.toLocaleString()} – ₹{service.price_end.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </FadeInUp>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <FadeInUp delay={170}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: t.ON_SURFACE }]}>What's Included</Text>
              <View style={styles.featuresList}>
                {service.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <View style={[styles.checkIcon, { backgroundColor: accent + '18' }]}>
                      <Ionicons name="checkmark" size={16} color={accent} />
                    </View>
                    <Text style={[styles.featureText, { color: t.ON_SURFACE }]}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </FadeInUp>
        )}

        {/* Tech Stack */}
        {service.tech_stack && service.tech_stack.length > 0 && (
          <FadeInUp delay={240}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: t.ON_SURFACE }]}>Tech Stack</Text>
              <View style={styles.techRow}>
                {service.tech_stack.map((tech, idx) => (
                  <View key={idx} style={[styles.techTag, { backgroundColor: accent + '18' }]}>
                    <Text style={[styles.techText, { color: accent }]}>{tech}</Text>
                  </View>
                ))}
              </View>
            </View>
          </FadeInUp>
        )}

        {/* CTA */}
        <FadeInUp delay={310}>
          <View style={styles.ctaSection}>
            <TouchableOpacity activeOpacity={0.8}>
              <LinearGradient
                colors={service.is_special ? ['#1B63FF', t.PRIMARY] : [t.PRIMARY, '#1B63FF']}
                style={styles.ctaBtn}
              >
                <Text style={styles.ctaText}>Inquire Now</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </FadeInUp>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  headerTitle: {
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
  hero: { paddingHorizontal: 20, paddingTop: 70, paddingBottom: 20 },
  heroGradient: {
    width: '100%', height: 180, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 10,
  },
  categoryText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 34 },
  description: { fontSize: 14, marginTop: 8, lineHeight: 21 },
  metaRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  metaCard: {
    flex: 1, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1,
  },
  metaLabel: { fontSize: 11, fontWeight: '600' },
  metaValue: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  featuresList: { gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkIcon: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 13, fontWeight: '500' },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  techTag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  techText: { fontSize: 12, fontWeight: '700' },
  ctaSection: { paddingHorizontal: 20, marginTop: 8 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 16,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
