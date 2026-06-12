import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { TabKey } from '../lib/types';

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

const PRIMARY = '#007AFF'; 
const INACTIVE_COLOR = '#8E8E93';

const CAPSULE_HEIGHT = 54;
const PADDING_VERTICAL = 5;
const BUTTON_DIAMETER = CAPSULE_HEIGHT - PADDING_VERTICAL * 2; 

export default function AnimatedTabBar({ activeTab, onTabChange, onContactPress }: Props) {
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(BUTTON_DIAMETER);
  const [isReady, setIsReady] = useState(false);

  const layouts = useRef<{ x: number; width: number }[]>(
    TABS.map(() => ({ x: 0, width: 0 })),
  );

  const syncIndicator = useCallback((x: number, width: number, immediate = false) => {
    if (width <= 0) return;
    if (immediate) {
      indicatorX.value = x;
      indicatorW.value = width;
    } else {
      indicatorX.value = withTiming(x, { duration: 250, easing: Easing.out(Easing.quad) });
      indicatorW.value = withTiming(width, { duration: 250, easing: Easing.out(Easing.quad) });
    }
  }, [indicatorX, indicatorW]);

  const handleLayout = useCallback(
    (index: number) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      layouts.current[index] = { x, width };

      // Initial alignment setup on mount
      if (activeTab === TABS[index].key && !isReady && width > 0) {
        syncIndicator(x, width, true);
        setIsReady(true);
      }
    },
    [activeTab, isReady, syncIndicator],
  );

  useEffect(() => {
    const activeIndex = TABS.findIndex((t) => t.key === activeTab);
    if (activeIndex !== -1 && isReady) {
      const layout = layouts.current[activeIndex];
      if (layout.width > 0) {
        syncIndicator(layout.x, layout.width, false);
      }
    }
  }, [activeTab, isReady, syncIndicator]);

  const indicatorStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: indicatorX.value,
    width: indicatorW.value,
    height: BUTTON_DIAMETER,
    top: PADDING_VERTICAL,
    borderRadius: BUTTON_DIAMETER / 2,
    backgroundColor: PRIMARY,
    opacity: isReady ? 1 : 0,
  }));

  return (
    <View style={styles.footerContainer} pointerEvents="box-none">
      <View style={styles.rowWrapper}>
        <View style={styles.pill}>
          <Animated.View style={indicatorStyle} />

          {TABS.map((tab, i) => {
            const isActive = activeTab === tab.key;
            return (
              <AnimatedTabItem
                key={tab.key}
                tab={tab}
                isActive={isActive}
                onLayout={handleLayout(i)}
                onPress={() => onTabChange(tab.key)}
                onDynamicMeasure={(width, x) => {
                  if (isActive && isReady) {
                    syncIndicator(x, width, false);
                  }
                }}
              />
            );
          })}
        </View>

        <View style={styles.contactContainer}>
          <AnimatedContactButton onPress={onContactPress} />
        </View>
      </View>

      <View style={styles.homeIndicator} />
    </View>
  );
}

/* ── Contact Button ─────────────────────────────────── */
function AnimatedContactButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.contactButton, animStyle]}
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
      <Ionicons name="person" size={22} color="#fff" />
    </Animated.View>
  );
}

/* ── Dynamic Layout Expanding Tab Item ──────────────── */
function AnimatedTabItem({
  tab,
  isActive,
  onLayout,
  onPress,
  onDynamicMeasure,
}: {
  tab: Tab;
  isActive: boolean;
  onLayout: (e: LayoutChangeEvent) => void;
  onPress: () => void;
  onDynamicMeasure: (width: number, x: number) => void;
}) {
  const pressOpacity = useSharedValue(1);
  const expansionProgress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    expansionProgress.value = withTiming(isActive ? 1 : 0, { 
      duration: 250, 
      easing: Easing.out(Easing.quad) 
    });
  }, [isActive, expansionProgress]);

  const handleItemLayout = (e: LayoutChangeEvent) => {
    onLayout(e);
    // Capture dynamic measurements during runtime expansions safely
    const { width, x } = e.nativeEvent.layout;
    if (isActive) {
      onDynamicMeasure(width, x);
    }
  };

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: pressOpacity.value,
      paddingHorizontal: interpolate(expansionProgress.value, [0, 1], [12, 16], Extrapolation.CLAMP),
      minWidth: BUTTON_DIAMETER, 
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    return {
      opacity: expansionProgress.value,
      maxWidth: interpolate(expansionProgress.value, [0, 1], [0, 100], Extrapolation.CLAMP),
      transform: [
        { 
          scale: interpolate(expansionProgress.value, [0, 1], [0.85, 1], Extrapolation.CLAMP) 
        }
      ],
    };
  });

  return (
    <Animated.View
      style={[styles.tabItem, containerStyle]}
      onLayout={handleItemLayout}
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
      <Ionicons
        name={isActive ? tab.activeIcon : tab.icon}
        size={20}
        color={isActive ? '#fff' : INACTIVE_COLOR}
      />
      <Animated.View style={[styles.labelWrapper, labelStyle]}>
        <Animated.Text numberOfLines={1} style={styles.tabLabel}>
          {tab.label}
        </Animated.Text>
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
    height: 110,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
    gap: 12, 
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: CAPSULE_HEIGHT,
    borderRadius: CAPSULE_HEIGHT / 2,
    paddingVertical: PADDING_VERTICAL,
    paddingHorizontal: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: BUTTON_DIAMETER,
    borderRadius: BUTTON_DIAMETER / 2,
    overflow: 'hidden', 
  },
  labelWrapper: {
    overflow: 'hidden',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.1,
    marginLeft: 6,
  },
  contactContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButton: {
    width: BUTTON_DIAMETER,
    height: BUTTON_DIAMETER,
    borderRadius: BUTTON_DIAMETER / 2, 
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 3,
    opacity: 0.15,
    marginTop: 14,
    marginBottom: 4,
  },
});