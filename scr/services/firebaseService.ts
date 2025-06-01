import firestore from '@react-native-firebase/firestore';
import { Photo } from '../types';

export const getPhotos = async (): Promise<Photo[]> => {
  try {
    const snapshot = await firestore().collection('photos').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      latitude: parseFloat(doc.data().latitude) || 0,
      longitude: parseFloat(doc.data().longitude) || 0,
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as Photo[];
  } catch (error) {
    console.error('Error getting photos:', error);
    throw error;
  }
};

export const addPhoto = async (photoData: Omit<Photo, 'id' | 'timestamp'>): Promise<Photo> => {
  try {
    const docRef = await firestore().collection('photos').add({
      ...photoData,
      latitude: photoData.latitude.toString(),
      longitude: photoData.longitude.toString(),
      timestamp: firestore.FieldValue.serverTimestamp()
    });
    return { 
      id: docRef.id, 
      ...photoData,
      timestamp: new Date().toISOString() 
    };
  } catch (error) {
    console.error('Error adding photo:', error);
    throw error;
  }
};