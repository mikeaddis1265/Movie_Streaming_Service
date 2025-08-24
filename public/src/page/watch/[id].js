"use client";

import { useState, useRef } from "react";

export default function WatchPage({ params }) {
  const { id } = params;
  const [quality, setQuality] = useState("720p");
  const [speed, setSpeed] = useState(1);
  const [subtitle, setSubtitle] = useState("en");
  const videoRef = useRef(null);

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Streaming Player</h1>
      <div className="w-full max-w-5xl relative">
        {/* Video Player */}
        <video
          ref={videoRef}
          className="w-full rounded-lg shadow-lg"
          controls
          controlsList="nodownload"
          playbackRate={speed}
        >
          <source src={`/videos/${id}-${quality}.mp4`} type="video/mp4" />
          <track
            label="English"
            kind="subtitles"
            srcLang="en"
            src={`/subtitles/${id}-en.vtt`}
            default={subtitle === "en"}
          />
          <track
            label="Spanish"
            kind="subtitles"
            srcLang="es"
            src={`/subtitles/${id}-es.vtt`}
            default={subtitle === "es"}
          />
          Your browser does not support the video tag.
        </video>

        {/* Controls */}
        <div className="mt-3 flex flex-wrap gap-2">
          {/* Quality */}
          {["480p", "720p", "1080p"].map((q) => (
            <button
              key={q}
              className={`px-3 py-1 rounded ${
                quality === q ? "bg-blue-600" : "bg-gray-700"
              }`}
              onClick={() => setQuality(q)}
            >
              {q}
            </button>
          ))}

          {/* Subtitles */}
          {["en", "es", "off"].map((lang) => (
            <button
              key={lang}
              className={`px-3 py-1 rounded ${
                subtitle === lang ? "bg-blue-600" : "bg-gray-700"
              }`}
              onClick={() => setSubtitle(lang)}
            >
              {lang === "off" ? "No Subtitles" : lang.toUpperCase()}
            </button>
          ))}

          {/* Playback Speed */}
          {[0.5, 1, 1.5, 2].map((s) => (
            <button
              key={s}
              className={`px-3 py-1 rounded ${
                speed === s ? "bg-blue-600" : "bg-gray-700"
              }`}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </button>
          ))}

          {/* Fullscreen */}
          <button
            className="px-3 py-1 rounded bg-green-600"
            onClick={toggleFullscreen}
          >
            Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
}
