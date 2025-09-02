"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  movieId: string;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
}

interface ControlsState {
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  showControls: boolean;
  playbackRate: number;
  isFullscreen: boolean;
}

const VideoPlayer = ({ videoUrl, movieId, onProgress }: VideoPlayerProps) => {
  const [quality, setQuality] = useState("720p");
  const [speed, setSpeed] = useState(1);
  const [subtitle, setSubtitle] = useState("en");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-hide controls
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((error) => {
          setError("Failed to play video: " + error.message);
        });
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
      setSpeed(newSpeed);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((error) => {
          console.error("Failed to enter fullscreen:", error);
        });
      } else {
        document.exitFullscreen().catch((error) => {
          console.error("Failed to exit fullscreen:", error);
        });
      }
    }
  };

  // Video event handlers
  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadedData = () => {
    setLoading(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    resetControlsTimeout();
  };

  const handlePause = () => {
    setIsPlaying(false);
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const current = videoRef.current.currentTime;
    setCurrentTime(current);
    
    // Update buffered progress
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((bufferedEnd / videoRef.current.duration) * 100);
    }
    
    // Throttled progress callback to API
    const now = Date.now();
    if (now - (videoRef.current as any).lastProgressSent > 5000) {
      (videoRef.current as any).lastProgressSent = now;
      const playedSeconds = Math.floor(current);
      const played = Math.min(1, current / (videoRef.current.duration || 1));
      onProgress?.({ played, playedSeconds });
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setLoading(false);
    
    let errorMessage = "An error occurred while loading the video";
    if (video.error) {
      switch (video.error.code) {
        case video.error.MEDIA_ERR_ABORTED:
          errorMessage = "Video playback was aborted";
          break;
        case video.error.MEDIA_ERR_NETWORK:
          errorMessage = "Network error occurred while loading video";
          break;
        case video.error.MEDIA_ERR_DECODE:
          errorMessage = "Video format not supported";
          break;
        case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Video source not found or not supported";
          break;
      }
    }
    setError(errorMessage);
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Effects
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoUrl = () => {
    // In production, you would have different quality URLs
    // For demo purposes, we'll return the same URL regardless of quality
    if (videoUrl.startsWith('http')) {
      return videoUrl;
    }
    
    // Fallback to a demo video or sample
    return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
  };

  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-red-500 text-xl mb-4">⚠️ Video Error</div>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative netflix-player"
      onMouseMove={handleMouseMove}
    >
      {/* Video Player Container */}
      <div className="relative w-full h-full bg-black overflow-hidden group">
        <video
          ref={videoRef}
          src={getVideoUrl()}
          className="w-full h-full cursor-pointer"
          onLoadStart={handleLoadStart}
          onLoadedData={handleLoadedData}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onError={handleError}
          onClick={togglePlayPause}
          crossOrigin="anonymous"
        >
          <track
            kind="subtitles"
            src={`/subtitles/${movieId}-en.vtt`}
            srcLang="en"
            label="English"
            default={subtitle === "en"}
          />
          <track
            kind="subtitles"
            src={`/subtitles/${movieId}-es.vtt`}
            srcLang="es"
            label="Spanish"
            default={subtitle === "es"}
          />
        </video>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Loading video...</span>
            </div>
          </div>
        )}

        {/* Netflix-style Play/Pause Button Overlay */}
        {!loading && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <button
              onClick={togglePlayPause}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl hover:bg-white/30 transition-all duration-200 pointer-events-auto border border-white/30"
            >
              {isPlaying ? "⏸️" : "▶️"}
            </button>
          </div>
        )}

        {/* Netflix-style Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="relative w-full h-1 bg-white/30 rounded-full cursor-pointer hover:h-2 transition-all duration-200" 
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const clickX = e.clientX - rect.left;
                   const percentage = clickX / rect.width;
                   const newTime = percentage * duration;
                   handleSeek(newTime);
                 }}>
              {/* Buffered Progress */}
              <div 
                className="absolute top-0 left-0 h-full bg-white/50 rounded-full transition-all duration-200"
                style={{ width: `${buffered}%` }}
              ></div>
              {/* Watched Progress */}
              <div 
                className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-200"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
              {/* Scrub Handle */}
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-200"
                style={{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }}
              ></div>
            </div>
          </div>

          {/* Netflix-style Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button 
                onClick={togglePlayPause}
                className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-white/20 rounded-full transition-all duration-200"
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-3 group">
                <button 
                  onClick={toggleMute}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/20 rounded-full transition-all duration-200"
                >
                  {isMuted || volume === 0 ? "🔇" : volume > 0.5 ? "🔊" : "🔉"}
                </button>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              {/* Time */}
              <span className="text-sm font-medium text-white/90 min-w-max">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Speed */}
              <div className="relative group">
                <select
                  value={speed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="bg-transparent text-white text-sm px-3 py-1 rounded-md border border-white/30 hover:border-white/50 focus:outline-none focus:border-white cursor-pointer appearance-none"
                >
                  <option value={0.5} className="bg-gray-800">0.5x</option>
                  <option value={1} className="bg-gray-800">1x</option>
                  <option value={1.25} className="bg-gray-800">1.25x</option>
                  <option value={1.5} className="bg-gray-800">1.5x</option>
                  <option value={2} className="bg-gray-800">2x</option>
                </select>
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 flex items-center justify-center text-xl hover:bg-white/20 rounded-full transition-all duration-200"
              >
                {isFullscreen ? "🗗" : "⛶"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {/* Quality Settings */}
        <div className="bg-gray-800 rounded-lg p-3">
          <h4 className="text-white text-sm font-medium mb-2">Quality</h4>
          <div className="flex gap-1">
            {["480p", "720p", "1080p"].map((q) => (
              <button
                key={q}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  quality === q
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setQuality(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Subtitle Settings */}
        <div className="bg-gray-800 rounded-lg p-3">
          <h4 className="text-white text-sm font-medium mb-2">Subtitles</h4>
          <div className="flex gap-1">
            {["off", "en", "es"].map((lang) => (
              <button
                key={lang}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  subtitle === lang
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setSubtitle(lang)}
              >
                {lang === "off" ? "Off" : lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
