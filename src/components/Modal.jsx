import React, { useEffect, useState, useRef } from 'react';

const Modal = ({ info, onClose, onPlayAudio }) => {
  const [isVisible, setIsVisible] = useState(false);
  const rotationAngle = useRef(Math.random() * 4 - 2);
  
  // Handle showing/hiding the modal with animation timing
  useEffect(() => {
    if (info) {
      // Show immediately when info is provided
      setIsVisible(true);
      // Generate a new random rotation when opening
      rotationAngle.current = Math.random() * 4 - 2;
    } else {
      // Don't do anything when info becomes null, that's handled by closeWithAnimation
    }
  }, [info]);
  
  // Add ESC key handler for closing modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && info) {
        closeWithAnimation();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    // Prevent scrolling of the body when modal is open
    if (info) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [info, onClose]);

  // Close with animation
  const closeWithAnimation = () => {
    setIsVisible(false);
    // Wait for animation to finish before calling onClose
    setTimeout(() => {
      onClose();
    }, 300); // Match this to the CSS transition duration
  };

  // Helper to navigate to filtered view without page refresh
  const navigateToFilter = (filter) => {
    const url = new URL(window.location);
    url.searchParams.set('filter', filter);
    
    // Update URL without refreshing the page
    window.history.pushState({}, '', url);
    
    // Close the modal
    closeWithAnimation();
    
    // We need to dispatch a custom event so the Map component can update its filter
    window.dispatchEvent(new CustomEvent('filterChange', { detail: filter }));
  };

  if (!info) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:items-center justify-center p-4 modal-container">
      {/* Backdrop with click handler to close */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100 bg-p60-black/20' : 'opacity-0 bg-black/0'
        }`}
        onClick={closeWithAnimation}
      />
      
      {/* Modal content */}
      <div 
        className={`relative bg-p60-paper rounded-sm shadow-lg border-2 border-p60-blue max-w-lg w-auto md:max-h-[90vh] md:aspect-[1/1.4142] overflow-auto transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-105 translate-y-4'
        }`}
        style={{ transform: `rotate(${rotationAngle.current}deg)` }}
        onClick={(e) => e.stopPropagation()}
      >
     
          <div className="px-4 py-2 flex items-center justify-between bg-p60-orange border-b-2 border-p60-blue text-sm font-sans font-bold sticky top-0 z-10">
            <h2 className="bg-white border-2 border-l-8 border-p60-blue py-1 px-2 rounded-xs">{info.data.title}</h2>
            <button 
              onClick={closeWithAnimation}
              className="text-black hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="p-4 space-y-2">
            {/* Show filters as clickable badges */}
            {info.data.filters && info.data.filters.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {info.data.filters.map(filter => (
                  <button 
                    key={filter}
                    onClick={() => navigateToFilter(filter)}
                    className="bg-p60-blue text-white text-xs px-2 py-1 rounded-sm hover:bg-p60-orange transition-colors"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}

            {info.data.audioFile && (
              <div className="bg-white border-2 border-p60-blue rounded-sm flex items-center space-x-2">
                <button 
                  onClick={() => onPlayAudio(info)}
                  className="px-4 py-2 bg-p60-blue text-white flex items-center text-sm hover:bg-p60-orange transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                </button>
                <p className="text-md">Listen</p>
              </div>
            )}
            
            {info.data.image &&
              <div className='bg-white rounded-sm border-l-8 border-2 border-p60-blue relative'>
                {info.data.caption && <p className="bg-p60-blue mt-2 absolute text-xs px-2 text-white inline-block max-w-2/3">{info.data.caption}</p>}
                <img src={info.data.image} alt={info.data.caption || info.data.title} />
              </div> 
            }

            <div className='px-2 pb-3 bg-white rounded-sm border-l-8 border-2 border-p60-blue'>
              <p className="bg-p60-blue -mt-2 -ml-2 mb-2 text-xs px-2 text-white inline-block">description(s)</p>
              <div className="font-serif pr-2 whitespace-break-spaces">{info.body}</div>
            </div> 

            <div className='w-1/2 px-2 pb-3 bg-white rounded-sm border-l-8 border-2 border-p60-blue'>
              <p className="bg-p60-blue -mt-2 -ml-2 mb-2 text-xs px-2 text-white inline-block">produced by</p>
              <div className="font-serif pr-2"><p>{info.data.author}</p></div>
            </div>

          </div>
        
        </div>
    </div>
  );
};

export default Modal;