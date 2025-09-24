import React, { useState, useRef, useEffect } from 'react';
import { Map, Marker, Popup } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import AboutModal from './AboutModal';
import LocationListSidebar from './ListSidebar';

export default function MapViewer({ locations }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const mapRef = useRef(null);

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
          maxZoom: 16, // Don't zoom in too far
        });
      }
    }
  }, [activeFilter, locations]);

  // Add ESC key handler for closing popup
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && selectedLocation) {
        setSelectedLocation(null);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [selectedLocation]);

  // Helper to navigate to filtered view
  const navigateToFilter = (filter) => {
    const url = new URL(window.location);
    url.searchParams.set('filter', filter);
    window.history.pushState({}, '', url);
    setSelectedLocation(null);
    window.dispatchEvent(new CustomEvent('filterChange', { detail: filter }));
  };

  // Toggle about modal
  const toggleAboutModal = () => {
    setIsAboutModalOpen(!isAboutModalOpen);
  };

  return (
    <div className="relative h-full">
      {/* Header with logo and info button */}
      <div className="fixed z-20 w-full flex justify-between">
        <div className="p-1 bg-yp-yellow m-3 rounded-xl">
          <img src="/logo.svg" className="w-20" />
        </div>
        <button
          onClick={toggleAboutModal}
          className="py-2 px-4 m-3 h-fit bg-black text-yp-yellow transform cursor-pointer flex justify-center items-center transition-colors"
          aria-label="About this project"
        >
          <p className="text-2xl">?</p>
        </button>
      </div>
    
      
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: import.meta.env.PUBLIC_DEFAULT_LONGITUDE,
          latitude: import.meta.env.PUBLIC_DEFAULT_LATITUDE,
          zoom: 12.5
        }}
        logoPosition='bottom-right'
        style={{ width: '100%', height: '100vh' }}
        mapStyle={import.meta.env.PUBLIC_MAPBOX_STYLE_URI || "mapbox://styles/mapbox/streets-v11"}
        mapboxAccessToken={import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN}
        maxBounds={[
          [-0.190, 51.43],
          [0.006876, 51.50]
        ]}
        dragRotate={false}
        maxZoom={14.75}
        minZoom={12}
      >
        {/* <Marker 
          key="camberwell" 
          latitude={51.474041} 
          longitude={(-0.080667)} 
          anchor="center" 
          className={`font-sans text-xs px-1 py-0.5 min-w-4 text-center text-yp-yellow bg-black cursor-pointer`}
        >
          <span>Home</span>
        </Marker> */}
        
        {filteredLocations.map((location) => (
          <Marker
            key={location.slug}
            longitude={location.data.coordinates[1]}
            latitude={location.data.coordinates[0]}
            anchor="bottom"
            className={`font-sans text-xs px-1 py-0.5 min-w-4 text-center text-yp-yellow bg-black cursor-pointer transition-colors hover:bg-gray-800 ${activeFilter ? 'filter-active' : ''}`}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedLocation(location);
            }}
          >
            <span>{location.data.number}</span>
          </Marker>
        ))}

        {/* Popup attached to map coordinates */}
        {selectedLocation && (
          <Popup
            longitude={selectedLocation.data.coordinates[1]}
            latitude={selectedLocation.data.coordinates[0]}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => setSelectedLocation(null)}
            offset={[0, -10]}
            className="mapbox-popup-custom"
            maxWidth="320px"
          >
            <div className="bg-white rounded-sm font-sans">
              {/* Header */}
              <div className="px-3 py-2 flex items-center justify-between bg-yp-yellow border-b-2 border-black mb-0">
                <h2 className="text-sm font-bold font-sans text-black truncate pr-2">
                  #{selectedLocation.data.number} {selectedLocation.data.title}
                </h2>
                <button 
                  onClick={() => setSelectedLocation(null)}
                  className="text-black hover:text-white transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="p-3 max-h-60 overflow-y-auto">
                {/* Filters */}
                {selectedLocation.data.filters && selectedLocation.data.filters.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {selectedLocation.data.filters.map(filter => (
                      <button 
                        key={filter}
                        onClick={() => navigateToFilter(filter)}
                        className="bg-black text-yp-yellow text-xs px-2 py-0.5 rounded-sm hover:bg-gray-800 transition-colors"
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Description */}
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {selectedLocation.body}
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* Location List Sidebar */}
      <LocationListSidebar 
        locations={locations}
        mapRef={mapRef}
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter} 
        onLocationSelect={setSelectedLocation}
      />
      
      {/* About Modal */}
      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={() => setIsAboutModalOpen(false)} 
      />
      
      {/* Custom styles for the popup */}
      <style jsx global>{`
        .mapbox-popup-custom .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 0.125rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          border: 2px solid black;
        }
        
        .mapbox-popup-custom .mapboxgl-popup-close-button {
          display: none;
        }
        
        .mapbox-popup-custom .mapboxgl-popup-tip {
          border-top-color: black !important;
        }
      `}</style>
    </div>
  );
}