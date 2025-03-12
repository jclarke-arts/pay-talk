import React, { useState, useRef, useEffect } from 'react';
import { Map, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import AudioPlayer from './AudioPlayer';
import SpatialAudioManager from './SpatialAudioManager';

export default function MapViewer({ locations }) {
  const [popupInfo, setPopupInfo] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const mapRef = useRef(null);
  const audioManagerRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Initialize audio manager on mount
  useEffect(() => {
    audioManagerRef.current = new SpatialAudioManager();
    
    // Load all audio files
    const loadAudioFiles = async () => {
      const promises = locations.map(location => {
        if (location.data.audioFile) {
          return audioManagerRef.current.loadAudio(
            location.slug, 
            location.data.audioFile
          );
        }
        return Promise.resolve(false);
      });
      
      await Promise.all(promises);
      setAudioLoaded(true);
    };
    
    loadAudioFiles();
    
    // Cleanup
    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.stopHoverAudio();
        audioManagerRef.current.stopPersistentAudio();
      }
    };
  }, [locations]);

  // Setup mouse move handler for hover audio
  useEffect(() => {
    if (!audioLoaded || !audioManagerRef.current || !mapRef.current) return;
    
    const handleMouseMove = (e) => {
      audioManagerRef.current.resumeAudioContext();
      audioManagerRef.current.handleMouseMove(e, locations, mapRef);
    };
    
    const mapContainer = mapRef.current.getContainer();
    mapContainer.addEventListener('mousemove', handleMouseMove);
    
    // Mouse leave event to stop audio when leaving the map
    const handleMouseLeave = () => {
      audioManagerRef.current.stopHoverAudio();
      setHovering(false);
    };
    
    mapContainer.addEventListener('mouseleave', handleMouseLeave);
    
    // Cleanup
    return () => {
      mapContainer.removeEventListener('mousemove', handleMouseMove);
      mapContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [locations, audioLoaded]);

  // Handle playing audio on explicit click
  const handlePlayAudio = (location) => {
    // Only set current track if there's an audio file
    if (location.data.audioFile) {
      // Stop hover audio
      if (audioManagerRef.current) {
        audioManagerRef.current.stopHoverAudio();
      }
      
      setCurrentTrack({
        audioSrc: location.data.audioFile,
        title: location.data.title
      });
    }
  };

  // Close audio player
  const closeAudioPlayer = () => {
    setCurrentTrack(null);
  };

  // Handle map interaction to activate audio context
  const handleMapInteraction = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.resumeAudioContext();
    }
  };

  return (
    <div className="relative h-full">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: import.meta.env.PUBLIC_DEFAULT_LONGITUDE || 2.294481,
          latitude: import.meta.env.PUBLIC_DEFAULT_LATITUDE || 48.858372,
          zoom: 12
        }}
        onClick={handleMapInteraction}
        onTouchStart={handleMapInteraction}
        style={{ width: '100%', height: '100vh' }}
        mapStyle={import.meta.env.PUBLIC_MAPBOX_STYLE_URI || "mapbox://styles/mapbox/streets-v11"}
        mapboxAccessToken={import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN}
      >
        {locations.map((location) => (
          <Marker
            key={location.slug}
            longitude={location.data.coordinates[1]}
            latitude={location.data.coordinates[0]}
            anchor="bottom"
            className='text-3xl'
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
              <h3 className="">{popupInfo.data.title}</h3>
              <p>{popupInfo.body}</p>
              
              {popupInfo.data.audioFile && (
                <button 
                  onClick={() => handlePlayAudio(popupInfo)}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md flex items-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                  Play Full Audio Guide
                </button>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* Help text for spatial audio feature */}
      {/* <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md max-w-xs z-10">
        <h3 className="text-sm font-medium mb-1">🔊 Spatial Audio Enabled</h3>
        <p className="text-xs text-gray-600">Move your cursor close to pins to hear location audio. The closer you get, the louder it plays!</p>
      </div> */}
      
      {/* Persistent audio player */}
      <AudioPlayer currentTrack={currentTrack} onClose={closeAudioPlayer} />
    </div>
  );
}