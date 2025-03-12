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
          isVisible ? 'opacity-100 bg-p60-black/20' : 'opacity-0 bg-black/0'
        }`}
        onClick={closeWithAnimation}
      />
      
      {/* Modal content */}
      <div 
        className={`relative bg-p60-paper rounded-sm md:-rotate-1 shadow-lg border-2 border-p60-blue max-w-lg w-full md:max-h-[90vh] overflow-auto transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-105 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-2 flex items-center justify-between bg-p60-orange border-b-2 border-p60-blue text-sm font-sans font-bold sticky top-0">
          <h2 className="bg-white border-2 border-l-8 border-p60-blue py-1 px-2 rounded-xs">About PayTalk</h2>
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
        
        <div className="p-4 space-y-4">
          <div className='px-2 pb-3 bg-white rounded-sm border-l-8 border-2 border-p60-blue'>
            <p className="bg-p60-blue -mt-2 -ml-2 mb-2 text-xs px-2 text-white inline-block">about this project</p>
            <div className="font-serif pr-2">
              <p className="mb-2">
              This exhibition showcases responses to <a class="underline underline-offset-2" href="https://www.citizensuk.org/campaigns/the-campaign-for-a-real-living-wage/">Citizens UK's Living Wage campaign,</a> featuring audio narratives that share the experiences of workers often overlooked in economic discourse—youth under 18, individuals with unstable housing, commuters, and single parents. Through listening practices and storytelling, design students have translated personal testimonies into audio pieces that connect nationwide statistics to lived realities, revealing how in-work poverty shapes lives across London's communities. These works demonstrate that listening is as crucial to design as storytelling, creating understanding while encouraging audiences to consider the human dimension of economic policy.
              </p>
            </div>
          </div>
          
          <div className='px-2 pb-3 bg-white rounded-sm border-l-8 border-2 border-p60-blue'>
            <p className="bg-p60-blue -mt-2 -ml-2 mb-2 text-xs px-2 text-white inline-block">how to use</p>
            <div className="font-serif pr-2">
              <ul className="list-disc pl-5 space-y-1">
                <li>Click on any marker 📍 to learn about that listening</li>
                <li>Hover over markers to hear ambient sounds</li>
                <li>Click "Listen" in any location card to hear the full interview</li>
                <li>Use the filter menu in the top right to focus on specific categories</li>
              </ul>
            </div>
          </div>
          
          <div className='px-2 pb-3 bg-white rounded-sm border-l-8 border-2 border-p60-blue'>
            <p className="bg-p60-blue -mt-2 -ml-2 mb-2 text-xs px-2 text-white inline-block">credits</p>
            <div className="font-serif pr-2">
              <p className="mb-2">
                This project was created by students at Camberwell College of Arts and led by <a class="underline underline-offset-2" href="https://www.arts.ac.uk/colleges/camberwell-college-of-arts/people/jack-clarke">Jack Clarke</a> with assistance from Citizens UK.
              </p>
              <p className="mb-2">Thanks to Joab Nicholson, Iara Cardeira & George Underwood for the design of this site.</p>
              <p>
                Listenings, recordings, and content collected in 2025. Many thanks to all who gave up their time to contribute to this research.
              </p>
              <div class="flex space-x-4 h-8 justify-end mt-2">
                <img class="" src="/ual.png" />
                <img class="" src="/citizens-uk.png" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;