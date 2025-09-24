import React, { useState, useEffect } from 'react';

// Handle sidebar toggle
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };


export default function LocationListSidebar({ locations, mapRef, onLocationSelect, onToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  // Sort locations by number
  const sortedLocations = [...locations].sort((a, b) => 
    parseInt(a.data.number) - parseInt(b.data.number)
  );
  
  // Filter locations based on active filter and search
  const filteredLocations = sortedLocations.filter(location => {
    const matchesFilter = !activeFilter || 
      (location.data.filters && location.data.filters.includes(activeFilter));
    const matchesSearch = !searchTerm || 
      location.data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.body.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  // Get unique filters and counts
  const allFilters = [...new Set(
    locations.flatMap(loc => loc.data.filters || [])
  )].sort();
  
  // Count locations for each filter
  const filterCounts = {};
  allFilters.forEach(filter => {
    filterCounts[filter] = locations.filter(
      location => location.data.filters && location.data.filters.includes(filter)
    ).length;
  });
  
  // Listen for filter changes from the map and read from URL
  useEffect(() => {
    // Read filter from URL on mount
    const url = new URL(window.location);
    const filterParam = url.searchParams.get('filter');
    if (filterParam) {
      setActiveFilter(filterParam);
    }
    
    const handleFilterChange = (event) => {
      setActiveFilter(event.detail);
    };
    
    window.addEventListener('filterChange', handleFilterChange);
    return () => window.removeEventListener('filterChange', handleFilterChange);
  }, []);
  
  // Handle filter selection (matching FilterToggle behavior)
  const handleFilterSelect = (filter) => {
    // If the same filter is clicked again, clear it (toggle behavior)
    const newFilter = filter === activeFilter ? null : filter;
    setActiveFilter(newFilter);
    
    // Update URL with query param
    const url = new URL(window.location);
    if (newFilter) {
      url.searchParams.set('filter', newFilter);
    } else {
      url.searchParams.delete('filter');
    }
    
    // Update browser history without refreshing the page
    window.history.pushState({}, '', url);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('filterChange', { detail: newFilter }));
    
    // Close dropdown after selection
    setIsFilterDropdownOpen(false);
  };
  
  // Handle sidebar toggle
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };
  
  // Handle location click - zoom to location on map
  const handleLocationClick = (location) => {
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setIsOpen(false);
      if (onToggle) {
        onToggle(false);
      }
    }
    
    // Call the parent's location select handler
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    
    // Zoom to the location if map reference is available
    if (mapRef && mapRef.current) {
      mapRef.current.flyTo({
        center: [location.data.coordinates[1], location.data.coordinates[0]],
        zoom: 16,
        duration: 1500
      });
    }
  };
  
  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterDropdownOpen && !event.target.closest('.filter-dropdown-container')) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);
  
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed left-4 bottom-4 z-30 p-3 shadow-lg transition-all duration-300 ${
          isOpen ? 'translate-x-80 md:translate-x-96 bg-black text-yp-yellow hover:bg-yp-yellow hover:text-black' : 'bg-black text-yp-yellow hover:bg-yp-yellow hover:text-black'
        }`}
        aria-label="Toggle location list"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={2} 
          stroke="currentColor" 
          className="w-6 h-6"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          )}
        </svg>
      </button>
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 md:w-96 bg-white shadow-2xl z-30 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="bg-yp-yellow p-4 border-b-2 border-black">
          <h2 className="text-xl font-black text-black mb-3">All Locations</h2>
          
          <div className="flex space-x-2">
            {/* Search */}
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 border-2 border-black text-sm mb-3 w-2/3"
            />
            
            {/* Filter Dropdown (matching FilterToggle style) */}
            <div className="relative filter-dropdown-container w-1/3">
              <button 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`cursor-pointer flex text-xs items-center py-2 px-2 space-x-2 w-full ${
                  activeFilter ? 'bg-yp-yellow border-yp-black text-black' : 'bg-black border-black text-yp-yellow'
                } border-2 transition-colors`}
              >
                <span className="flex-1 text-left">{activeFilter || 'Filter'}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 ml-1 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isFilterDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border-2 border-black z-30 max-h-64 overflow-y-auto">
                  <div className="py-1">
                    <button
                      onClick={() => handleFilterSelect(null)}
                      className={`block w-full text-left px-4 py-2 text-xs hover:bg-yp-yellow hover:text-black transition-colors ${
                        !activeFilter ? 'font-bold bg-yp-yellow' : ''
                      }`}
                    >
                      All Filters <span className="text-xs text-gray-500 ml-1">({locations.length})</span>
                    </button>
                    
                    {allFilters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => handleFilterSelect(filter)}
                        className={`block w-full text-left px-4 py-2 text-xs hover:bg-yp-yellow hover:text-black transition-colors ${
                          activeFilter === filter ? 'font-bold bg-yp-yellow' : ''
                        }`}
                      >
                        {filter} <span className="text-xs text-gray-500 ml-1">({filterCounts[filter]})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-2 text-xs text-black">
            {filteredLocations.length} of {locations.length} locations
          </div>
        </div>
        
        {/* Location List */}
        <div className="overflow-y-auto h-[calc(100vh-180px)]">
          {filteredLocations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No locations found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLocations.map((location) => (
                <button
                  key={location.slug}
                  onClick={() => handleLocationClick(location)}
                  className="w-full text-left p-4 hover:bg-yp-yellow transition-colors group cursor-pointer"
                >
                  {/* Number and Title */}
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-black text-white text-xs px-2 py-1 font-bold flex-shrink-0">
                      {location.data.number}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-black transition-colors">
                        {location.data.title}
                      </h3>
                      {location.data.address && (
                        <p className="text-xs text-gray-500 mt-1">
                          {location.data.address}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Filters */}
                  {location.data.filters && location.data.filters.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2 ml-9">
                      {location.data.filters.map(filter => (
                        <span 
                          key={filter}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600"
                        >
                          {filter}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Description */}
                  <p className="text-xs text-gray-700 line-clamp-3 ml-9 font-serif">
                    {location.body}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}