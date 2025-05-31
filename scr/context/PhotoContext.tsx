import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPhotos } from '../services/firebaseService';
import { Photo } from '../types';

type PhotoContextType = {
  photos: Photo[];
  refreshPhotos: () => Promise<void>;
};

const PhotoContext = createContext<PhotoContextType>({
  photos: [],
  refreshPhotos: async () => {},
});

export const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const refreshPhotos = async () => {
    try {
      const loadedPhotos = await getPhotos();
      setPhotos(loadedPhotos);
    } catch (error) {
      console.error('Error refreshing photos:', error);
    }
  };

  useEffect(() => {
    refreshPhotos();
  }, []);

  return (
    <PhotoContext.Provider value={{ photos, refreshPhotos }}>
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhotos = () => useContext(PhotoContext);