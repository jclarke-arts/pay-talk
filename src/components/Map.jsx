import React, { useState, useRef, useEffect } from 'react';
import { Map, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import AudioPlayer from './AudioPlayer';
import SpatialAudioManager from './SpatialAudioManager';
import Modal from './Modal';

export default function MapViewer({ locations }) {
  const [modalInfo, setModalInfo] = useState(null);
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

  // Close modal - now handled by the Modal component with animation
  const closeModal = () => {
    setModalInfo(null);
  };

  return (
    <div className="relative h-full">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: import.meta.env.PUBLIC_DEFAULT_LONGITUDE,
          latitude: import.meta.env.PUBLIC_DEFAULT_LATITUDE,
          zoom: 12
        }}
        onClick={handleMapInteraction}
        onTouchStart={handleMapInteraction}
        style={{ width: '100%', height: '100vh' }}
        mapStyle={import.meta.env.PUBLIC_MAPBOX_STYLE_URI || "mapbox://styles/mapbox/streets-v11"}
        mapboxAccessToken={import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN}
        maxBounds={[
          [-0.389, 51.38],
          [0.136, 51.536]
        ]}
        dragRotate={false}
        maxZoom={14}
        minZoom={11}
      >
        {locations.map((location) => (
          <Marker
            key={location.slug}
            longitude={location.data.coordinates[1]}
            latitude={location.data.coordinates[0]}
            anchor="bottom"
            className='text-5xl cursor-pointer'
            onClick={e => {
              e.originalEvent.stopPropagation();
              setModalInfo(location);
            }}
          >
            📍
          </Marker>
        ))}
      </Map>

      {/* Custom Modal instead of Popup */}
      <Modal 
        info={modalInfo} 
        onClose={closeModal} 
        onPlayAudio={handlePlayAudio} 
      />
      
      {/* Persistent audio player */}
      <AudioPlayer currentTrack={currentTrack} onClose={closeAudioPlayer} />
    </div>
  );
}