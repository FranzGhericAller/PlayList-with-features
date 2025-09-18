import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Easing } from 'react-native-reanimated';


const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Animated.View
        entering={FadeInUp.duration(800).easing(Easing.ease)}
        style={styles.content}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={120} color="#1DB954" />
          </View>
          <Text style={styles.username}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Playlists</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>523</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1.2K</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Ionicons name="play-circle" size={24} color="#1DB954" />
            <Text style={styles.activityText}>Listened to "Bohemian Rhapsody"</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="heart" size={24} color="#1DB954" />
            <Text style={styles.activityText}>Liked "Imagine"</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="add-circle" size={24} color="#1DB954" />
            <Text style={styles.activityText}>Created playlist "Workout Mix"</Text>
          </View>
        </View>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#b3b3b3',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: '#282828',
    borderRadius: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#b3b3b3',
    marginTop: 5,
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1DB954',
    borderRadius: 30,
    paddingHorizontal: 30,
    paddingVertical: 12,
    alignSelf: 'center',
    marginBottom: 30,
  },
  editButtonText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  activityText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
});

export default ProfileScreen;