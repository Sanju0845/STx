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
import { FadeInUp, FadeIn } from '../components/Animations';
import type { Service, ServiceCategory } from '../lib/types';
import { SERVICE_CATEGORY_LABELS } from '../lib/types';

/* ── Theme ──────────────────────────────────────── */
const PRIMARY    = '#004CD2';
const BG         = '#F7F9FB';
const SURFACE    = '#FFFFFF';
const ON_SURFACE = '#191C1E';
const TEXT2      = '#424656';
const OUTLINE    = '#C3C5D8';

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

interface Props {
  service: Service;
  onBack: () => void;
}

export default function ServiceDetailScreen({ service, onBack }: Props) {
  const accent = CAT_COLORS[service.category] || PRIMARY;
  const categoryLabel = SERVICE_CATEGORY_LABELS[service.category];

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <FadeIn delay={0}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.headerButton, styles.backBtn]} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <Text style={styles.brand}>Visionary Agency</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>
      </FadeIn>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <FadeInUp delay={30}>
          <View style={styles.hero}>
            {service.is_special ? (
              <LinearGradient colors={['#1B63FF', PRIMARY]} style={styles.heroGradient}>
                <Ionicons name={(service.icon_name || 'cube-outline') as any} size={56} color="#fff" />
              </LinearGradient>
            ) : (
              <View style={[styles.heroGradient, { backgroundColor: accent + '18' }]}>
                <Ionicons name={(service.icon_name || 'cube-outline') as any} size={56} color={accent} />
              </View>
            )}

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{categoryLabel}</Text>
            </View>

            <Text style={styles.title}>{service.title}</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>
        </FadeInUp>

        {/* ── Price & Duration ── */}
        <FadeInUp delay={100}>
          <View style={styles.metaRow}>
            <View style={styles.metaCard}>
              <Ionicons name="time-outline" size={20} color={accent} />
              <View>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{service.duration || 'Custom'}</Text>
              </View>
            </View>
            <View style={styles.metaCard}>
              <Ionicons name="pricetag-outline" size={20} color={accent} />
              <View>
                <Text style={styles.metaLabel}>Price Range</Text>
                <Text style={styles.metaValue}>₹{service.price_start.toLocaleString()} - ₹{service.price_end.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </FadeInUp>

        {/* ── Features ── */}
        {service.features && service.features.length > 0 && (
          <FadeInUp delay={170}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What's Included</Text>
              <View style={styles.featuresList}>
                {service.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <View style={[styles.checkIcon, { backgroundColor: accent + '18' }]}>
                      <Ionicons name="checkmark" size={16} color={accent} />
                    </View>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </FadeInUp>
        )}

        {/* ── Tech Stack ── */}
        {service.tech_stack && service.tech_stack.length > 0 && (
          <FadeInUp delay={240}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tech Stack</Text>
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

        {/* ── CTA ── */}
        <FadeInUp delay={310}>
          <View style={styles.ctaSection}>
            <TouchableOpacity activeOpacity={0.8}>
              <LinearGradient colors={service.is_special ? ['#1B63FF', PRIMARY] : [PRIMARY, '#1B63FF']} style={styles.ctaBtn}>
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
  container: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },

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
  backBtn: {
  },
  brand: { fontSize: 18, fontWeight: '800', color: PRIMARY, letterSpacing: -0.5 },

  hero: { paddingHorizontal: 20, paddingTop: 70, paddingBottom: 20 },
  heroGradient: {
    width: '100%', height: 180, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start', backgroundColor: PRIMARY + '18',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    marginBottom: 10,
  },
  categoryText: { fontSize: 11, fontWeight: '800', color: PRIMARY, letterSpacing: 0.6 },
  title: { fontSize: 26, fontWeight: '800', color: ON_SURFACE, lineHeight: 34 },
  description: { fontSize: 14, color: TEXT2, marginTop: 8, lineHeight: 21 },

  metaRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  metaCard: {
    flex: 1, backgroundColor: SURFACE, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: OUTLINE + '30',
  },
  metaLabel: { fontSize: 11, color: TEXT2, fontWeight: '600' },
  metaValue: { fontSize: 13, color: ON_SURFACE, fontWeight: '700', marginTop: 2 },

  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: ON_SURFACE, marginBottom: 14 },

  featuresList: { gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkIcon: {
    width: 28, height: 28, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { fontSize: 13, color: ON_SURFACE, fontWeight: '500' },

  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  techTag: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
  },
  techText: { fontSize: 12, fontWeight: '700' },

  ctaSection: { paddingHorizontal: 20, marginTop: 8 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 16,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
