'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';

const VoiceMessage = ({ audioUrl, duration = 0, isSender = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error("Playback error:", err));
    }
  };

  const handleSpeedToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    
    audio.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !totalDuration) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalDuration ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all ${
      isSender 
        ? "bg-black/15 border-white/10 text-white" 
        : "bg-surface border-border text-text-primary shadow-sm"
    }`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button 
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition flex-shrink-0 ${
          isSender 
            ? "bg-white text-black hover:bg-white/90 shadow-md" 
            : "bg-primary text-text-inverse hover:bg-primary-hover shadow-md"
        }`}
        title={isPlaying ? "Pause voice note" : "Play voice note"}
      >
        {isPlaying ? <FaPause className="text-[10px]" /> : <FaPlay className="text-[10px] ml-0.5" />}
      </button>

      {/* Progress Track & Duration */}
      <div className="flex-1 flex flex-col justify-center min-w-[120px]">
        {/* Animated wave lines mockup */}
        <div className="relative w-full h-4 flex items-center gap-0.5 cursor-pointer">
          <input 
            type="range" 
            min="0" 
            max={totalDuration || 100} 
            value={currentTime} 
            onChange={handleSeek}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
          />
          {/* Simulated Waveform Bars */}
          {Array.from({ length: 22 }).map((_, i) => {
            const isActive = (i / 22) * 100 <= progressPercent;
            const barHeight = Math.max(30, ((i * 17 + 7) % 100));
            return (
              <span 
                key={i} 
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isActive 
                    ? (isSender ? "bg-white" : "bg-primary") 
                    : (isSender ? "bg-white/20" : "bg-border")
                }`}
                style={{ height: `${barHeight}%` }}
              />
            );
          })}
        </div>

        {/* Dynamic Timers */}
        <div className="flex justify-between items-center text-[9px] font-bold mt-1 opacity-80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Speed Rate Toggle Button */}
      <button 
        onClick={handleSpeedToggle}
        className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase transition border ${
          isSender 
            ? "bg-white/10 border-white/20 text-white hover:bg-white/20" 
            : "bg-surface border-border text-text-muted hover:text-text-primary"
        }`}
        title="Playback Speed"
      >
        {playbackSpeed}x
      </button>
    </div>
  );
};

export default React.memo(VoiceMessage);
