'use client';

import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { GeoAlt } from 'react-bootstrap-icons';
import dynamic from 'next/dynamic';
import '@/lib/leafletIcons';

// Leaflet must be dynamically imported in Next.js (no SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

const MapPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setLocationError('Unable to retrieve your location.'),
    );
  }, []);

  const defaultCenter: [number, number] = [21.3069, -157.8583]; // Honolulu fallback

  return (
    <Container fluid className="p-0">
      <div className="p-3 border-bottom bg-white sticky-top">
        <h5 className="mb-1 text-center">Nearby Grocery Stores</h5>
      </div>

      {locationError && (
        <div className="alert alert-warning m-3">{locationError}</div>
      )}

      <div style={{ height: '70vh', minHeight: '400px' }}>
        <MapContainer
          center={userLocation ?? defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>You are here</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </Container>
  );
};

export default MapPage;