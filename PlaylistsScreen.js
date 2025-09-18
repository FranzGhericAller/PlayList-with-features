// PlaylistsScreen.js - Updated with Playlist Builder functionality
import React, { useEffect, useReducer, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  Layout,
  SlideInDown,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Constants
const STORAGE_KEY = '@spotify_playlists';
const HISTORY_KEY = '@spotify_history';
const ACTIVE_PLAYLIST_KEY = '@active_playlist';

// Action types
const ActionTypes = {
  ADD_SONG: 'ADD_SONG',
  REMOVE_SONG: 'REMOVE_SONG',
  CLEAR_PLAYLIST: 'CLEAR_PLAYLIST',
  CREATE_PLAYLIST: 'CREATE_PLAYLIST',
  DELETE_PLAYLIST: 'DELETE_PLAYLIST',
  SELECT_PLAYLIST: 'SELECT_PLAYLIST',
  UNDO: 'UNDO',
  REDO: 'REDO',
  LOAD_STATE: 'LOAD_STATE',
};

// Initial state
const initialState = {
  playlists: [
    {
      id: '1',
      title: 'Discover Weekly',
      description: 'Your weekly mixtape of fresh music',
      songs: [],
      color: '#1DB954',
      isDefault: true,
    },
    {
      id: '2',
      title: 'My Favorites',
      description: 'Songs you love',
      songs: [],
      color: '#535353',
      isDefault: false,
    },
  ],
  activePlaylistId: '1',
  history: [],
  historyIndex: -1,
  songIdCounter: 1,
};

// Reducer
const playlistReducer = (state, action) => {
  const saveToHistory = (newState) => {
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({
      playlists: JSON.parse(JSON.stringify(newState.playlists)),
      timestamp: Date.now(),
    });
    return {
      ...newState,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    };
  };

  switch (action.type) {
    case ActionTypes.ADD_SONG:
      const newSong = {
        id: `song_${state.songIdCounter}`,
        name: action.payload.name,
        artist: action.payload.artist || 'Unknown Artist',
        duration: action.payload.duration || '3:30',
        addedAt: new Date().toISOString(),
      };

      const updatedPlaylists = state.playlists.map(playlist => {
        if (playlist.id === state.activePlaylistId) {
          return {
            ...playlist,
            songs: [...playlist.songs, newSong],
          };
        }
        return playlist;
      });

      return saveToHistory({
        ...state,
        playlists: updatedPlaylists,
        songIdCounter: state.songIdCounter + 1,
      });

    case ActionTypes.REMOVE_SONG:
      const playlistsAfterRemove = state.playlists.map(playlist => {
        if (playlist.id === state.activePlaylistId) {
          return {
            ...playlist,
            songs: playlist.songs.filter(song => song.id !== action.payload),
          };
        }
        return playlist;
      });

      return saveToHistory({
        ...state,
        playlists: playlistsAfterRemove,
      });

    case ActionTypes.CLEAR_PLAYLIST:
      const clearedPlaylists = state.playlists.map(playlist => {
        if (playlist.id === state.activePlaylistId) {
          return { ...playlist, songs: [] };
        }
        return playlist;
      });

      return saveToHistory({
        ...state,
        playlists: clearedPlaylists,
      });

    case ActionTypes.CREATE_PLAYLIST:
      const newPlaylist = {
        id: `playlist_${Date.now()}`,
        title: action.payload.title,
        description: action.payload.description,
        songs: [],
        color: action.payload.color || '#535353',
        isDefault: false,
      };

      return saveToHistory({
        ...state,
        playlists: [...state.playlists, newPlaylist],
        activePlaylistId: newPlaylist.id,
      });

    case ActionTypes.SELECT_PLAYLIST:
      return {
        ...state,
        activePlaylistId: action.payload,
      };

    case ActionTypes.UNDO:
      if (state.historyIndex > 0) {
        const previousState = state.history[state.historyIndex - 1];
        return {
          ...state,
          playlists: JSON.parse(JSON.stringify(previousState.playlists)),
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;

    case ActionTypes.REDO:
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        return {
          ...state,
          playlists: JSON.parse(JSON.stringify(nextState.playlists)),
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;

    case ActionTypes.LOAD_STATE:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

// Memoized Song Item Component
const SongItem = memo(({ song, index, onRemove }) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const handleRemove = () => {
    translateX.value = withTiming(-400, { duration: 300 }, () => {
      opacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(onRemove)(song.id);
      });
    });
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).springify()}
      exiting={FadeOutLeft.springify()}
      layout={Layout.springify()}
      style={[styles.songItem, animatedStyle]}
    >
      <View style={styles.songNumber}>
        <Text style={styles.songNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.songInfo}>
        <Text style={styles.songName} numberOfLines={1}>{song.name}</Text>
        <Text style={styles.songArtist}>{song.artist} • {song.duration}</Text>
      </View>
      <TouchableOpacity onPress={handleRemove}>
        <Ionicons name="close-circle" size={24} color="#E91429" />
      </TouchableOpacity>
    </Animated.View>
  );
});

// Playlist Card Component
const PlaylistCard = memo(({ playlist, isActive, onPress, index }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    onPress(playlist.id);
  };

  const songCount = playlist.songs ? playlist.songs.length : 0;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(600).easing(Easing.ease)}
      style={animatedStyle}
    >
      <TouchableOpacity
        style={[
          styles.playlistItem,
          isActive && styles.activePlaylist
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.playlistCover, { backgroundColor: playlist.color }]}>
          <Ionicons name="musical-notes" size={40} color="#fff" />
        </View>
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistTitle}>{playlist.title}</Text>
          <Text style={styles.playlistDescription}>{playlist.description}</Text>
          <Text style={styles.songCount}>{songCount} songs</Text>
        </View>
        {isActive && (
          <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

// Main PlaylistsScreen Component
const PlaylistsScreen = () => {
  const [state, dispatch] = useReducer(playlistReducer, initialState);
  const [viewMode, setViewMode] = useState('playlists'); // 'playlists' or 'songs'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for modals
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');

  // Load saved state on mount
  useEffect(() => {
    loadSavedState();
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    saveState();
  }, [state]);

  // Load from AsyncStorage
  const loadSavedState = async () => {
    try {
      const savedPlaylists = await AsyncStorage.getItem(STORAGE_KEY);
      const savedHistory = await AsyncStorage.getItem(HISTORY_KEY);
      const savedActivePlaylist = await AsyncStorage.getItem(ACTIVE_PLAYLIST_KEY);

      const loadedState = {};
      if (savedPlaylists) {
        loadedState.playlists = JSON.parse(savedPlaylists);
      }
      if (savedHistory) {
        const historyData = JSON.parse(savedHistory);
        loadedState.history = historyData.history || [];
        loadedState.historyIndex = historyData.historyIndex || -1;
      }
      if (savedActivePlaylist) {
        loadedState.activePlaylistId = savedActivePlaylist;
      }

      if (Object.keys(loadedState).length > 0) {
        dispatch({ type: ActionTypes.LOAD_STATE, payload: loadedState });
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  };

  // Save to AsyncStorage
  const saveState = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.playlists));
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify({
        history: state.history,
        historyIndex: state.historyIndex,
      }));
      await AsyncStorage.setItem(ACTIVE_PLAYLIST_KEY, state.activePlaylistId);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  // Handlers
  const handleAddSong = useCallback(() => {
    if (songName.trim()) {
      dispatch({
        type: ActionTypes.ADD_SONG,
        payload: {
          name: songName.trim(),
          artist: artistName.trim() || 'Unknown Artist',
          duration: `${Math.floor(Math.random() * 3) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        },
      });
      setSongName('');
      setArtistName('');
      setShowAddModal(false);
    }
  }, [songName, artistName]);

  const handleRemoveSong = useCallback((songId) => {
    dispatch({ type: ActionTypes.REMOVE_SONG, payload: songId });
  }, []);

  const handleClearPlaylist = useCallback(() => {
    const activePlaylist = state.playlists.find(p => p.id === state.activePlaylistId);
    if (activePlaylist?.songs?.length > 0) {
      Alert.alert(
        'Clear Playlist',
        `Remove all songs from "${activePlaylist.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: () => dispatch({ type: ActionTypes.CLEAR_PLAYLIST }),
          },
        ]
      );
    }
  }, [state.playlists, state.activePlaylistId]);

  const handleCreatePlaylist = useCallback(() => {
    if (playlistTitle.trim()) {
      const colors = ['#E91429', '#509BF5', '#FF6437', '#535353', '#1DB954'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      dispatch({
        type: ActionTypes.CREATE_PLAYLIST,
        payload: {
          title: playlistTitle.trim(),
          description: playlistDescription.trim() || 'Custom playlist',
          color: randomColor,
        },
      });

      setPlaylistTitle('');
      setPlaylistDescription('');
      setShowCreatePlaylistModal(false);
      setViewMode('songs');
    }
  }, [playlistTitle, playlistDescription]);

  const handleSelectPlaylist = useCallback((playlistId) => {
    dispatch({ type: ActionTypes.SELECT_PLAYLIST, payload: playlistId });
    setViewMode('songs');
  }, []);

  const handleUndo = useCallback(() => {
    dispatch({ type: ActionTypes.UNDO });
  }, []);

  const handleRedo = useCallback(() => {
    dispatch({ type: ActionTypes.REDO });
  }, []);

  // Get active playlist and filtered songs
  const activePlaylist = state.playlists.find(p => p.id === state.activePlaylistId);
  const filteredSongs = activePlaylist?.songs?.filter(song =>
    song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  // Render playlist view
  if (viewMode === 'playlists') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Library</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreatePlaylistModal(true)}
          >
            <Ionicons name="add-circle-outline" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={state.playlists}
          renderItem={({ item, index }) => (
            <PlaylistCard
              playlist={item}
              isActive={item.id === state.activePlaylistId}
              onPress={handleSelectPlaylist}
              index={index}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />

        {/* Create Playlist Modal */}
        <Modal
          visible={showCreatePlaylistModal}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New Playlist</Text>
              <TextInput
                style={styles.input}
                placeholder="Playlist name"
                placeholderTextColor="#b3b3b3"
                value={playlistTitle}
                onChangeText={setPlaylistTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Description (optional)"
                placeholderTextColor="#b3b3b3"
                value={playlistDescription}
                onChangeText={setPlaylistDescription}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowCreatePlaylistModal(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleCreatePlaylist}
                >
                  <Text style={styles.buttonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Render songs view
  return (
    <View style={styles.container}>
      <Animated.View entering={SlideInDown.springify()} style={styles.songsHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setViewMode('playlists')}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{activePlaylist?.title}</Text>
          <Text style={styles.headerSubtitle}>
            {activePlaylist?.songs?.length || 0} songs
          </Text>
        </View>

        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={30} color="#1DB954" />
        </TouchableOpacity>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#b3b3b3" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs..."
          placeholderTextColor="#b3b3b3"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Controls */}
      <Animated.View entering={ZoomIn.springify()} style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, !canUndo && styles.disabledButton]}
          onPress={handleUndo}
          disabled={!canUndo}
        >
          <Ionicons name="arrow-undo" size={20} color={canUndo ? '#fff' : '#666'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !canRedo && styles.disabledButton]}
          onPress={handleRedo}
          disabled={!canRedo}
        >
          <Ionicons name="arrow-redo" size={20} color={canRedo ? '#fff' : '#666'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton]}
          onPress={handleClearPlaylist}
        >
          <Ionicons name="trash" size={20} color="#E91429" />
        </TouchableOpacity>
      </Animated.View>

      {/* Songs List */}
      {filteredSongs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="disc-outline" size={80} color="#535353" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No songs found' : 'No songs yet'}
          </Text>
          <TouchableOpacity
            style={styles.addFirstSongButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addFirstSongText}>Add your first song</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredSongs}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <SongItem
              song={item}
              index={index}
              onRemove={handleRemoveSong}
            />
          )}
          contentContainerStyle={styles.songsList}
        />
      )}

      {/* Add Song Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Song</Text>
            <TextInput
              style={styles.input}
              placeholder="Song name"
              placeholderTextColor="#b3b3b3"
              value={songName}
              onChangeText={setSongName}
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="Artist name"
              placeholderTextColor="#b3b3b3"
              value={artistName}
              onChangeText={setArtistName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddSong}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  addButton: {
    padding: 5,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  activePlaylist: {
    borderWidth: 2,
    borderColor: '#1DB954',
  },
  playlistCover: {
    width: 80,
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  playlistDescription: {
    fontSize: 14,
    color: '#b3b3b3',
    marginBottom: 5,
  },
  songCount: {
    fontSize: 12,
    color: '#b3b3b3',
  },
  songsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  backButton: {
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 15,
  },
  controlButton: {
    backgroundColor: '#282828',
    padding: 10,
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  songsList: {
    padding: 20,
    paddingTop: 10,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  songNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  songNumberText: {
    color: '#000',
    fontWeight: 'bold',
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#b3b3b3',
    marginTop: 20,
  },
  addFirstSongButton: {
    marginTop: 20,
    backgroundColor: '#1DB954',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addFirstSongText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#282828',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#121212',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#535353',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#1DB954',
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlaylistsScreen;