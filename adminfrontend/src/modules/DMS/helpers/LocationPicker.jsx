import React, { useRef, useState, useEffect } from "react";
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";
import { Input } from "antd";

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "300px",
  borderRadius: "6px",
};

const DEFAULT_CENTER = {
  lat: 20.5937, // India center
  lng: 78.9629,
};

export default function LocationPicker({ value, onChange }) {
  const autocompleteRef = useRef(null);
  const [location, setLocation] = useState(value || null);

  useEffect(() => {
    if (value) setLocation(value);
  }, [value]);

  const updateLocation = (data) => {
    setLocation(data);
    onChange?.(`${data.lat},${data.lng}`);
  };  

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry) return;

    updateLocation({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      address: place.formatted_address,
    });
  };

  const handleMapClick = (e) => {
    updateLocation({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  return (
    <>
      <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={handlePlaceChanged}
      >
        <Input
          placeholder="Search location"
          style={{ marginBottom: 8 }}
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={location || DEFAULT_CENTER}
        zoom={location ? 15 : 5}
        onClick={handleMapClick}
      >
        {location && <Marker position={location} />}
      </GoogleMap>
    </>
  );
}
