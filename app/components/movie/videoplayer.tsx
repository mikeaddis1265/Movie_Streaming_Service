"use client";

import { useState, useRef } from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  videoUrl: string;
  movieId: string;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
}

const VideoPlayer = ({ videoUrl, movieId, onProgress }: VideoPlayerProps) => {
  const [quality, setQuality] = useState("720p");
  const [speed, setSpeed] = useState(1);
  const [subtitle, setSubtitle] = useState("en");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleProgress = (progress: { played: number; playedSeconds: number }) => {
    if (onProgress) {
      onProgress(progress);
    }
  };

  const getVideoUrl = () => {
    // In a real app, you'd have different quality URLs
    // For now, return the provided URL
    return videoUrl;
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto">
      {/* Video Player */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <ReactPlayer
          ref={playerRef}
          url={getVideoUrl()}
          width="100%"
          height="100%"
          controls={true}
          playing={false}
          playbackRate={speed}
          onProgress={handleProgress}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                crossOrigin: 'anonymous'
              },
              tracks: [
                {
                  kind: 'subtitles',
                  src: `/subtitles/${movieId}-en.vtt`,
                  srcLang: 'en',
                  label: 'English',
                  default: subtitle === 'en'
                },
                {
                  kind: 'subtitles',
                  src: `/subtitles/${movieId}-es.vtt`,
                  srcLang: 'es', 
                  label: 'Spanish',
                  default: subtitle === 'es'
                }
              ]
            }
          }}
        />
      </div>

      {/* Custom Controls */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {/* Quality Buttons */}
        <div className="flex gap-1">
          <span className="text-sm text-gray-400 mr-2">Quality:</span>
          {["480p", "720p", "1080p"].map((q) => (
            <button
              key={q}
              className={`px-3 py-1 rounded text-sm ${
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

        {/* Subtitle Buttons */}
        <div className="flex gap-1">
          <span className="text-sm text-gray-400 mr-2">Subtitles:</span>
          {["en", "es", "off"].map((lang) => (
            <button
              key={lang}
              className={`px-3 py-1 rounded text-sm ${
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

        {/* Speed Controls */}
        <div className="flex gap-1">
          <span className="text-sm text-gray-400 mr-2">Speed:</span>
          {[0.5, 1, 1.25, 1.5, 2].map((s) => (
            <button
              key={s}
              className={`px-3 py-1 rounded text-sm ${
                speed === s 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Fullscreen Button */}
        <button
          className="px-4 py-1 rounded text-sm bg-green-600 text-white hover:bg-green-700"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
