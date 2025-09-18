import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Easing } from 'react-native-reanimated';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState({});

  // shake animation
  const shake = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shake.value }],
    };
  });

  const triggerShake = () => {
    shake.value = withSequence(
      withTiming(-10, { duration: 80 }),
      withTiming(10, { duration: 80 }),
      withTiming(-8, { duration: 80 }),
      withTiming(8, { duration: 80 }),
      withTiming(0, { duration: 80 })
    );
  };

  const validate = () => {
    let newErrors = {};

    // username
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      newErrors.username =
        'Username must be 3–20 characters, letters/numbers/underscores only.';
    }

    // email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    // password
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = () => {
    if (validate()) {
      navigation.replace('Main'); // ✅ go to DrawerNavigator
    } else {
      triggerShake(); // ❌ invalid → shake input fields
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View
          entering={FadeInDown.duration(1000).easing(Easing.ease)}
          style={styles.content}
        >
          {/* ✅ Logo */}
          <Image
            source={require('../SpotifyLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Join Spotify</Text>
          <Text style={styles.subtitle}>Start listening to millions of songs</Text>

          <Animated.View style={[styles.inputContainer, animatedStyle]}>
            {/* Username */}
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#b3b3b3"
              value={username}
              onChangeText={setUsername}
            />
            {errors.username && (
              <Animated.Text
                entering={FadeInDown.duration(300)}
                style={styles.errorText}
              >
                {errors.username}
              </Animated.Text>
            )}

            {/* Email */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#b3b3b3"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Animated.Text
                entering={FadeInDown.duration(300)}
                style={styles.errorText}
              >
                {errors.email}
              </Animated.Text>
            )}

            {/* Password */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#b3b3b3"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors.password && (
              <Animated.Text
                entering={FadeInDown.duration(300)}
                style={styles.errorText}
              >
                {errors.password}
              </Animated.Text>
            )}
          </Animated.View>

          {/* Sign Up */}
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social logins */}
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={24} color="#fff" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-facebook" size={24} color="#fff" />
            <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#b3b3b3',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#282828',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 15,
  },
  signUpButton: {
    backgroundColor: '#1DB954',
    borderRadius: 30,
    paddingHorizontal: 50,
    paddingVertical: 15,
    marginBottom: 20,
  },
  signUpButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#282828',
  },
  dividerText: {
    color: '#b3b3b3',
    paddingHorizontal: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
    width: '100%',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
});

export default SignUpScreen;
