import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useAuth } from '../lib/useAuth';
import { useTheme } from '../lib/ThemeContext';

const { width } = Dimensions.get('window');

type AuthMode = 'login' | 'signup';

interface AuthScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AuthScreen({ onSuccess, onBack }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const { signIn, signUp } = useAuth();
  const { theme } = useTheme();

  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const termsShake = useSharedValue(0);

  // Load saved credentials on component mount
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');
        
        if (savedEmail && savedRememberMe === 'true') {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    };
    
    loadSavedCredentials();
  }, []);

  // Save or remove credentials when rememberMe changes or on login
  const saveCredentials = async (emailToSave: string) => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', emailToSave);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.setItem('rememberMe', 'false');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!email || !password) {
      setPopupMessage('Please fill in all fields');
      setShowPopup(true);
      return;
    }

    if (mode === 'signup') {
      if (!fullName) {
        setPopupMessage('Please enter your full name');
        setShowPopup(true);
        return;
      }
      if (!termsAccepted) {
        // Shake the terms block
        termsShake.value = withSequence(
          withTiming(-10, { duration: 100, easing: Easing.inOut(Easing.quad) }),
          withTiming(10, { duration: 100, easing: Easing.inOut(Easing.quad) }),
          withTiming(-10, { duration: 100, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 100, easing: Easing.inOut(Easing.quad) })
        );
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await signUp(email, password, fullName);
        if (error) {
          setPopupMessage(error.message || 'Something went wrong');
          setShowPopup(true);
          throw error;
        }
        // Show success message
        setPopupMessage('Account created successfully! Please log in.');
        setShowPopup(true);
        setTimeout(() => {
          setMode('login');
        }, 1500);
      } else {
        // Save or clear credentials based on rememberMe
        await saveCredentials(email);
        
        const { data, error } = await signIn(email, password);
        if (error) {
          setPopupMessage(error.message || 'Invalid credentials');
          setShowPopup(true);
          throw error;
        }
        onSuccess();
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const switchModeOnJS = (newMode: AuthMode) => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'signup' : 'login';
    const exitDirection = mode === 'login' ? -50 : 50;
    const entryDirection = newMode === 'login' ? 50 : -50;

    // Animate out
    opacity.value = withTiming(0, { duration: 200, easing: Easing.inOut(Easing.quad) });
    translateX.value = withTiming(exitDirection, { duration: 200, easing: Easing.inOut(Easing.quad) }, (finished) => {
      if (finished) {
        // Switch mode on JS thread
        runOnJS(switchModeOnJS)(newMode);

        // Reset position for entry
        translateX.value = entryDirection;
        
        // Animate in
        opacity.value = withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) });
        translateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const termsShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: termsShake.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.BG} />
      
      {/* Custom Popup */}
      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPopup(false)}>
          <View style={styles.popupOverlay}>
            <View style={styles.popupContainer}>
              <Ionicons 
                name="alert-circle" 
                size={40} 
                color={theme.PRIMARY} 
                style={styles.popupIcon}
              />
              <Text style={styles.popupMessage}>{popupMessage}</Text>
              <TouchableOpacity 
                style={[styles.popupButton, { backgroundColor: theme.PRIMARY }]}
                onPress={() => setShowPopup(false)}
              >
                <Text style={styles.popupButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View style={[styles.header, animatedStyle]}>
            <Text style={styles.title}>
              {mode === 'login' ? 'Welcome Back' : 'Create your account'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Stay connected with us using your email and password to access your account.'
                : 'Provide your full name, email, and password to create your account and get started.'}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.form, animatedStyle]}>
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
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
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {mode === 'signup' ? (
              <Animated.View style={[styles.termsContainer, termsShakeStyle]}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                >
                  <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                    {termsAccepted && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms</Text> & <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </Animated.View>
            ) : (
              <View style={styles.loginOptions}>
                <View style={styles.rememberContainer}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => {
                      const newRememberMe = !rememberMe;
                      setRememberMe(newRememberMe);
                      // If toggling off, immediately clear saved email
                      if (!newRememberMe) {
                        AsyncStorage.removeItem('savedEmail');
                        AsyncStorage.setItem('rememberMe', 'false');
                      }
                    }}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.rememberText}>Remember me</Text>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.PRIMARY }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
              </Text>
            </TouchableOpacity>

            {/* Toggle Mode */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={toggleMode} activeOpacity={0.7}>
                <Text style={[styles.toggleLink, { color: theme.PRIMARY }]}>
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Add some extra space at bottom for keyboard */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#004CD2',
    borderColor: '#004CD2',
  },
  termsText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  termsLink: {
    color: '#004CD2',
    fontWeight: '600',
  },
  loginOptions: {
    marginBottom: 20,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  forgotPassword: {
    fontSize: 13,
    color: '#004CD2',
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 13,
    color: '#6B7280',
  },
  toggleLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Popup styles
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  popupIcon: {
    marginBottom: 16,
  },
  popupMessage: {
    fontSize: 15,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  popupButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  popupButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
