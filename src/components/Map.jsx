import React, { useState, useRef, useEffect } from 'react';
import { Map, Marker } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import AudioPlayer from './AudioPlayer';
import SpatialAudioManager from './SpatialAudioManager';
import Modal from './Modal';
import FilterToggle from './FilterToggle';
import AboutModal from './AboutModal';

export default function MapViewer({ locations }) {
  const [modalInfo, setModalInfo] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const mapRef = useRef(null);
  const audioManagerRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Initialize audio manager on mount
  // useEffect(() => {
  //   audioManagerRef.current = new SpatialAudioManager();
    
  //   // Load all audio files
  //   const loadAudioFiles = async () => {
  //     const promises = locations.map(location => {
  //       if (location.data.audioFile) {
  //         return audioManagerRef.current.loadAudio(
  //           location.slug, 
  //           location.data.audioFile
  //         );
  //       }
  //       return Promise.resolve(false);
  //     });
      
  //     await Promise.all(promises);
  //     setAudioLoaded(true);
  //   };
    
  //   loadAudioFiles();
    
  //   // Cleanup
  //   return () => {
  //     if (audioManagerRef.current) {
  //       audioManagerRef.current.stopHoverAudio();
  //       audioManagerRef.current.stopPersistentAudio();
  //     }
  //   };
  // }, [locations]);

  // Check URL for filter param on initial load and listen for filter change events
  useEffect(() => {
    // Read filter from URL
    const url = new URL(window.location);
    const filterParam = url.searchParams.get('filter');
    if (filterParam) {
      setActiveFilter(filterParam);
    }
    
    // Listen for filter change events from modal
    const handleFilterChange = (event) => {
      setActiveFilter(event.detail);
    };
    
    window.addEventListener('filterChange', handleFilterChange);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('filterChange', handleFilterChange);
    };
  }, []);

  // Apply filtering when activeFilter changes and animate the map
  useEffect(() => {
    if (!activeFilter) {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(location => 
        location.data.filters && 
        location.data.filters.includes(activeFilter)
      );
      setFilteredLocations(filtered);
      
      // Animate map if we have a map reference and locations to focus on
      if (mapRef.current && filtered.length > 0) {
        // Calculate bounds that include all filtered locations
        const bounds = filtered.reduce(
          (bounds, location) => {
            bounds.extend([
              location.data.coordinates[1],
              location.data.coordinates[0],
            ]);
            return bounds;
          },
          new mapboxgl.LngLatBounds()
        );
        
        // Animate to these bounds
        mapRef.current.fitBounds(bounds, {
          padding: 100,
          duration: 1000,
          maxZoom: 14, // Don't zoom in too far
        });
      }
    }
  }, [activeFilter, locations]);

  // Setup mouse move handler for hover audio
  // useEffect(() => {
  //   if (!audioLoaded || !audioManagerRef.current || !mapRef.current) return;
    
  //   const handleMouseMove = (e) => {
  //     audioManagerRef.current.resumeAudioContext();
  //     audioManagerRef.current.handleMouseMove(e, filteredLocations, mapRef);
  //   };
    
  //   const mapContainer = mapRef.current.getContainer();
  //   mapContainer.addEventListener('mousemove', handleMouseMove);
    
  //   // Mouse leave event to stop audio when leaving the map
  //   const handleMouseLeave = () => {
  //     audioManagerRef.current.stopHoverAudio();
  //     setHovering(false);
  //   };
    
  //   mapContainer.addEventListener('mouseleave', handleMouseLeave);
    
  //   // Cleanup
  //   return () => {
  //     mapContainer.removeEventListener('mousemove', handleMouseMove);
  //     mapContainer.removeEventListener('mouseleave', handleMouseLeave);
  //   };
  // }, [filteredLocations, audioLoaded]);

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

  // Close modal
  const closeModal = () => {
    setModalInfo(null);
  };

  // Toggle about modal
  const toggleAboutModal = () => {
    setIsAboutModalOpen(!isAboutModalOpen);
  };

  return (
    <div className="relative h-full">
      {/* Header with logo and info button */}
      <div className="fixed z-20 w-full p-2 flex justify-between">
        <div className="p-3">
          <p className="font-serif text-5xl text-p60-blue inline-block tracking-tight">
            <span className="italic stroke">Pay</span>
            <span className="ml-0.5 translate-y-0.5 inline-block font-sans tracking-[-0.3rem]">talk</span>
          </p>
        </div>
        <button
          onClick={toggleAboutModal}
          className="p-3 m-3 bg-p60-blue border-p60-paper border-3 hover:bg-p60-orange transform cursor-pointer text-p60-paper rounded-full w-12 h-12 flex justify-center items-center transition-colors"
          aria-label="About this project"
        >
          <p className="text-4xl font-serif italic translate-y-0.5 -translate-x-0.25">i</p>
        </button>
      </div>
      
      <FilterToggle 
        locations={locations} 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter} 
      />
      
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: import.meta.env.PUBLIC_DEFAULT_LONGITUDE,
          latitude: import.meta.env.PUBLIC_DEFAULT_LATITUDE,
          zoom: 12
        }}
        logoPosition='bottom-right'
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
        {filteredLocations.map((location) => (
          <Marker
            key={location.slug}
            longitude={location.data.coordinates[1]}
            latitude={location.data.coordinates[0]}
            anchor="bottom"
            className={`text-5xl cursor-pointer transition-transform ${activeFilter ? 'filter-active' : ''}`}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setModalInfo(location);
            }}
          >
            
            📍
          </Marker>
        ))}
      </Map>

      {/* Custom Modal */}
      <Modal 
        info={modalInfo} 
        onClose={closeModal} 
        onPlayAudio={handlePlayAudio} 
      />
      
      {/* About Modal */}
      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={() => setIsAboutModalOpen(false)} 
      />
      
      {/* Persistent audio player */}
      <AudioPlayer currentTrack={currentTrack} onClose={closeAudioPlayer} />
    </div>
  );
}