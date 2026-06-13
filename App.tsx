import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  BackHandler,
  TouchableWithoutFeedback,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TabKey, Service } from './lib/types';
import { ThemeProvider, useTheme } from './lib/ThemeContext';
import { useAuth } from './lib/useAuth';
import { useAppSettings } from './lib/useData';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import HomeScreen          from './screens/HomeScreen';
import ServicesScreen      from './screens/ServicesScreen';
import CoursesScreen       from './screens/CoursesScreen';
import ProfileScreen       from './screens/ProfileScreen';
import ServiceDetailScreen from './screens/ServiceDetailScreen';
import AnimatedTabBar      from './components/AnimatedTabBar';
import AuthScreen          from './screens/AuthScreen';
import OnboardingScreen    from './screens/OnboardingScreen';

const ONBOARDING_KEY = '@onboarding_completed';

// Contact Popup Component with Animation
function ContactPopup({ 
  visible, 
  onClose, 
  whatsappNumber, 
  emailAddress 
}: { 
  visible: boolean; 
  onClose: () => void;
  whatsappNumber: string | null;
  emailAddress: string | null;
}) {
  const { theme } = useTheme();
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const overlayOpacity = useSharedValue(0);

  // Don't show popup if both are null
  if (!whatsappNumber && !emailAddress) return null;

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
      contentOpacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.exp) });
      contentScale.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.exp) });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 400, easing: Easing.inOut(Easing.quad) });
      contentOpacity.value = withTiming(0, { duration: 350, easing: Easing.inOut(Easing.quad) });
      contentScale.value = withTiming(0.8, { duration: 350, easing: Easing.inOut(Easing.quad) });
    }
  }, [visible, overlayOpacity, contentOpacity, contentScale]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const handleWhatsApp = async () => {
    if (!whatsappNumber) return;
    const url = `whatsapp://send?phone=${whatsappNumber}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open WhatsApp:', error);
    }
  };

  const handleEmail = async () => {
    if (!emailAddress) return;
    const url = `mailto:${emailAddress}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open email:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.popupOverlay, overlayAnimatedStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.popupContainer, { backgroundColor: theme.SURFACE }, contentAnimatedStyle]}>
              {whatsappNumber && (
                <View style={styles.optionContainer}>
                  <TouchableWithoutFeedback onPress={handleWhatsApp}>
                    <View style={[styles.optionButton, { backgroundColor: '#25D366' }]}>
                      <Ionicons name="logo-whatsapp" size={36} color="#fff" />
                    </View>
                  </TouchableWithoutFeedback>
                  <Text style={[styles.optionLabel, { color: theme.ON_SURFACE }]}>WhatsApp</Text>
                </View>
              )}
              {emailAddress && (
                <View style={styles.optionContainer}>
                  <TouchableWithoutFeedback onPress={handleEmail}>
                    <View style={[styles.optionButton, { backgroundColor: theme.PRIMARY }]}>
                      <Ionicons name="mail" size={36} color="#fff" />
                    </View>
                  </TouchableWithoutFeedback>
                  <Text style={[styles.optionLabel, { color: theme.ON_SURFACE }]}>Email</Text>
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function MainApp({ 
  onSignOut, 
  selectedService, 
  setSelectedService,
  onContactPress,
}: { 
  onSignOut: () => void; 
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  onContactPress: () => void;
}) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('Home');

  const renderScreen = () => {
    if (selectedService) {
      return (
        <ServiceDetailScreen
          service={selectedService}
          onBack={() => setSelectedService(null)}
        />
      );
    }
    switch (activeTab) {
      case 'Home':     return <HomeScreen onNavigate={setActiveTab} />;
      case 'Services': return <ServicesScreen onServiceSelect={setSelectedService} />;
      case 'Courses':  return <CoursesScreen />;
      case 'Profile':  return <ProfileScreen onSignOut={onSignOut} />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.BG }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      {!selectedService && (
        <AnimatedTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onContactPress={onContactPress}
        />
      )}
    </SafeAreaView>
  );
}

function AppInner() {
  const { session, loading } = useAuth();
  const { settings } = useAppSettings();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const whatsappNumber = settings.contact_whatsapp || '919493562061';
  const emailAddress = settings.contact_email || 'sanjayanand0509@gmail.com';

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setShowOnboarding(value === null);
        if (value !== null) {
          setShowAuth(true);
        }
      } catch (error) {
        setShowOnboarding(true);
      } finally {
        setAppLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  // Handle back button presses for all screens
  useEffect(() => {
    const handleBackPress = () => {
      // First priority: if contact popup is visible, close it
      if (showContactPopup) {
        setShowContactPopup(false);
        return true;
      }

      // Second priority: if we're on ServiceDetailScreen, go back
      if (selectedService) {
        setSelectedService(null);
        return true;
      }

      // Third priority: if we're on AuthScreen and not onboarding, go to onboarding
      if (showAuth && !session) {
        setShowAuth(false);
        setShowOnboarding(true);
        return true;
      }

      // Otherwise, let system handle (exit app)
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => backHandler.remove();
  }, [selectedService, showAuth, session, showContactPopup]);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
      setShowAuth(true);
    } catch (error) {
      setShowOnboarding(false);
      setShowAuth(true);
    }
  };

  const handleBackToOnboarding = () => {
    setShowAuth(false);
    setShowOnboarding(true);
  };

  const handleSignOut = async () => {
    // The signOut is handled in useAuth, which updates session state
  };

  if (loading || appLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004CD2" />
      </SafeAreaView>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (showAuth && !session) {
    return <AuthScreen onSuccess={() => {}} onBack={handleBackToOnboarding} />;
  }

  if (!session) {
    return <AuthScreen onSuccess={() => {}} onBack={() => {}} />;
  }

  // Only show contact button if at least one contact method exists
  const handleContactPress = () => {
    if (whatsappNumber || emailAddress) {
      setShowContactPopup(true);
    }
  };

  return (
    <>
      <MainApp 
        onSignOut={handleSignOut} 
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        onContactPress={handleContactPress}
      />
      <ContactPopup 
        visible={showContactPopup} 
        onClose={() => setShowContactPopup(false)} 
        whatsappNumber={whatsappNumber}
        emailAddress={emailAddress}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  screenContainer: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FB',
  },
  // Contact Popup Styles
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 110,
  },
  popupContainer: {
    flexDirection: 'row',
    gap: 30,
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  optionContainer: {
    alignItems: 'center',
    gap: 10,
  },
  optionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
