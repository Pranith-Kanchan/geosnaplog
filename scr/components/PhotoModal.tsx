import React from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback, Image } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { Photo } from '../types';
import colors from '../utils/colors';

interface PhotoModalProps {
  visible: boolean;
  photo: Photo | null;
  onClose: () => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ visible, photo, onClose }) => {
  const [fullScreen, setFullScreen] = React.useState(false);

  const formatDate = (date: Date): string => {
    return date.toLocaleString();
  };

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  };

  if (fullScreen) {
    return (
      <Modal
        visible={visible}
        transparent={false}
        onRequestClose={() => {
          setFullScreen(false);
          onClose();
        }}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={toggleFullScreen}>
          <View style={styles.fullScreenContainer}>
            <Image 
              source={{ uri: photo?.url }} 
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

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
              <TouchableWithoutFeedback onPress={toggleFullScreen}>
                <Card.Cover 
                  source={{ uri: photo.url }} 
                  style={styles.modalImage}
                />
              </TouchableWithoutFeedback>
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
                  {formatDate(new Date(photo.timestamp.toString()))}
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
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});

export default PhotoModal;