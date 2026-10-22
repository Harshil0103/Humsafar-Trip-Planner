import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';

// Fix Leaflet's default marker icons in React/Vite builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Create custom colored markers
function createColoredIcon(colorHex) {
  const markerHtml = `
    <div style="
      background-color: ${colorHex};
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: white;
        transform: rotate(45deg);
      "></div>
    </div>
  `;
  return L.divIcon({
    html: markerHtml,
    className: 'custom-leaflet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
}

const destinationIcon = createColoredIcon('#ef4444'); // Red
const hotelIcon = createColoredIcon('#4f46e5');       // Indigo
const activityIcon = createColoredIcon('#10b981');    // Green
const itineraryIcon = createColoredIcon('#0ea5e9');   // Sky blue

function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

export default function InteractiveMap({
  center = [35.0116, 135.7681], // Default Kyoto
  zoom = 12,
  markers = [],
  height = '420px',
  destinationName = 'Destination'
}) {
  const [hasMapError, setHasMapError] = useState(false);

  // Validate coordinates
  const validCenter = Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])
    ? center
    : [35.0116, 135.7681];

  // Filter valid markers
  const validMarkers = markers.filter(
    (m) => m && m.lat !== undefined && m.lng !== undefined && !isNaN(m.lat) && !isNaN(m.lng)
  );

  if (hasMapError) {
    return (
      <div className="card" style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-subtle)',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <AlertCircle size={36} color="var(--accent)" style={{ marginBottom: '1rem' }} />
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Map Visualization Offline</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '380px' }}>
          Interactive map preview could not be loaded. Location data is still safely saved and accessible.
        </p>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-color)' }}>
      <MapContainer
        center={validCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={validCenter} zoom={zoom} />

        {/* Center destination marker */}
        <Marker position={validCenter} icon={destinationIcon}>
          <Popup>
            <div style={{ padding: '0.25rem' }}>
              <strong style={{ fontSize: '0.95rem' }}>{destinationName}</strong>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Trip Center</div>
            </div>
          </Popup>
        </Marker>

        {/* Additional markers */}
        {validMarkers.map((m, idx) => {
          let icon = itineraryIcon;
          if (m.type === 'hotel') icon = hotelIcon;
          if (m.type === 'activity') icon = activityIcon;

          return (
            <Marker key={idx} position={[m.lat, m.lng]} icon={icon}>
              <Popup>
                <div style={{ padding: '0.25rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{m.title}</div>
                  {m.category && (
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>
                      {m.category}
                    </span>
                  )}
                  {m.subtitle && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.subtitle}</div>}
                  {m.cost !== undefined && m.cost > 0 && (
                    <div style={{ fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>₹{parseFloat(m.cost || 0).toLocaleString('en-IN')}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(8px)',
        padding: '0.5rem 0.85rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        zIndex: 500,
        fontSize: '0.75rem',
        display: 'flex',
        gap: '0.85rem',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          <span>Destination</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5' }} />
          <span>Stay</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span>Activity</span>
        </div>
      </div>
    </div>
  );
}
