"use client";

import React, { createContext, useContext } from "react";
import { useVideo, type VideoState } from "@/hooks/useVideo";

interface VideoContextType {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoState: VideoState;
  loadFile: (file: File) => void;
  reset: () => void;
  togglePlay: () => void;
  setPlaybackRate: (rate: number) => void;
  seek: (time: number) => void;
}

const VideoContext = createContext<VideoContextType | null>(null);

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const videoLogic = useVideo();

  return (
    <VideoContext.Provider value={videoLogic}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideoContext() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideoContext must be used within a VideoProvider");
  }
  return context;
}
