import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Button ,Image} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Photo, Region } from '../../types';
import { usePhotos } from '../../context/PhotoContext';

const MapScreen: React.FC = () => {
  const { photos } = usePhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 13.3528382,
    longitude: 74.6993023,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (photos.length > 0) {
      const latest = photos[photos.length - 1];
      setRegion({
        latitude: latest.latitude,
        longitude: latest.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [photos]);

  const formatDate = (date: Date): string => {
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {photos.map((photo) => (
          <Marker
            key={photo.id}
            coordinate={{
              latitude: photo.latitude,
              longitude: photo.longitude,
            }}
            onPress={() => setSelectedPhoto(photo)}
          >
            <View style={styles.marker}>
              <Image 
                source={{ uri: photo.url }} 
                style={styles.markerImage}
              />
            </View>
          </Marker>
        ))}
      </MapView>

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
                    {selectedPhoto.latitude.toFixed(6)}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Longitude: </Text>
                    {selectedPhoto.longitude.toFixed(6)}
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
  },
  map: {
    width: '100%',
    height: '100%',
  },
  marker: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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

export default MapScreen;