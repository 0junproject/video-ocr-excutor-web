"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { useVideoContext } from "@/context/VideoContext";
import { useExtractionContext } from "@/context/ExtractionContext";
import { cn } from "@/lib/utils";

export function VideoStage() {
  const { videoRef, videoState, togglePlay, seek } = useVideoContext();
  const { rois, addRoi } = useExtractionContext();
  const { isPlaying, currentTime, duration, sourceUrl, stream } = videoState;
  
  // Attach Stream if available
  useEffect(() => {
    if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error); // Auto-play stream
    } else if (videoRef.current && !stream) {
        videoRef.current.srcObject = null;
    }
  }, [stream, videoRef]);

  // Drag Selection State
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null);
  const [selectionCurrent, setSelectionCurrent] = useState<{ x: number, y: number } | null>(null);

  const getRelativeCoords = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    
    // Prevent default to avoid text selection inside
    e.preventDefault();

    const coords = getRelativeCoords(e);
    setSelectionStart(coords);
    setSelectionCurrent(coords);
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    setSelectionCurrent(getRelativeCoords(e));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart || !selectionCurrent) return;

    // Calculate Box
    const x = Math.min(selectionStart.x, selectionCurrent.x);
    const y = Math.min(selectionStart.y, selectionCurrent.y);
    const width = Math.abs(selectionCurrent.x - selectionStart.x);
    const height = Math.abs(selectionCurrent.y - selectionStart.y);

    // If drag is too small, treat as click (toggle play)
    if (width < 1 && height < 1) {
       togglePlay();
    } else {
       // Create ROI
       addRoi({
         name: `Region ${rois.length + 1}`,
         color: `hsl(${Math.random() * 360}, 100%, 50%)`,
         x, y, width, height
       });
    }

    // Reset
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionCurrent(null);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const cleanX = Math.max(0, Math.min(x, rect.width));
    const percent = cleanX / rect.width;
    seek(percent * duration);
  };
    
  // Simple time formatter if not in utils
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const hasSource = !!sourceUrl || !!stream;

  return (
    <section className="flex-1 flex flex-col min-h-0 bg-[#121212] overflow-hidden">
      {/* Upper: Video Area */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden group">
        
        {/* The Video Container */}
        <div 
            ref={containerRef}
            className="relative w-full max-w-[800px] aspect-video bg-black border border-border shadow-2xl rounded-sm cursor-crosshair select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // Cancel on leave or finalize? Finalize is safer.
        >
             {hasSource ? (
                <>
                    <video 
                        ref={videoRef}
                        src={stream ? undefined : (sourceUrl || undefined)}
                        className="w-full h-full object-contain pointer-events-none" // Disable native events on video to let container handle them
                    />
                    
                    {/* ROI Overlay Layer */}
                    <div className="absolute inset-0 pointer-events-none">
                        {rois.map(roi => (
                            <div 
                                key={roi.id}
                                className="absolute border-2 pointer-events-auto cursor-grab hover:bg-white/10 transition-colors group"
                                style={{
                                    left: `${roi.x}%`,
                                    top: `${roi.y}%`,
                                    width: `${roi.width}%`,
                                    height: `${roi.height}%`,
                                    borderColor: roi.color
                                }}
                            >
                                <span 
                                    className="absolute -top-5 left-0 text-[10px] font-bold px-1 rounded text-black shadow-sm"
                                    style={{ backgroundColor: roi.color }}
                                >
                                    {roi.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Dragging Selection Box */}
                    {isSelecting && selectionStart && selectionCurrent && (
                        <div 
                            className="absolute border-2 border-white bg-white/20 pointer-events-none"
                            style={{
                                left: `${Math.min(selectionStart.x, selectionCurrent.x)}%`,
                                top: `${Math.min(selectionStart.y, selectionCurrent.y)}%`,
                                width: `${Math.abs(selectionCurrent.x - selectionStart.x)}%`,
                                height: `${Math.abs(selectionCurrent.y - selectionStart.y)}%`,
                            }}
                        />
                    )}
                </>
             ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground select-none">
                    VIDEO PLAYER ELEMENT (No Source)
                </div>
             )}
        </div>

      </div>

      {/* Middle: Controls */}
      <div className="h-[60px] bg-card border-t border-border flex items-center px-4 gap-4">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={togglePlay}
            disabled={!hasSource}
            className="hover:bg-primary/10 hover:text-primary"
        >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </Button>

        {/* Progress Bar */}
        <div className="flex-1 h-8 flex items-center gap-3">
             <span className="text-xs font-mono text-muted-foreground w-[40px] text-right">{fmt(currentTime)}</span>
             
             <div 
                className="flex-1 h-1.5 bg-muted rounded-full relative cursor-pointer group"
                onClick={handleProgressClick}
             >
                <div 
                    className="absolute top-0 left-0 h-full bg-primary rounded-full group-hover:bg-primary/80 transition-all"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                ></div>
                {/* Thumb using style left */}
                <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform"
                    style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                ></div>
             </div>
             
             <span className="text-xs font-mono text-muted-foreground w-[40px]">{fmt(duration)}</span>
        </div>

        <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => seek(currentTime - 5)}><SkipBack className="w-4 h-4" /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => seek(currentTime + 5)}><SkipForward className="w-4 h-4" /></Button>
        </div>
      </div>
    </section>
  );
}
