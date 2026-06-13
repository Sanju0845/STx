import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabKey } from '../lib/types';
import { useTheme } from '../lib/ThemeContext';

interface Tab {
  key: TabKey;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const TABS: Tab[] = [
  { key: 'Home',     icon: 'home-outline',       activeIcon: 'home',       label: 'Home'     },
  { key: 'Services', icon: 'layers-outline',     activeIcon: 'layers',     label: 'Services' },
  { key: 'Courses',  icon: 'school-outline',     activeIcon: 'school',     label: 'Courses'  },
  { key: 'Profile',  icon: 'person-outline',     activeIcon: 'person',     label: 'Profile'  },
];

interface Props {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onContactPress: () => void;
}

const CAPSULE_HEIGHT = 56;
const PADDING_VERTICAL = 5;
const BUTTON_DIAMETER = CAPSULE_HEIGHT - PADDING_VERTICAL * 2; // 46
const ICON_SIZE = 22; 

const TAB_INACTIVE_WIDTH = BUTTON_DIAMETER;      
const TAB_ACTIVE_WIDTH = BUTTON_DIAMETER + 60;   
const PILL_GAP = 4;
const PILL_PADDING = 5;

const SMOOTH_EASE = Easing.bezier(0.25, 1, 0.5, 1);

export default function AnimatedTabBar({ activeTab, onTabChange, onContactPress }: Props) {
  const { theme: t } = useTheme();
  const insets = useSafeAreaInsets();
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(TAB_ACTIVE_WIDTH);

  const activeIndex = TABS.findIndex((tab) => tab.key === activeTab);

  useEffect(() => {
    let targetX = PILL_PADDING;
    for (let i = 0; i < activeIndex; i++) {
      targetX += TAB_INACTIVE_WIDTH + PILL_GAP;
    }

    indicatorX.value = withTiming(targetX, { duration: 280, easing: SMOOTH_EASE });
    indicatorW.value = withTiming(TAB_ACTIVE_WIDTH, { duration: 280, easing: SMOOTH_EASE });
  }, [activeIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: indicatorX.value,
    width: indicatorW.value,
    height: BUTTON_DIAMETER,
    // 🌟 FIXED: Centers the blue capsule perfectly inside the bar vertical axis
    top: (CAPSULE_HEIGHT - BUTTON_DIAMETER) / 3, 
    borderRadius: BUTTON_DIAMETER / 2,
    backgroundColor: t.PRIMARY,
  }));

  const blurTint = t.isDark ? 'dark' : 'light';

  return (
    <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 8) + 10 }]} pointerEvents="box-none">
      <View style={styles.rowWrapper} pointerEvents="box-none">
        <View style={[
          styles.pill, { 
            backgroundColor: t.isDark ? 'rgba(255, 255, 255, 0)' : 'rgba(56, 56, 56, 0.16)',
            borderColor: t.isDark ? 'rgba(255, 255, 255, 0)' : 'rgba(0, 0, 0, 0)',
            borderWidth: 1,
          }
        ]}>
          <BlurView 
            intensity={35} 
            tint={blurTint}
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFillObject} 
          />

          <Animated.View style={indicatorStyle} />

          {TABS.map((tab, i) => (
            <AnimatedTabItem
              key={tab.key}
              tab={tab}
              isActive={activeIndex === i}
              onPress={() => onTabChange(tab.key)}
            />
          ))}
        </View>

        <View style={styles.contactContainer}>
          <AnimatedContactButton onPress={onContactPress} />
        </View>
      </View>
    </View>
  );
}

/* ── Contact Button ─────────────────────────────────── */
function AnimatedContactButton({ onPress }: { onPress: () => void }) {
  const { theme: t } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.contactButton, animStyle, { backgroundColor: t.PRIMARY }]}
      onStartShouldSetResponder={() => true}
      onResponderGrant={() => {
        scale.value = withTiming(0.92, { duration: 100 });
        opacity.value = withTiming(0.9, { duration: 100 });
      }}
      onResponderRelease={() => {
        scale.value = withTiming(1, { duration: 200 });
        opacity.value = withTiming(1, { duration: 200 });
        onPress();
      }}
      onResponderTerminate={() => {
        scale.value = withTiming(1, { duration: 200 });
        opacity.value = withTiming(1, { duration: 200 });
      }}
    >
      <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
    </Animated.View>
  );
}

/* ── Narrow Footprint Expanding Tab Item ────────────── */
function AnimatedTabItem({
  tab,
  isActive,
  onPress,
}: {
  tab: Tab;
  isActive: boolean;
  onPress: () => void;
}) {
  const { theme: t } = useTheme();
  const pressOpacity = useSharedValue(1);
  const expansionProgress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    expansionProgress.value = withTiming(isActive ? 1 : 0, { 
      duration: 280, 
      easing: SMOOTH_EASE 
    });
  }, [isActive]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: pressOpacity.value,
    width: interpolate(
      expansionProgress.value,
      [0, 1],
      [TAB_INACTIVE_WIDTH, TAB_ACTIVE_WIDTH],
      Extrapolation.CLAMP
    ),
  }));

  const wrapperStyle = useAnimatedStyle(() => ({
    paddingLeft: interpolate(
      expansionProgress.value,
      [0, 1],
      [(TAB_INACTIVE_WIDTH - ICON_SIZE) / 2, 14], 
      Extrapolation.CLAMP
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: expansionProgress.value,
    maxWidth: interpolate(
      expansionProgress.value,
      [0, 1],
      [0, 70],
      Extrapolation.CLAMP
    ),
    transform: [
      { 
        scale: interpolate(expansionProgress.value, [0, 1], [0.9, 1], Extrapolation.CLAMP) 
      }
    ],
  }));

  return (
    <Animated.View
      style={[styles.tabItem, containerStyle]}
      onStartShouldSetResponder={() => true}
      onResponderGrant={() => {
        pressOpacity.value = withTiming(0.7, { duration: 80 });
      }}
      onResponderRelease={() => {
        pressOpacity.value = withTiming(1, { duration: 150 });
        onPress();
      }}
      onResponderTerminate={() => {
        pressOpacity.value = withTiming(1, { duration: 150 });
      }}
    >
      <Animated.View style={[styles.tabContentWrapper, wrapperStyle]}>
        <View style={styles.iconBox}>
          <Ionicons
            name={isActive ? tab.activeIcon : tab.icon}
            size={ICON_SIZE}
            color={isActive ? '#fff' : t.TEXT2}
          />
        </View>
        <Animated.View style={[styles.labelWrapper, labelStyle]}>
          <Animated.Text numberOfLines={1} style={styles.tabLabel}>
            {tab.label}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

/* ── Styles ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
    gap: 10, 
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CAPSULE_HEIGHT,
    borderRadius: CAPSULE_HEIGHT / 2,
    paddingHorizontal: PILL_PADDING,
    overflow: 'hidden',
    gap: PILL_GAP,
    
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 12,
  },
  tabItem: {
    height: BUTTON_DIAMETER,
    justifyContent: 'center',
    borderRadius: BUTTON_DIAMETER / 2,
    overflow: 'hidden', 
  },
  tabContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconBox: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrapper: {
    marginLeft: 6,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  contactContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButton: {
    width: BUTTON_DIAMETER,
    height: BUTTON_DIAMETER,
    borderRadius: BUTTON_DIAMETER / 2, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
});