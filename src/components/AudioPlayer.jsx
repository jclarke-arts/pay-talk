import React, { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ currentTrack, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  
  // Setup timer update
  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        animationRef.current = requestAnimationFrame(updateProgress);
      }
    };
  
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);
  
  // Handle track changes
  useEffect(() => {
    if (currentTrack) {
      // Reset player state when track changes
      setCurrentTime(0);
      setIsPlaying(true);
      
      // Play after a short delay to ensure the audio element has loaded
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error("Error playing audio:", err);
            setIsPlaying(false);
          });
        }
      }, 100);
    }
  }, [currentTrack]);
  
  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    
    // If the track is already loaded, set the duration immediately
    if (audio.readyState > 0) {
      setDuration(audio.duration);
    }
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTrack]);
  
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (e) => {
    if (!audioRef.current) return;
    
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    audioRef.current.currentTime = seekTime;
    
    // If it was paused and we're seeking, don't automatically play
    if (!isPlaying) {
      audioRef.current.pause();
    }
  };
  
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  
  if (!currentTrack) return null;
  
  return (
    <div className="fixed w-max md:w-1/2 rounded-sm mx-4 bottom-16 md:bottom-4 md:right-4 left-0 md:left-auto bg-p60-blue text-p60-paper p-3 z-50">
      <div className="max-w-screen-lg mx-auto flex items-center">
        <audio 
          ref={audioRef} 
          src={currentTrack.audioSrc} 
          preload="metadata"
        />
        
        <div className="flex-shrink-0 w-12 flex justify-center">
          <button 
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-p60-orange text-p60-paper flex items-center justify-center"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="mx-4 flex-grow">
          <div className="font-medium text-p60-paper mb-1 truncate">
            {currentTrack.title || "Unknown Track"}
          </div>
          <div className="flex items-center">
            <span className="text-xs text-p60-paper w-8">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime || 0}
              onChange={handleSeek}
              className="w-full h-1 mx-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-p60-paper w-8">{formatTime(duration)}</span>
          </div>
        </div>
        
        <button 
          onClick={onClose} 
          className="bg-p60-paper rounded-full w-10 h-10 flex justify-center items-center text-p60-blue ml-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;