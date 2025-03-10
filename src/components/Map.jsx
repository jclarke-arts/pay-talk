import React, { useState } from 'react';
import { Map, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapViewer({ locations }) {
  const [popupInfo, setPopupInfo] = useState(null);

  return (
    <Map
      initialViewState={{
        longitude: import.meta.env.PUBLIC_DEFAULT_LONGITUDE,
        latitude: import.meta.env.PUBLIC_DEFAULT_LATITUDE,
        zoom: 12
      }}
      style={{ width: '100%', height: '100vh' }}
      mapStyle={import.meta.env.PUBLIC_MAPBOX_STYLE_URI}
      mapboxAccessToken={import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN}
    >
      {locations.map((location) => (
        <Marker
          key={location.slug}
          longitude={location.data.coordinates[1]}
          latitude={location.data.coordinates[0]}
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            setPopupInfo(location);
          }}
        >
          📍
        </Marker>
      ))}

      {popupInfo && (
        <Popup
          anchor="top"
          longitude={popupInfo.data.coordinates[1]}
          latitude={popupInfo.data.coordinates[0]}
          onClose={() => setPopupInfo(null)}
        >
          <div className="popup">
            <h3>{popupInfo.data.title}</h3>
            <p>{popupInfo.body}</p>
          </div>
        </Popup>
      )}
    </Map>
  );
}