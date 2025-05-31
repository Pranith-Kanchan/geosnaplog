import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, PermissionsAndroid, Platform, Modal, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker } from 'react-native-maps';

const App = () => {
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [photosList, setPhotosList] = useState([]);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [region, setRegion] = useState({
    latitude: 13.3528382,  
    longitude: 74.6993023,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Request camera permission
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs access to your camera",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Get current location
  const getCurrentCoordinates = async () => {
    const hasPermission = async () => {
      if (Platform.OS === 'ios') return true;

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    };

    const permissionGranted = await hasPermission();
    if (!permissionGranted) return null;

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lon: longitude });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  // Get photos from Firestore
  const getPhotos = async () => {
    try {
      const snapshot = await firestore().collection('photos').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to JS Date if needed
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error getting photos:', error);
      throw error;
    }
  };

  // Add photo to Firestore
  const addPhoto = async (photoData) => {
    try {
      const docRef = await firestore().collection('photos').add({
        ...photoData,
        latitude: parseFloat(photoData.latitude) || 0,
        longitude: parseFloat(photoData.longitude) || 0,
        timestamp: firestore.FieldValue.serverTimestamp()
      });
      return { id: docRef.id, ...photoData };
    } catch (error) {
      console.error('Error adding photo:', error);
      throw error;
    }
  };

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      const cameraPermission = await requestCameraPermission();
      setHasCameraPermission(cameraPermission);
      
      try {
        const coords = await getCurrentCoordinates();
        if (coords) {
          setLocation({ latitude: coords.lat, longitude: coords.lon });
          setRegion({
            latitude: coords.lat,
            longitude: coords.lon,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (error) {
        console.warn('Location error:', error);
      }
      
      refreshPhotos();
    };
    
    initializeApp();
  }, []);

  // Capture image from camera
  const captureImage = async () => {
    if (!hasCameraPermission) {
      Alert.alert('Permission required', 'Camera permission is needed to take photos');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.7,
      saveToPhotos: false,
      includeBase64: false,
    };

    launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets[0].uri) {
        const asset = response.assets[0];
        setPhoto({
          uri: asset.uri,
          width: asset.width,
          height: asset.height
        });
        
        // Get fresh location when taking a new photo
        try {
          const coords = await getCurrentCoordinates();
          if (coords) {
            setLocation({ latitude: coords.lat, longitude: coords.lon });
          }
        } catch (error) {
          console.warn('Error getting location:', error);
        }
      }
    });
  };

  // Upload photo to Firestore
  const uploadPhoto = async () => {
    if (!photo) {
      Alert.alert('Error', 'Please capture a photo first');
      return;
    }
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    try {
      setIsUploading(true);
      const photoData = {
        url: photo.uri,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      };

      await addPhoto(photoData);
      Alert.alert('Success', 'Photo uploaded successfully');
      setPhoto(null);
      refreshPhotos();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  // Refresh photos list
  const refreshPhotos = async () => {
    try {
      const photos = await getPhotos();
      setPhotosList(photos);
      
      // If we have photos, center map on the most recent one
      if (photos.length > 0) {
        const latestPhoto = photos[photos.length - 1];
        setRegion({
          latitude: parseFloat(latestPhoto.latitude),
          longitude: parseFloat(latestPhoto.longitude),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error refreshing photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    }
  };

  // Refresh current location
  const refreshLocation = async () => {
    try {
      const coords = await getCurrentCoordinates();
      if (coords) {
        setLocation({ latitude: coords.lat, longitude: coords.lon });
        setRegion({
          latitude: coords.lat,
          longitude: coords.lon,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        Alert.alert('Success', 'Location refreshed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh location');
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleString();
  };

  return (
    <View style={styles.container}>
      {/* Map View Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photo Locations</Text>
        <MapView 
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {photosList.map((item) => (
            <Marker
              key={item.id}
              coordinate={{
                latitude: parseFloat(item.latitude),
                longitude: parseFloat(item.longitude),
              }}
              onPress={() => setSelectedPhoto(item)}
            >
              <View style={styles.marker}>
                <Image 
                  source={{ uri: item.url }} 
                  style={styles.markerImage}
                />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Photo Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photo Upload</Text>
        <Button 
          title="Capture Image" 
          onPress={captureImage} 
          disabled={!hasCameraPermission}
        />
        <Button 
          title={isUploading ? "Uploading..." : "Upload Photo"} 
          onPress={uploadPhoto} 
          disabled={!photo || isUploading}
        />
        
        {photo && (
          <View style={styles.preview}>
            <Image 
              source={{ uri: photo.uri }} 
              style={[styles.image, { aspectRatio: photo.width / photo.height }]} 
            />
            {location && (
              <Text style={styles.coordinates}>
                Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Location Refresh Button */}
      <View style={styles.section}>
        <Button 
          title="Refresh Location" 
          onPress={refreshLocation} 
        />
      </View>

      {/* Photo Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent={true}
        onRequestClose={() => setSelectedPhoto(null)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackground}
            onPress={() => setSelectedPhoto(null)}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            {selectedPhoto && (
              <>
                <Image 
                  source={{ uri: selectedPhoto.url }} 
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <View style={styles.photoInfo}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Latitude: </Text>
                    {parseFloat(selectedPhoto.latitude).toFixed(6)}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Longitude: </Text>
                    {parseFloat(selectedPhoto.longitude).toFixed(6)}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Date: </Text>
                    {formatDate(selectedPhoto.timestamp)}
                  </Text>
                </View>
                <Button 
                  title="Close" 
                  onPress={() => setSelectedPhoto(null)} 
                  color="#333"
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  section: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  map: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 10,
  },
  marker: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  preview: {
    marginVertical: 15,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    maxHeight: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  coordinates: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 300,
    marginBottom: 15,
    borderRadius: 8,
  },
  photoInfo: {
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#444',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default App;