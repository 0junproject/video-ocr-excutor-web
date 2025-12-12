"use client";

import { useEffect, useRef } from "react";
import { useVideoContext } from "@/context/VideoContext";
import { useExtractionContext } from "@/context/ExtractionContext";
import { useOCR } from "@/hooks/useOCR";
import { captureVideoFrame } from "@/lib/image-processing";

export function AutoCaptureManager() {
  const { videoRef, videoState, togglePlay } = useVideoContext();
  const { rois, isCapturing, settings, addResult, setCapturing } = useExtractionContext();
  const { recognize } = useOCR();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (!isCapturing || !videoRef.current || videoState.sourceUrl === null) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Ensure video is playing when capture starts (optional, but logical)
    if (!videoState.isPlaying) {
        togglePlay();
    }

    const runCapture = async () => {
      if (processingRef.current) return; // Skip if previous frame is still processing
      processingRef.current = true;

      const video = videoRef.current;
      if (!video) return;

      const currentTime = video.currentTime;

      // Process all ROIs in parallel
      const tasks = rois.map(async (roi) => {
        // 1. Capture Frame
        const blob = await captureVideoFrame(video, {
            x: roi.x,
            y: roi.y,
            width: roi.width,
            height: roi.height
        });

        if (!blob) return;

        // 2. OCR
        try {
            const result = await recognize(blob);
            
            // 3. Save Result if text is valid
            if (result.text && result.text.trim().length > 0) {
                // Simple duplicate check could go here
                addResult({
                    timestamp: currentTime,
                    formattedTime: new Date(currentTime * 1000).toISOString().substr(11, 8),
                    key: roi.name,
                    value: result.text.trim().replace(/\n/g, ' ')
                });
            }
        } catch (error) {
            console.error(`OCR failed for ${roi.name}:`, error);
        }
      });

      await Promise.all(tasks);
      processingRef.current = false;
    };

    intervalRef.current = setInterval(runCapture, settings.interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCapturing, rois, settings.interval, videoState.sourceUrl, videoState.isPlaying]); // videoRef is stable

  return null; // Invisible component
}
