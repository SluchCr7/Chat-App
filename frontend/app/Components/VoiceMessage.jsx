'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';

const VoiceMessage = ({ audioUrl, duration: initialDuration, isSender }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [waveformBars, setWaveformBars] = useState([]);

  // Generate a consistent, aesthetic waveform structure based on the URL
  useEffect(() => {
    if (audioUrl) {
      // Generate pseudo-random but deterministic heights
      let hash = 0;
      for (let i = 0; i < audioUrl.length; i++) {
        hash = audioUrl.charCodeAt(i) + ((hash << 5) - hash);
      }
      const barsCount = 32;
      const heights = [];
      for (let i = 0; i < barsCount; i++) {
        const h = Math.abs(Math.sin(hash + i) * 28) + 8; // values between 8px and 36px
        heights.push(Math.round(h));
      }
      setWaveformBars(heights);
    }
  }, [audioUrl]);

  // Clean audio on unmount or URL change
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !initialDuration) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // If initialDuration is provided, trust it
    if (initialDuration) {
      setDuration(initialDuration);
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
  }, [audioUrl, initialDuration]);

  // Sync playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.error("Playback error:", err));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickRatio = Math.max(0, Math.min(1, clickX / width));
    
    audioRef.current.currentTime = clickRatio * duration;
    setCurrentTime(clickRatio * duration);
  };

  const toggleSpeed = () => {
    setPlaybackRate((prev) => {
      if (prev === 1) return 1.5;
      if (prev === 1.5) return 2;
      return 1;
    });
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  // Design tokens based on sender/receiver style context
  const textMutedClass = isSender ? 'text-white/70' : 'text-text-muted';
  const controlBtnClass = isSender 
    ? 'bg-white/20 hover:bg-white/30 text-white border-white/10' 
    : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/10';
  const speedBtnClass = isSender 
    ? 'bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold border border-white/20' 
    : 'bg-bg-primary hover:bg-surface-hover text-text-primary text-[10px] font-bold border border-border';
  const waveActiveColor = isSender ? 'bg-white' : 'bg-primary';
  const waveInactiveColor = isSender ? 'bg-white/30' : 'bg-border-hover';

  return (
    <div className="flex items-center gap-3 p-2 bg-transparent rounded-2xl w-72 max-w-full font-sans select-none">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 transform active:scale-95 ${controlBtnClass}`}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
      </button>

      {/* Waveform & Time Info */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        {/* Interactive Waveform container */}
        <div
          onClick={handleSeek}
          className="h-10 flex items-center gap-[2.5px] cursor-pointer w-full relative"
          title="Seek voice message"
        >
          {waveformBars.map((height, idx) => {
            const barProgress = idx / waveformBars.length;
            const isActive = progress >= barProgress;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-200 ${
                  isActive ? waveActiveColor : waveInactiveColor
                }`}
                style={{
                  height: `${height}px`,
                  minHeight: '4px'
                }}
              />
            );
          })}
        </div>

        {/* Timeline details */}
        <div className="flex items-center justify-between text-[10px] font-semibold leading-none">
          <span className={textMutedClass}>{formatTime(currentTime)}</span>
          <span className={textMutedClass}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback speed trigger */}
      <button
        onClick={toggleSpeed}
        className={`px-2.5 py-1 rounded-lg transition-all duration-200 ${speedBtnClass}`}
        title="Toggle playback speed"
      >
        {playbackRate}x
      </button>
    </div>
  );
};

export default VoiceMessage;
