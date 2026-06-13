import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../lib/ThemeContext';
import { useAuth } from '../lib/useAuth';

function FadeInUp({ children, delay = 0, waitForLoading = false }: { children: React.ReactNode; delay?: number; waitForLoading?: boolean }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);
  const { loading } = useAuth();
  
  React.useEffect(() => {
    const startDelay = waitForLoading && loading ? 0 : delay;
    
    const timer = setTimeout(() => {
      // If waiting for loading, only animate when loading is false
      if (!waitForLoading || !loading) {
        opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
        translateY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) });
      }
    }, startDelay);

    // If loading finishes, trigger animation
    if (waitForLoading && !loading) {
      opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
      translateY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) });
    }

    return () => clearTimeout(timer);
  }, [loading, waitForLoading, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: waitForLoading && loading ? 0 : opacity.value,
    transform: [{ translateY: waitForLoading && loading ? 10 : translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

function ScaleIn({ children, delay = 0, waitForLoading = false }: { children: React.ReactNode; delay?: number; waitForLoading?: boolean }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const { loading } = useAuth();
  
  React.useEffect(() => {
    const startDelay = waitForLoading && loading ? 0 : delay;
    
    const timer = setTimeout(() => {
      if (!waitForLoading || !loading) {
        opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
        scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
      }
    }, startDelay);

    if (waitForLoading && !loading) {
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
      scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    }

    return () => clearTimeout(timer);
  }, [loading, waitForLoading, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: waitForLoading && loading ? 0 : opacity.value,
    transform: [{ scale: waitForLoading && loading ? 0.9 : scale.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

interface ProfileScreenProps {
  onSignOut?: () => void;
}

export default function ProfileScreen({ onSignOut }: ProfileScreenProps) {
  const { theme, toggleTheme } = useTheme();
  const { signOut, user, profile, loading } = useAuth();
  const t = theme;

  const MENU_ITEMS = [
    { id: '1', icon: 'calendar-outline',  title: 'My Bookings',     sub: 'Manage consultations',    accent: t.PRIMARY,    accentBg: t.PRIMARY + '18' },
    { id: '2', icon: 'stats-chart-outline', title: 'Course Progress', sub: '78% Completed',           accent: '#4A5A6F',    accentBg: t.TER_FIXED },
    { id: '3', icon: 'help-circle-outline', title: 'Support',         sub: '24/7 Priority Concierge', accent: t.ERR_COLOR,  accentBg: t.ERR_CONT },
  ];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          onSignOut?.();
        },
      },
    ]);
  };

  // Determine what to show for the username
  const displayName = profile?.full_name || 'User';
  const displayEmail = user?.email || 'Visionary Member';

  return (
    <View style={[styles.container, { backgroundColor: t.BG }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        {/* Profile Hero */}
        <View style={styles.heroSection}>
          <ScaleIn delay={50} waitForLoading={true}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatarGlow, { backgroundColor: t.PRIMARY + '15' }]} />
              <View style={[styles.avatarCircle, { backgroundColor: t.SURFACE }]}>
                {profile?.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={44} color={t.PRIMARY} />
                )}
              </View>
              <TouchableOpacity style={[styles.editBtn, { backgroundColor: t.PRIMARY }]} activeOpacity={0.8}>
                <Ionicons name="create" size={13} color="#fff" />
              </TouchableOpacity>
            </View>
          </ScaleIn>
          <FadeInUp delay={110} waitForLoading={true}>
            <Text style={[styles.userName, { color: t.ON_SURFACE }]}>
              {displayName}
            </Text>
          </FadeInUp>
          <FadeInUp delay={140} waitForLoading={true}>
            <Text style={[styles.userRole, { color: t.TEXT2 }]}>
              {displayEmail}
            </Text>
          </FadeInUp>
          <FadeInUp delay={170} waitForLoading={true}>
            <View style={styles.badgesRow}>
              <ScaleIn delay={190} waitForLoading={true}>
                <View style={[styles.badge, { backgroundColor: t.PRIMARY }]}>
                  <Text style={[styles.badgeText, { color: '#fff' }]}>Active Learner</Text>
                </View>
              </ScaleIn>
              <ScaleIn delay={210} waitForLoading={true}>
                <View style={[styles.badge, { backgroundColor: t.SEC_CONT }]}>
                  <Text style={[styles.badgeText, { color: t.TEXT2 }]}>Tech Lead</Text>
                </View>
              </ScaleIn>
            </View>
          </FadeInUp>
        </View>

        {/* Dark Mode Toggle Card */}
        <FadeInUp delay={220} waitForLoading={true}>
          <View style={[styles.toggleCard, { backgroundColor: t.SURFACE, borderColor: t.OUTLINE + '40' }]}>
            <View style={[styles.toggleIconWrap, { backgroundColor: t.isDark ? '#2A2D3E' : '#E8EEFF' }]}>
              <Ionicons name={t.isDark ? 'moon' : 'sunny'} size={20} color={t.PRIMARY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: t.ON_SURFACE }]}>
                {t.isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text style={[styles.toggleSub, { color: t.TEXT2 }]}>
                {t.isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              </Text>
            </View>
            <Switch
              value={t.isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: t.OUTLINE, true: t.PRIMARY }}
              thumbColor="#fff"
              ios_backgroundColor={t.OUTLINE}
            />
          </View>
        </FadeInUp>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item, i) => (
            <FadeInUp key={item.id} delay={260 + i * 40} waitForLoading={true}>
              <TouchableOpacity style={[styles.menuItem, { backgroundColor: t.SURFACE }]} activeOpacity={0.7}>
                <View style={[styles.menuIconWrap, { backgroundColor: item.accentBg }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuTitle, { color: t.ON_SURFACE }]}>{item.title}</Text>
                  <Text style={[styles.menuSub, { color: t.TEXT2 }]}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={t.OUTLINE} />
              </TouchableOpacity>
            </FadeInUp>
          ))}
        </View>

        {/* Logout */}
        <FadeInUp delay={400} waitForLoading={true}>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: t.SURF_LOW + '80', borderColor: t.OUTLINE + '50' }]}
            activeOpacity={0.7}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={18} color={t.ERR_COLOR} />
            <Text style={[styles.logoutText, { color: t.ERR_COLOR }]}>Sign Out</Text>
          </TouchableOpacity>
        </FadeInUp>

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
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  headerButton: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  brand: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },

  heroSection: { alignItems: 'center', paddingTop: 20, paddingBottom: 24 },
  avatarWrap: { position: 'relative', width: 96, height: 96 },
  avatarGlow: { position: 'absolute', inset: -8, borderRadius: 56 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  editBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  userName: { fontSize: 24, fontWeight: '700', marginTop: 16 },
  userRole: { fontSize: 13, marginTop: 4 },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  toggleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 20, marginBottom: 8,
    padding: 16, borderRadius: 14, borderWidth: 1,
    shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  toggleIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleTitle: { fontSize: 15, fontWeight: '700' },
  toggleSub: { fontSize: 11, marginTop: 2 },

  menuGrid: { paddingHorizontal: 20, gap: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 14,
    shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  menuIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { fontSize: 15, fontWeight: '700' },
  menuSub: { fontSize: 11, marginTop: 2 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 16, paddingVertical: 16,
    borderRadius: 14, borderWidth: 1,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
});
