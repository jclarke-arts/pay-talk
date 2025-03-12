import React, { useEffect, useState } from 'react';

const FilterToggle = ({ locations, activeFilter, setActiveFilter }) => {
  const [filters, setFilters] = useState([]);
  const [filterCounts, setFilterCounts] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  // Extract unique filters and count occurrences
  useEffect(() => {
    const allFilters = locations
      .flatMap(location => location.data.filters || [])
      .filter(Boolean);
    
    // Get unique filter values
    const uniqueFilters = [...new Set(allFilters)].sort();
    
    // Count locations for each filter
    const counts = {};
    uniqueFilters.forEach(filter => {
      counts[filter] = locations.filter(
        location => location.data.filters && location.data.filters.includes(filter)
      ).length;
    });
    
    setFilters(uniqueFilters);
    setFilterCounts(counts);
  }, [locations]);

  // Toggle the filter dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Handle filter selection
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
    
    // Close dropdown after selection
    setIsOpen(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilter(null);
    const url = new URL(window.location);
    url.searchParams.delete('filter');
    window.history.pushState({}, '', url);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.filter-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="absolute bottom-4 left-4 z-60 filter-dropdown">
      <div className="relative">
        <button 
          onClick={toggleDropdown}
          className={`cursor-pointer flex text-xs items-center pr-1 space-x-2 ${activeFilter ? 'bg-p60-orange border-p60-orange text-p60-paper hover:text-p60-orange' : 'bg-p60-paper border-p60-blue text-p60-blue '} border-2 rounded-sm transition-colors`}
        >
          <div className={`${activeFilter ? "bg-p60-orange" : 'bg-p60-blue'} py-2 px-1 transition`}>
            <p className='text-p60-paper'>★</p>
          </div>
          <span>{activeFilter || 'All Filters'}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute bottom-0 left-0 mt-1 w-64 bg-white border-2 border-p60-blue rounded-sm z-20">
            <div className="py-1">
              <button
                onClick={clearFilters}
                className={`block w-full text-left px-4 py-2 text-xs hover:bg-p60-paper hover:text-p60-blue ${!activeFilter ? 'font-bold bg-p60-paper' : ''}`}
              >
                All Filters <span className="text-xs text-gray-500 ml-1">({locations.length})</span>
              </button>
              
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterSelect(filter)}
                  className={`block w-full text-left px-4 py-2 text-xs hover:bg-p60-paper text-p60-blue ${activeFilter === filter ? 'font-bold bg-p60-paper' : ''}`}
                >
                  {filter} <span className="text-xs text-black ml-1">({filterCounts[filter]})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterToggle;