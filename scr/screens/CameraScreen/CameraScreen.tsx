import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import { launchCamera, CameraOptions, Asset } from 'react-native-image-picker';
import { getCurrentCoordinates } from '../../services/locationService';
import { addPhoto } from '../../services/firebaseService';
import { Coordinates } from '../../types';
import { usePhotos } from '../../context/PhotoContext';

const CameraScreen: React.FC = () => {
    const [photo, setPhoto] = useState<string | null>(null);
    const [location, setLocation] = useState<Coordinates | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { refreshPhotos } = usePhotos();

    const requestCameraPermission = async (): Promise<boolean> => {
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

    const captureImage = async () => {
        if (!hasCameraPermission) {
            Alert.alert('Permission required', 'Camera permission is needed to take photos');
            return;
        }

        const options: CameraOptions = {
            mediaType: 'photo',
            quality: 0.7,
            saveToPhotos: false,
            includeBase64: false,
        };


        launchCamera(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets[0].uri) {
                const asset: Asset = response.assets[0];
                setPhoto(asset.uri ?? null);

                try {
                    const coords = await getCurrentCoordinates();
                    setLocation(coords);
                } catch (error) {
                    console.warn('Error getting location:', error);
                }
            }
        });
    };

    const uploadPhoto = async () => {
        if (!photo || !location) {
            Alert.alert('Error', 'Photo and location are required');
            return;
        }

        try {
            setIsUploading(true);
            await addPhoto({
                url: photo,
                latitude: location.latitude,
                longitude: location.longitude
            });
            Alert.alert('Success', 'Photo uploaded successfully');
            setPhoto(null);
            await refreshPhotos(); 
        } catch (error) {
            Alert.alert('Error', 'Failed to upload photo');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        const initialize = async () => {
            const permission = await requestCameraPermission();
            setHasCameraPermission(permission);
        };
        initialize();
    }, []);

    return (
        <View style={styles.container}>
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

            {isUploading && <ActivityIndicator size="large" />}

            {photo && (
                <View style={styles.preview}>
                    <Image
                        source={{ uri: photo }}
                        style={styles.image}
                    />
                    {location && (
                        <Text style={styles.coordinates}>
                            Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    preview: {
        marginVertical: 20,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        marginBottom: 10,
    },
    coordinates: {
        fontSize: 14,
        color: '#666',
    },
});

export default CameraScreen;