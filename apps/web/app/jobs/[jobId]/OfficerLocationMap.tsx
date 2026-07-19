'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet';

export function OfficerLocationMap({ center }: { center: [number, number] }) {
  return (
    <MapContainer center={center} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }} zoom={17} zoomControl={false}>
      <MapUpdater center={center} />
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <CircleMarker center={center} pathOptions={{ color: '#FF3B30', fillColor: '#FF3B30', fillOpacity: 0.25, weight: 2 }} radius={12} />
    </MapContainer>
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}
