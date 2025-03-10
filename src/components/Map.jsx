import React, { useState } from 'react';
import { Map, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import AudioPlayer from './AudioPlayer';

export default function MapViewer({ locations }) {
  const [popupInfo, setPopupInfo] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);

  const handlePlayAudio = (location) => {
    // Only set current track if there's an audio file
    if (location.data.audioFile) {
      setCurrentTrack({
        audioSrc: location.data.audioFile,
        title: location.data.title
      });
    }
  };

  const closeAudioPlayer = () => {
    setCurrentTrack(null);
  };

  return (
    <div className="relative h-full">
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
              
              {popupInfo.data.audioFile && (
                <button 
                  onClick={() => handlePlayAudio(popupInfo)}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md flex items-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                  Play Audio Guide
                </button>
              )}
            </div>
          </Popup>
        )}
      </Map>
      
      <AudioPlayer currentTrack={currentTrack} onClose={closeAudioPlayer} />
    </div>
  );
}