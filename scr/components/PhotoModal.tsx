// components/PhotoModal.tsx
import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { Photo } from '../types';
import colors from '../utils/colors';

interface PhotoModalProps {
  visible: boolean;
  photo: Photo | null;
  onClose: () => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ visible, photo, onClose }) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleString();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalBackground} />
        <Card style={styles.modalCard}>
          {photo && (
            <>
              <Card.Cover 
                source={{ uri: photo.url }} 
                style={styles.modalImage}
              />
              <Card.Content style={styles.modalContent}>
                <Text variant="bodyMedium" style={styles.infoText}>
                  <Text style={styles.infoLabel}>Latitude: </Text>
                  {photo.latitude.toFixed(6)}
                </Text>
                <Text variant="bodyMedium" style={styles.infoText}>
                  <Text style={styles.infoLabel}>Longitude: </Text>
                  {photo.longitude.toFixed(6)}
                </Text>
                <Text variant="bodyMedium" style={styles.infoText}>
                  <Text style={styles.infoLabel}>Date: </Text>
                  {formatDate(photo.timestamp)}
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="contained"
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  Close
                </Button>
              </Card.Actions>
            </>
          )}
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalImage: {
    height: 300,
  },
  modalContent: {
    paddingVertical: 16,
  },
  infoText: {
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 8,
    backgroundColor: colors.primary
  },
});

export default PhotoModal;