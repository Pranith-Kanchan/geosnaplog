import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, RefreshControl, StatusBar } from 'react-native';
import {
  Card,
  Text,
  ActivityIndicator,
  Appbar,
  IconButton
} from 'react-native-paper';
import { Photo } from '../../types';
import { usePhotos } from '../../context/PhotoContext';
import PhotoModal from '../../components/PhotoModal';
import colors from '../../utils/colors';

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
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <StatusBar backgroundColor={colors.primary} />
      <Appbar.Header style={{ backgroundColor: 'rgba(214, 230, 255, 0.0.5)' }}>
        <Appbar.Content title="Photo Gallery" />
        <Appbar.Action icon="magnify" onPress={() => { }} />
      </Appbar.Header>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card
            style={[styles.card, { backgroundColor: colors.white }]}
            onPress={() => setSelectedPhoto(item)}
          >
            <Card.Content style={styles.cardContent}>
              <Image
                source={item.url ? { uri: item.url } : require('../../assets/images/avatar.jpg')}
                style={styles.thumbnail}
              />
              <View style={styles.textContainer}>
                <Text variant="titleMedium" style={[styles.date, { color: colors.placeholder }]}>
                  {formatDate(item.timestamp)}
                </Text>
                <View style={styles.locationContainer}>
                  <IconButton
                    icon="map-marker"
                    size={16}
                    iconColor={colors.primary}
                    style={styles.locationIcon}
                  />
                  <Text variant="bodySmall" style={[styles.coordinates, { color: colors.darkGray}]}>
                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>
              <IconButton
                icon="chevron-right"
                size={24}
                iconColor={colors.black}
              />
            </Card.Content>
          </Card>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton
              icon="image-off"
              size={78}
              iconColor={colors.lightGray}
            />
            <Text variant="titleMedium" style={{ color: 'ligghtgray' }}>
              No photos available
            </Text>
            {/* <Button
              mode="contained"
              onPress={onRefresh}
              style={styles.refreshButton}
              icon="refresh"
            >
              Refresh
            </Button> */}
          </View>
        }
      />

      <PhotoModal
        visible={!!selectedPhoto}
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />

      {refreshing && (
        <ActivityIndicator
          animating={true}
          size="large"
          style={styles.loader}
          color={colors.primary}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  date: {
    marginBottom: 4,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    margin: 0,
    marginLeft: -8,
    marginRight: -4,
  },
  coordinates: {
    opacity: 0.8,
  },
  divider: {
    marginVertical: 4,
    height: 1,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  refreshButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
  },
});

export default GalleryScreen;