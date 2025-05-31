import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import CameraScreen from '../screens/CameraScreen/CameraScreen';
import MapScreen from '../screens/MapScreen/MapScreen';
import GalleryScreen from '../screens/GalleryScreen/GalleryScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
    MainTabs: undefined;
};

type MainTabParamList = {
    Camera: undefined;
    Map: undefined;
    Gallery: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string = 'help';

                    if (route.name === 'Camera') {
                        iconName = focused ? 'camera' : 'camera-outline';
                    } else if (route.name === 'Map') {
                        iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === 'Gallery') {
                        iconName = focused ? 'images' : 'images-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Camera" component={CameraScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Gallery" component={GalleryScreen} />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;