import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import firestore from '@react-native-firebase/firestore';
import { Photo } from '../types';

const convertTimestamps = (data: any): any => {
  if (data === null || typeof data !== 'object') return data;
  
  if (data.toDate && typeof data.toDate === 'function') {
    return data.toDate().toISOString(); 
  }

  if (Array.isArray(data)) {
    return data.map(convertTimestamps);
  }

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, convertTimestamps(value)])
  );
};

export const firebaseApi = createApi({
  reducerPath: 'firebaseApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['Photo'],
  endpoints: (builder) => ({
    getPhotos: builder.query<Photo[], void>({
      async queryFn() {
        try {
          const snapshot = await firestore().collection('photos').get();
          const photos = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...convertTimestamps(data),
              latitude: parseFloat(data.latitude) || 0,
              longitude: parseFloat(data.longitude) || 0
            } as Photo;
          });
          return { data: photos };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Photo']
    }),
    addPhoto: builder.mutation<Photo, Omit<Photo, 'id' | 'timestamp'>>({
      async queryFn(photoData) {
        try {
          const docRef = await firestore().collection('photos').add({
            ...photoData,
            latitude: photoData.latitude.toString(),
            longitude: photoData.longitude.toString(),
            timestamp: firestore.FieldValue.serverTimestamp()
          });
          
          return { 
            data: { 
              id: docRef.id, 
              ...photoData,
              timestamp: new Date().toISOString() 
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Photo']
    })
  })
});

export const { useGetPhotosQuery, useAddPhotoMutation } = firebaseApi;