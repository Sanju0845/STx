import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, FlatList, ListRenderItemInfo, ViewToken } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FadeInUp } from '../components/Animations';

const { width } = Dimensions.get('window');
const PRIMARY = '#004CD2';
const BG = '#F7F9FB';
const SURFACE = '#FFFFFF';
const ON_SURFACE = '#191C1E';
const TEXT2 = '#424656';

const onboardingData = [
  {
    id: '1',
    title: 'Welcome to Visionary',
    description: 'Your digital agency partner for amazing apps, websites, and designs.',
    image: require('../assets/onboarding/onboarding-1.png'),
    icon: 'rocket-outline',
  },
  {
    id: '2',
    title: 'Transform Ideas',
    description: 'We turn your creative concepts into beautiful, functional digital products.',
    image: require('../assets/onboarding/onboarding-2.png'),
    icon: 'bulb-outline',
  },
  {
    id: '3',
    title: 'Get Started',
    description: 'Sign up or log in to explore our services and begin your journey.',
    image: require('../assets/onboarding/onboarding-3.png'),
    icon: 'paper-plane-outline',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = currentIndex === onboardingData.length - 1;

  const buttonWidth = useSharedValue(0);
  const buttonHeight = useSharedValue(0);
  const iconOpacity = useSharedValue(1);
  const textOpacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const dotTranslateX = useSharedValue(0);

  useEffect(() => {
    if (buttonWidth.value === 0) {
      buttonWidth.value = 56;
      buttonHeight.value = 56;
      textOpacity.value = 0;
    }
  }, []);

  useEffect(() => {
    if (isLastSlide) {
      buttonWidth.value = withTiming(width - 48, { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      buttonHeight.value = withTiming(56, { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      iconOpacity.value = withTiming(0, { duration: 200 });
      textOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
    } else {
      buttonWidth.value = withTiming(56, { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      buttonHeight.value = withTiming(56, { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      iconOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
      textOpacity.value = withTiming(0, { duration: 200 });
    }
    dotTranslateX.value = withSpring(currentIndex * (8 + 8), { damping: 15, stiffness: 400 });
  }, [currentIndex]);

  const nextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      onComplete();
    }
  };

  const skip = () => {
    onComplete();
  };

  const handleViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  };

  const renderSlide = ({ item, index }: ListRenderItemInfo<typeof onboardingData[0]>) => (
    <View style={styles.slideContainer}>
      <View style={styles.iconContainer}>
        <Image 
          source={item.image} 
          style={styles.onboardingImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
      
      <View style={styles.dotsPlaceholder} />
    </View>
  );

  const buttonStyle = useAnimatedStyle(() => ({
    width: buttonWidth.value,
    height: buttonHeight.value,
    borderRadius: buttonHeight.value / 2,
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const activeDotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dotTranslateX.value },
      { scale: withSpring(1.5, { damping: 15, stiffness: 400 }) }
    ],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoSection}>
        <Image
          source={require('../assets/stX.png')}
          style={styles.onboardingLogo}
          resizeMode="contain"
          tintColor="#000000"
        />
        <View style={styles.skipContainer}>
          <TouchableOpacity 
            onPress={skip} 
            disabled={currentIndex >= onboardingData.length - 1}
            style={[styles.skipButton, { opacity: currentIndex < onboardingData.length - 1 ? 1 : 0 }]}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 100,
          minimumViewTime: 200,
        }}
        snapToInterval={width}
        decelerationRate="fast"
      />

      <View style={styles.footer}>
        <View style={styles.paginationContainer}>
          {onboardingData.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => flatListRef.current?.scrollToIndex({ index, animated: true })}
            >
              <View style={styles.paginationDot} />
            </TouchableOpacity>
          ))}
          <Animated.View 
            style={[
              styles.paginationDot,
              styles.paginationDotActive,
              {
                position: 'absolute',
                left: 0,
              },
              activeDotStyle
            ]} 
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={() => {
            scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 14, stiffness: 200 });
            nextSlide();
          }}
        >
          <Animated.View style={[styles.nextButton, buttonStyle]}>
            <Animated.View style={[styles.iconWrapper, iconStyle, isLastSlide ? { display: 'none' } : {}]}>
              <Ionicons
                name="arrow-forward"
                size={24}
                color="#FFFFFF"
              />
            </Animated.View>
            <Animated.Text style={[styles.nextButtonText, textStyle]}>
              Let's Go
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: 24,
  },
  logoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  onboardingLogo: {
    width: 100,
    height: 50,
  },
  skipContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: TEXT2,
    fontWeight: '500',
  },
  slideContainer: {
    width,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: width - 48,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  onboardingImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: ON_SURFACE,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: TEXT2,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsPlaceholder: {
    height: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    gap: 8,
    position: 'relative',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  paginationDotActive: {
    width: 8,
    height: 8,
    backgroundColor: PRIMARY,
    zIndex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  iconWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
