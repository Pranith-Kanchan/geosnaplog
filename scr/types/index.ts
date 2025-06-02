export type Photo = {
  id: string;
  url: string;
  latitude: number;
  longitude: number;
  timestamp: String;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
