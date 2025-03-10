// SpatialAudioManager.js
class SpatialAudioManager {
  constructor() {
    // Initialize audio context
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.audioSources = new Map(); // Store audio sources by location ID
    this.activeHoverSource = null; // Currently active hover audio
    this.hoverGainNode = null; // Gain node for hover volume control
    this.maxDistance = 150; // Maximum distance in pixels for audio to be audible
    this.isHovering = false; // Track if we're currently hovering
    this.persistentAudioSource = null; // For the persistent player
    this.persistentGainNode = null; // Gain node for persistent player

    // Bind methods
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.stopHoverAudio = this.stopHoverAudio.bind(this);
  }

  // Load an audio file and store it in our sources map
  async loadAudio(locationId, audioUrl) {
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.audioSources.set(locationId, audioBuffer);
      return true;
    } catch (error) {
      console.error("Error loading audio:", error);
      return false;
    }
  }

  // Calculate volume based on distance
  calculateVolumeByDistance(distance) {
    // Linear falloff: 1 at distance 0, 0 at maxDistance
    const volume = Math.max(0, 1 - distance / this.maxDistance);
    return volume * volume; // Square for more natural falloff
  }

  // Start hover audio when near a pin
  playHoverAudio(locationId, distance) {
    if (!this.audioSources.has(locationId)) return;

    // If we already have active hover audio for this location, just update volume
    if (
      this.activeHoverSource &&
      this.activeHoverSource.locationId === locationId
    ) {
      const volume = this.calculateVolumeByDistance(distance);
      if (this.hoverGainNode) {
        this.hoverGainNode.gain.value = volume;
      }
      return;
    }

    // Stop any currently playing hover audio
    this.stopHoverAudio();

    const audioBuffer = this.audioSources.get(locationId);

    // Create source node
    const sourceNode = this.audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;

    // Create gain node for volume control
    const gainNode = this.audioContext.createGain();
    const volume = this.calculateVolumeByDistance(distance);
    gainNode.gain.value = volume;

    // Connect nodes
    sourceNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Store reference to active hover audio
    this.activeHoverSource = {
      locationId,
      sourceNode,
      startTime: this.audioContext.currentTime,
    };
    this.hoverGainNode = gainNode;

    // Start playing
    sourceNode.start(0);
    this.isHovering = true;
  }

  // Stop the hover audio
  stopHoverAudio() {
    if (this.activeHoverSource) {
      try {
        this.activeHoverSource.sourceNode.stop();
      } catch (e) {
        // Source might have already stopped
      }
      this.activeHoverSource = null;
      this.hoverGainNode = null;
      this.isHovering = false;
    }
  }

  // Play audio in the persistent player
  playPersistentAudio(audioUrl, callback) {
    // Stop any existing persistent audio
    if (this.persistentAudioSource) {
      try {
        this.persistentAudioSource.stop();
      } catch (e) {
        // Source might have already stopped
      }
      this.persistentAudioSource = null;
    }

    // Load and play the audio
    fetch(audioUrl)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => this.audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        // Create source node
        const sourceNode = this.audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;

        // Create gain node
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 1.0; // Full volume

        // Connect nodes
        sourceNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Store reference
        this.persistentAudioSource = sourceNode;
        this.persistentGainNode = gainNode;

        // Setup ended callback
        sourceNode.onended = () => {
          this.persistentAudioSource = null;
          if (callback) callback();
        };

        // Start playing
        sourceNode.start(0);

        // Return the duration for the UI
        return audioBuffer.duration;
      })
      .catch((error) => {
        console.error("Error playing persistent audio:", error);
        if (callback) callback();
        return 0;
      });
  }

  // Stop the persistent audio
  stopPersistentAudio() {
    if (this.persistentAudioSource) {
      try {
        this.persistentAudioSource.stop();
      } catch (e) {
        // Source might have already stopped
      }
      this.persistentAudioSource = null;
    }
  }

  // Handle mouse movement over the map
  handleMouseMove(event, locations, mapRef) {
    if (!mapRef || !mapRef.current) return;

    // Get map container dimensions and position
    const mapContainer = mapRef.current.getContainer();
    const rect = mapContainer.getBoundingClientRect();

    // Mouse position relative to the map container
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check proximity to each marker
    let closestLocation = null;
    let minDistance = Infinity;

    for (const location of locations) {
      // Convert map coordinates to pixel coordinates
      const markerPosition = mapRef.current.project([
        location.data.coordinates[1], // lng
        location.data.coordinates[0], // lat
      ]);

      // Calculate distance to marker
      const dx = mouseX - markerPosition.x;
      const dy = mouseY - markerPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Update closest marker if this one is closer
      if (distance < minDistance && distance < this.maxDistance) {
        minDistance = distance;
        closestLocation = location;
      }
    }

    // Play audio for closest marker if within range
    if (closestLocation) {
      this.playHoverAudio(closestLocation.slug, minDistance);
    } else {
      this.stopHoverAudio();
    }
  }

  // Resume audio context if it's suspended (needed due to browser autoplay policies)
  resumeAudioContext() {
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }
}

export default SpatialAudioManager;
