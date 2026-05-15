import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, MapPin } from 'lucide-react';
import type { Waypoint } from '../../types';

// CSS is imported globally in main.tsx

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:26px;height:26px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,.4);
      transform:rotate(-45deg)
    "></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -28],
  });
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [50, 50] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 11);
    }
  }, [map, positions]);
  return null;
}

interface TripMapModalProps {
  waypoints: Waypoint[];
  tripTitle: string;
  onClose: () => void;
}

export default function TripMapModal({ waypoints, tripTitle, onClose }: TripMapModalProps) {
  const positions: [number, number][] = waypoints.map((w) => [w.lat, w.lng]);

  const center: [number, number] =
    positions.length > 0
      ? positions[Math.floor(positions.length / 2)]
      : [31.7917, -7.0926];

  const iconStart  = makeIcon('#16a34a');
  const iconEnd    = makeIcon('#dc2626');
  const iconMiddle = makeIcon('#0ea5e9');

  const getIcon = (i: number) => {
    if (i === 0) return iconStart;
    if (i === waypoints.length - 1) return iconEnd;
    return iconMiddle;
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={handleBackdrop}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-sky-600" />
            <div>
              <p className="font-bold text-gray-900 text-sm">{tripTitle}</p>
              <p className="text-xs text-gray-500">
                {waypoints.length} étape{waypoints.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 px-5 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-600 inline-block" /> Départ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 inline-block" /> Étape
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 inline-block" /> Arrivée
          </span>
        </div>

        {/* Map */}
        <div style={{ height: '420px', flexShrink: 0 }}>
          <MapContainer
            center={center}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FitBounds positions={positions} />
            {positions.length > 1 && (
              <Polyline
                positions={positions}
                color="#0ea5e9"
                weight={3}
                dashArray="8 5"
                opacity={0.9}
              />
            )}
            {waypoints.map((wp, i) => (
              <Marker key={i} position={[wp.lat, wp.lng]} icon={getIcon(i)}>
                <Popup>
                  <strong>{wp.name}</strong>
                  {i === 0 && <div style={{ color: '#16a34a', fontSize: 11 }}>Départ</div>}
                  {i === waypoints.length - 1 && i !== 0 && (
                    <div style={{ color: '#dc2626', fontSize: 11 }}>Arrivée</div>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Itinerary strip */}
        <div className="px-5 py-3 border-t border-gray-200 shrink-0 overflow-x-auto">
          <ol className="flex items-center gap-1 flex-wrap">
            {waypoints.map((wp, i) => (
              <React.Fragment key={i}>
                <li
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    i === 0
                      ? 'bg-green-100 text-green-800'
                      : i === waypoints.length - 1
                      ? 'bg-red-100 text-red-800'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {wp.name}
                </li>
                {i < waypoints.length - 1 && (
                  <span className="text-gray-400 text-xs select-none">→</span>
                )}
              </React.Fragment>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
