"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  movieId: string;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
}

const ModernVideoPlayer = ({ videoUrl, movieId, onProgress }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  // Volume control
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  // Seek functionality
  const handleSeek = useCallback((time: number) => {
    if (videoRef.current && duration) {
      const seekTime = Math.max(0, Math.min(time, duration));
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  }, [duration]);

  // Progress bar click
  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    if (progressBarRef.current && duration) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      handleSeek(newTime);
    }
  }, [duration, handleSeek]);

  // Playback speed
  const handleSpeedChange = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
      setShowSpeedMenu(false);
    }
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  // Format time
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Update buffered
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBuffered((bufferedEnd / videoRef.current.duration) * 100);
      }

      // Progress callback
      const playedSeconds = Math.floor(videoRef.current.currentTime);
      const played = Math.min(1, videoRef.current.currentTime / (videoRef.current.duration || 1));
      onProgress?.({ played, playedSeconds });
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    resetControlsTimeout();
  };

  const handlePause = () => {
    setIsPlaying(false);
    setShowControls(true);
  };

  const handleError = () => {
    setError("Failed to load video");
    setLoading(false);
  };

  // Keyboard controls
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!videoRef.current) return;
    
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleSeek(currentTime - 10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleSeek(currentTime + 10);
        break;
      case 'ArrowUp':
        e.preventDefault();
        handleVolumeChange(Math.min(1, volume + 0.1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume - 0.1));
        break;
      case 'KeyF':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'KeyM':
        e.preventDefault();
        toggleMute();
        break;
    }
  }, [togglePlayPause, currentTime, handleSeek, volume, handleVolumeChange, toggleFullscreen, toggleMute]);

  // Effects
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyPress);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [handleKeyPress]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  const getVideoUrl = () => {
    if (videoUrl.startsWith('http')) {
      return videoUrl;
    }
    return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
  };

  if (error) {
    return (
      <div className="modern-video-player error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`modern-video-player ${isFullscreen ? 'fullscreen' : ''}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={getVideoUrl()}
        className="video-element"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        onClick={togglePlayPause}
        preload="metadata"
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <span>Loading video...</span>
        </div>
      )}

      {/* Center Play Button */}
      {!loading && !isPlaying && (
        <div className="center-play-btn" onClick={togglePlayPause}>
          <div className="play-icon">▶</div>
        </div>
      )}

      {/* Controls */}
      <div className={`video-controls ${showControls || !isPlaying ? 'visible' : ''}`}>
        {/* Progress Bar */}
        <div className="progress-container">
          <div 
            ref={progressBarRef}
            className="progress-bar"
            onClick={handleProgressClick}
          >
            <div className="progress-buffered" style={{ width: `${buffered}%` }} />
            <div className="progress-played" style={{ width: `${(currentTime / duration) * 100}%` }} />
            <div 
              className="progress-thumb" 
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="controls-row">
          <div className="controls-left">
            {/* Play/Pause */}
            <button className="control-btn play-pause" onClick={togglePlayPause}>
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Volume */}
            <div 
              className="volume-control"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button className="control-btn" onClick={toggleMute}>
                {isMuted || volume === 0 ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
              </button>
              <div className={`volume-slider ${showVolumeSlider ? 'visible' : ''}`}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
            </div>

            {/* Time Display */}
            <div className="time-display">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          </div>

          <div className="controls-right">
            {/* Playback Speed */}
            <div className="speed-control">
              <button 
                className="control-btn"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div className="speed-menu">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      className={`speed-option ${playbackRate === speed ? 'active' : ''}`}
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button className="control-btn" onClick={toggleFullscreen}>
              {isFullscreen ? '🗗' : '⛶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernVideoPlayer;