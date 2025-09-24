import React, { useEffect, useState } from 'react';

const AboutModal = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Handle showing/hiding the modal with animation timing
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);
  
  // Add ESC key handler for closing modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeWithAnimation();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    // Prevent scrolling of the body when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Close with animation
  const closeWithAnimation = () => {
    setIsVisible(false);
    // Wait for animation to finish before calling onClose
    setTimeout(() => {
      onClose();
    }, 300); // Match this to the CSS transition duration
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:items-center justify-center p-4 modal-container">
      {/* Backdrop with click handler to close */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100 bg-black/20' : 'opacity-0 bg-black/0'
        }`}
        onClick={closeWithAnimation}
      />
      
      {/* Modal content */}
      <div 
        className={`relative bg-yp-yellow shadow-lg border-2 border-black max-w-lg w-full md:max-h-[90vh] overflow-auto transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-2 flex items-center justify-between bg-yp-yellow border-b-2 border-black text-sm font-sans font-bold sticky top-0">
          <h2>About The Yellow Page</h2>
          <button 
            onClick={closeWithAnimation}
            className="text-black hover:text-black transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 space-y-4 bg-white">
          <p className="mb-2">
          The Yellow Page is is intended as a resource for students of Graphic Design at Camberwell College of Arts. Use this guide as a way to explore the local area.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Click on any marker 📍 to read about the entry</li>
            <li>Use the filter menu in the bottom left to focus on specific categories</li>
          </ul>
          <p>
          Please send suggestions or comments to either Jack (j.clarke@arts.ac.uk) or amy (a.etherington@camberwell.arts.ac.uk) via email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;