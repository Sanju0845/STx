import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/useAuth';

const PRIMARY = '#004CD2';
const BG = '#F7F9FB';
const SURFACE = '#FFFFFF';
const ON_SURFACE = '#191C1E';
const TEXT2 = '#5F6368';
const OUTLINE = '#DADCE0';

type AuthMode = 'login' | 'signup';

interface AuthScreenProps {
  onSuccess: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signUp } = useAuth();

  const slideAnim = useSharedValue(0);
  const fadeAnim = useSharedValue(1);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (mode === 'signup' && !fullName) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        Alert.alert('Success', 'Account created! Please log in.');
        switchMode('login');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onSuccess();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    if (newMode === mode) return;
    
    fadeAnim.value = withTiming(0, { duration: 150 }, () => {
      setMode(newMode);
      slideAnim.value = withSpring(newMode === 'login' ? 0 : 1, {
        damping: 20,
        stiffness: 100,
      });
      fadeAnim.value = withTiming(1, { duration: 200 });
    });
    
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const toggleMode = () => {
    switchMode(mode === 'login' ? 'signup' : 'login');
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ 
      translateY: interpolate(fadeAnim.value, [0, 1], [10, 0]) 
    }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={require('../assets/stX.png')}
              style={styles.logo}
              resizeMode="contain"
              tintColor="#000000"
            />
            <Text style={styles.tagline}>Build. Innovate. Grow.</Text>
          </View>

          {/* Auth Card */}
          <View style={styles.card}>
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, mode === 'login' && styles.activeTab]} 
                onPress={() => switchMode('login')}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, mode === 'signup' && styles.activeTab]} 
                onPress={() => switchMode('signup')}
              >
                <Text style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Header */}
            <Animated.View style={[styles.cardHeader, headerAnimatedStyle]}>
              <Text style={styles.cardTitle}>
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {mode === 'login' ? 'Sign in to continue' : 'Join our community today'}
              </Text>
            </Animated.View>

            {/* Form */}
            <View style={styles.form}>
              {/* Name Input (only for signup) */}
              <View style={[styles.inputWrapper, mode === 'login' && styles.hiddenInput]}>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={TEXT2} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={TEXT2}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    editable={mode === 'signup'}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={TEXT2} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={TEXT2}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={TEXT2} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={TEXT2}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={TEXT2}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              {/* Toggle Mode */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {mode === 'login'
                    ? "Don't have an account?"
                    : 'Already have an account?'}
                </Text>
                <TouchableOpacity onPress={toggleMode}>
                  <Text style={styles.toggleLink}>
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 70,
  },
  tagline: {
    marginTop: 8,
    fontSize: 13,
    color: TEXT2,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: PRIMARY,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT2,
  },
  activeTabText: {
    color: SURFACE,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: ON_SURFACE,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14,
    color: TEXT2,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderWidth: 1.5,
    borderColor: OUTLINE,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: ON_SURFACE,
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 4,
  },
  hiddenInput: {
    height: 0,
    marginBottom: 0,
    opacity: 0,
    overflow: 'hidden',
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 16,
  },
  toggleText: {
    fontSize: 13,
    color: TEXT2,
  },
  toggleLink: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '700',
  },
});
