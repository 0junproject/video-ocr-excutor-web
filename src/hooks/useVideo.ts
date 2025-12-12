"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  sourceUrl: string | null;
}

export function useVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // High-frequency data (for internal checks, if needed)
  const timeRef = useRef(0);
  
  // Low-frequency UI state (for rendering buttons/sliders)
  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    sourceUrl: null,
  });

  // 1. File Loading
  const loadFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setVideoState((prev) => ({ ...prev, sourceUrl: url }));
    
    // Revoke old URL if exists to prevent memory leak (optional logic here)
    // For simplicity, we assume one file loaded at a time or handled by cleanup
  }, []);

  const reset = useCallback(() => {
    if (videoState.sourceUrl) {
      URL.revokeObjectURL(videoState.sourceUrl);
    }
    setVideoState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1.0,
      sourceUrl: null,
    });
    if (videoRef.current) {
        videoRef.current.load();
    }
  }, [videoState.sourceUrl]);

  // 2. Playback Control
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setVideoState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  const seek = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  }, []);

  // 3. Event Listeners (Sync State)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setVideoState(p => ({ ...p, isPlaying: true }));
    const onPause = () => setVideoState(p => ({ ...p, isPlaying: false }));
    const onTimeUpdate = () => {
        timeRef.current = video.currentTime;
        // Optimization: Don't update React state every frame, only for UI sync if needed.
        // For now, we update it for the progress bar 
        // In heavily optimized apps, we might throttle this.
        setVideoState(p => ({ ...p, currentTime: video.currentTime }));
    };
    const onLoadedMetadata = () => {
        setVideoState(p => ({ ...p, duration: video.duration }));
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
        video.removeEventListener("play", onPlay);
        video.removeEventListener("pause", onPause);
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [videoRef.current]); // Re-bind if ref changes (which is rare)

  return {
    videoRef,
    videoState,
    loadFile,
    reset,
    togglePlay,
    setPlaybackRate,
    seek,
  };
}
