import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Easing } from 'react-native-reanimated';


const SettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [highQuality, setHighQuality] = useState(false);

  const handleLogout = () => {
    // Implement SpotifyLogin logout
    navigation.navigate('SignUp');
  };

  const SettingItem = ({ icon, title, subtitle, value, onValueChange, isSwitch = true }) => (
    <View style={styles.settingItem}>
      <Ionicons name={icon} size={24} color="#1DB954" style={styles.settingIcon} />
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: '#1DB954' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={24} color="#b3b3b3" />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Animated.View
        entering={FadeInDown.duration(800).easing(Easing.ease)}
        style={styles.content}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Get updates about your favorite artists"
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Easier on the eyes"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          <SettingItem
            icon="play-skip-forward-outline"
            title="Autoplay"
            subtitle="Keep the music going"
            value={autoPlay}
            onValueChange={setAutoPlay}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Quality</Text>
          <SettingItem
            icon="wifi-outline"
            title="High Quality Streaming"
            subtitle="Uses more data"
            value={highQuality}
            onValueChange={setHighQuality}
          />
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="download-outline" size={24} color="#1DB954" style={styles.settingIcon} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Download Quality</Text>
              <Text style={styles.settingSubtitle}>Very High</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#b3b3b3" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="person-outline" size={24} color="#1DB954" style={styles.settingIcon} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Account Settings</Text>
              <Text style={styles.settingSubtitle}>Privacy, security, and more</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#b3b3b3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle-outline" size={24} color="#1DB954" style={styles.settingIcon} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#b3b3b3" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 8.7.12</Text>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#b3b3b3',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E91429',
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  version: {
    textAlign: 'center',
    color: '#b3b3b3',
    marginTop: 20,
    fontSize: 14,
  },
});

export default SettingsScreen;