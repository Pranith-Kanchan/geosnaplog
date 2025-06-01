import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import { launchCamera, CameraOptions, Asset } from 'react-native-image-picker';
import { getCurrentCoordinates } from '../../services/locationService';
import { addPhoto } from '../../services/firebaseService';
import { Coordinates } from '../../types';
import { usePhotos } from '../../context/PhotoContext';
import { Button, Card, Text, ActivityIndicator, Avatar } from 'react-native-paper';
import placeholderImage from '../../assets/images/PhotouPloadPlaceholder.jpg';
import colors from '../../utils/colors';

const CameraScreen: React.FC = () => {
    const [photo, setPhoto] = useState<string | null>(null);
    const [location, setLocation] = useState<Coordinates | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { refreshPhotos } = usePhotos();
    const [currentTime, setCurrentTime] = useState('');
    const userName = "John Doe";

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) {
                setCurrentTime('Good Morning');
            } else if (hour < 18) {
                setCurrentTime('Good Afternoon');
            } else {
                setCurrentTime('Good Evening');
            }
        };

        updateGreeting();
    }, []);

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

    const deleteImage = () => {
        setPhoto(null);
        setLocation(null);
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
            setLocation(null);
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
            <View style={styles.profileHeader}>
                <Avatar.Image
                    source={require('../../assets/images/avatar.jpg')}
                    size={50}
                    style={styles.avatar}
                />
                <View style={styles.profileText}>
                    <Text style={styles.greeting}>{currentTime}</Text>
                    <Text style={styles.userName}>{userName}</Text>
                </View>
            </View>
            {
                photo ?
                    <Card.Content style={styles.card1}>
                        {isUploading && <ActivityIndicator animating={true} style={styles.loader} />}
                        <>
                            <Card.Cover
                                source={photo ? { uri: photo } : placeholderImage}
                                style={styles.image}
                            />

                            {location && (
                                <Text style={styles.coordinates}>
                                    Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                </Text>
                            )}
                            <Button
                                mode="outlined"
                                onPress={deleteImage}
                                disabled={isUploading}
                                style={styles.buttondelte}
                                icon="delete"
                                textColor="#ff6666"
                            >
                                Delete Image
                            </Button>
                        </>

                        <Button
                            mode="contained"
                            onPress={captureImage}
                            disabled={!hasCameraPermission}
                            style={styles.button}
                            icon="camera"
                        >
                            {photo ? 'Capture New Image' : 'Capture Image'}
                        </Button>

                        <Button
                            mode="contained"
                            onPress={uploadPhoto}
                            disabled={isUploading}
                            style={styles.button}
                            loading={isUploading}
                            icon="cloud-upload"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Photo'}
                        </Button>

                    </Card.Content>
                    : <Card.Content style={styles.card}>
                        <Card.Cover
                            source={placeholderImage}
                            style={styles.imagePlaceholder}
                        />
                        <Text variant="titleMedium" style={styles.titleMedium} >Geo-Tagged Photo Capture</Text>
                        <Text variant="titleSmall" style={styles.titleSmall} >Press the camera button to take a photo that will be saved with your GPS location</Text>
                        {!photo && <Button
                            mode="contained"
                            onPress={captureImage}
                            disabled={!hasCameraPermission}
                            style={styles.button}
                            icon="camera"
                        >
                           Capture Image
                        </Button>}
                    </Card.Content>

            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: colors.white,
    },
    card: {
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card1: {
        marginBottom: 16,
        borderStyle:'dotted',
        borderWidth: 2,
        borderColor: colors.secondary,
        borderRadius: 10,
        padding: 16,
    },
    button: {
        marginVertical: 8,
        backgroundColor: colors.primary,
    },
    buttondelte: {
        marginVertical: 8,
        borderColor: colors.error,
        borderWidth: 1,
    },
    image: {
        height: 400,
        marginBottom: 8,
    },
    imagePlaceholder: {
        height: '60%',
        width: '100%',
        marginBottom: 8,
        resizeMode: 'contain',
        marginTop: '10%',
    },
    coordinates: {
        fontSize: 14,
        color: colors.placeholder,
        textAlign: 'center',
        marginBottom: 8,
    },
    loader: {
        marginVertical: 16,
    }, profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        marginRight: 15,
        backgroundColor: colors.primary,
        borderColor: colors.secondary,
    },
    profileText: {
        flexDirection: 'column',
    },
    greeting: {
        fontSize: 14,
        lineHeight: 14,
        color: colors.secondary,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 21,
        color: colors.primary
    }, titleMedium: {
        textAlign: 'center',
        color: colors.placeholder,
        marginBottom:3
    },
    titleSmall: {
        textAlign: 'center',
        marginBottom: 15,
        color: colors.secondary,
    }
});

export default CameraScreen;