import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const PRIMARY = '#004CD2';
const BG = '#F7F9FB';
const SURFACE = '#FFFFFF';
const TEXT = '#191C1E';
const TEXT2 = '#5F6368';

const { width } = Dimensions.get('window');

interface ContactScreenProps {
  onBack: () => void;
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

export default function ContactScreen({ onBack }: ContactScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar with back button */}
      <FadeInSmall delay={0}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Contact</Text>
          <View style={{ width: 24 }} />
        </View>
      </FadeInSmall>
      
      <View style={styles.content}>
        <FadeInSmall delay={50}>
          <View style={styles.iconContainer}>
            <Ionicons name="construct-outline" size={80} color={PRIMARY} />
          </View>
        </FadeInSmall>
        
        <FadeInSmall delay={80}>
          <Text style={styles.title}>Coming Soon</Text>
        </FadeInSmall>
        <FadeInSmall delay={110}>
          <Text style={styles.subtitle}>
            We're working hard to bring you the best contact experience.
            Stay tuned!
          </Text>
        </FadeInSmall>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(0, 76, 210, 0.1)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT2,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
});
