import React, { useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { Photo } from '../../types';
import { usePhotos } from '../../context/PhotoContext';

const GalleryScreen: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { photos, refreshPhotos } = usePhotos();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPhotos();
    setRefreshing(false);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.photoItem}
            onPress={() => setSelectedPhoto(item)}
          >
            <Image
              source={{ uri: item.url }}
              style={styles.thumbnail}
            />
            <View style={styles.photoInfo}>
              <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
              <Text style={styles.coordinates}>
                {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

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
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedPhoto(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
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
  },
  photoItem: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  photoInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  coordinates: {
    fontSize: 12,
    color: '#666',
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
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#444',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GalleryScreen;