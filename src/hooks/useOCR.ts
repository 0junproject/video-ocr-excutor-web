"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createWorker, Worker } from "tesseract.js"; 
import { pipeline, TrOCRPreTrainedModel } from '@huggingface/transformers';

export type OCRStatus = "idle" | "initializing" | "recognizing" | "error";

export interface OCRResult {
  text: string;
  confidence: number;
}

export function useOCR() {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<OCRStatus>("idle");
  const [progress, setProgress] = useState(0);

  // Initialize Worker
  useEffect(() => {
    const initWorker = async () => {
      try {
        const worker = await createWorker('eng+kor'); // Support English and Korean
        workerRef.current = worker;
        setStatus("idle");
      } catch (error) {
        console.error("Failed to initialize Tesseract worker:", error);
        setStatus("error");
      }
    };
    initWorker();

    return () => {
        const terminate = async () => {
            if (workerRef.current) {
                await workerRef.current.terminate();
                workerRef.current = null;
            }
        };
        terminate();
    };
  }, []);

  const recognize = useCallback(async (image: string | HTMLCanvasElement | Blob): Promise<OCRResult> => {
    console.log("recognize called")
    if (!workerRef.current) {
        console.error("OCR Worker not initialized");
        return { text: "", confidence: 0 };
    }

    setStatus("recognizing");
    setProgress(0);

    try {
        const { data: { text, confidence } } = await workerRef.current.recognize(image);
        setStatus("idle");
        setProgress(100);
        
        return {
            text,
            confidence
        };
    } catch (error) {
        console.error("OCR Recognition failed:", error);
        setStatus("error");
        return { text: "", confidence: 0 };
    }
  }, []);

  return {
    status,
    progress,
    recognize,
    isReady: status === "idle" && !!workerRef.current
  };
}
