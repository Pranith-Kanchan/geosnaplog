import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Photo, Region } from '../../types';
import { usePhotos } from '../../context/PhotoContext';
import PhotoModal from '../../components/PhotoModal';
import { useGetPhotosQuery } from '../../store/firebaseApi';

const MapScreen: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { data: photos = [] } = useGetPhotosQuery();
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
      <PhotoModal
        visible={!!selectedPhoto}
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  markerImage: {
    width: 40,
    height: 40,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
});

export default MapScreen;