"use client";

import { useState, useRef, useCallback, useEffect } from "react";
// import { createWorker, Worker } from "tesseract.js"; 

export type OCRStatus = "idle" | "initializing" | "recognizing" | "error";

export interface OCRResult {
  text: string;
  confidence: number;
}

export function useOCR() {
  // const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<OCRStatus>("idle");
  const [progress, setProgress] = useState(0);

  // Initialize Worker (Mocked)
  useEffect(() => {
    // const initWorker = async () => {
    //   setStatus("initializing");
    //   try {
    //     // await new Promise(r => setTimeout(r, 500)); // Mock init delay
    //     setStatus("idle");
    //   } catch (error) {
    //     console.error("Failed to initialize Tesseract worker:", error);
    //     setStatus("error");
    //   }
    // };
    // initWorker();

    // Directly set idle for mock
    setStatus("idle");

    return () => {
        // workerRef.current?.terminate();
    };
  }, []);

  const recognize = useCallback(async (image: string | HTMLCanvasElement | Blob): Promise<OCRResult> => {
    setStatus("recognizing");
    setProgress(0);

    // Mock Processing
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockText = `MOCK TEXT ${new Date().toLocaleTimeString()}`;
            setStatus("idle");
            setProgress(100);
            resolve({
                text: mockText,
                confidence: 90 + Math.random() * 10
            });
        }, 300); // 300ms mock delay
    });
  }, []);

  return {
    status,
    progress,
    recognize,
    isReady: status === "idle" // Simplified readiness
  };
}
