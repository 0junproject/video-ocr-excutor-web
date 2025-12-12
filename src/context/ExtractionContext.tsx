"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

// --- Types ---

export interface ROI {
  id: string;
  name: string; // e.g. "Speaker", "Subtitle"
  color: string; // e.g. "#FF0000"
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width: number; // Percentage 0-100
  height: number; // Percentage 0-100
}

export interface ExtractedResult {
  id: string;
  timestamp: number; // in seconds
  formattedTime: string;
  key: string;
  value: string;
}

export interface CaptureSettings {
  interval: number; // ms
  sensitivity: number; // 1-100
}

interface ExtractionContextType {
  // State
  rois: ROI[];
  results: ExtractedResult[];
  isCapturing: boolean;
  settings: CaptureSettings;

  // Actions
  addRoi: (roi: Omit<ROI, "id">) => void;
  removeRoi: (id: string) => void;
  updateRoi: (id: string, updates: Partial<ROI>) => void;
  
  addResult: (result: Omit<ExtractedResult, "id">) => void;
  clearResults: () => void;
  
  setCapturing: (isCapturing: boolean) => void;
  updateSettings: (settings: Partial<CaptureSettings>) => void;
}

// --- Context ---

const ExtractionContext = createContext<ExtractionContextType | null>(null);

// --- Provider ---

export function ExtractionProvider({ children }: { children: React.ReactNode }) {
  const [rois, setRois] = useState<ROI[]>([
    // Default Sample
    { id: "sample-1", name: "Speaker", color: "#FACC15", x: 10, y: 10, width: 20, height: 10 },
    { id: "sample-2", name: "Subtitle", color: "#22D3EE", x: 10, y: 80, width: 80, height: 15 },
  ]);
  
  const [results, setResults] = useState<ExtractedResult[]>([]);
  const [isCapturing, setCapturing] = useState(false);
  const [settings, setSettings] = useState<CaptureSettings>({
    interval: 1000,
    sensitivity: 50,
  });

  const addRoi = useCallback((roi: Omit<ROI, "id">) => {
    const newRoi = { ...roi, id: crypto.randomUUID() };
    setRois((prev) => [...prev, newRoi]);
  }, []);

  const removeRoi = useCallback((id: string) => {
    setRois((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRoi = useCallback((id: string, updates: Partial<ROI>) => {
     setRois(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const addResult = useCallback((result: Omit<ExtractedResult, "id">) => {
    const newResult = { ...result, id: crypto.randomUUID() };
    setResults((prev) => [...prev, newResult]);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const updateSettings = useCallback((updates: Partial<CaptureSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <ExtractionContext.Provider
      value={{
        rois,
        results,
        isCapturing,
        settings,
        addRoi,
        removeRoi,
        updateRoi,
        addResult,
        clearResults,
        setCapturing,
        updateSettings,
      }}
    >
      {children}
    </ExtractionContext.Provider>
  );
}

// --- Hook ---

export function useExtractionContext() {
  const context = useContext(ExtractionContext);
  if (!context) {
    throw new Error("useExtractionContext must be used within ExtractionProvider");
  }
  return context;
}
