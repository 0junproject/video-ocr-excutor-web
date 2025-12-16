"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  sourceUrl: string | null;
  stream: MediaStream | null; // New: For Screen Share
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
    stream: null,
  });

  // 1. File & URL Loading
  const loadFile = useCallback((file: File) => {
    reset(); // Clear previous
    const url = URL.createObjectURL(file);
    setVideoState((prev) => ({ ...prev, sourceUrl: url }));
  }, []);

  const loadUrl = useCallback((url: string) => {
    reset(); // Clear previous
    setVideoState((prev) => ({ ...prev, sourceUrl: url }));
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
        reset(); // Clear previous
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
            video: true, 
            audio: true 
        });
        
        // Handle stream ending (user clicks "Stop sharing" in browser UI)
        stream.getVideoTracks()[0].onended = () => {
            reset();
        };

        setVideoState(prev => ({ ...prev, stream }));
    } catch (err) {
        console.error("Screen Share Error:", err);
    }
  }, []);

  const reset = useCallback(() => {
    // 1. Revoke URL
    if (videoState.sourceUrl) {
      URL.revokeObjectURL(videoState.sourceUrl);
    }
    // 2. Stop Stream Tracks
    if (videoState.stream) {
        videoState.stream.getTracks().forEach(track => track.stop());
    }

    setVideoState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1.0,
      sourceUrl: null,
      stream: null,
    });
    
    // Force reload
    if (videoRef.current) {
        videoRef.current.src = "";
        videoRef.current.srcObject = null;
        videoRef.current.load();
    }
  }, [videoState.sourceUrl, videoState.stream]);

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
  }, [videoRef]); 

  return {
    videoRef,
    videoState,
    loadFile,
    loadUrl,
    startScreenShare,
    reset,
    togglePlay,
    setPlaybackRate,
    seek,
  };
}
