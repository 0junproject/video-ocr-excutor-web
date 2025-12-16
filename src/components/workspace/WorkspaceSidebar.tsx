"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, RotateCcw } from "lucide-react";
import { useVideoContext } from "@/context/VideoContext";
import { useExtractionContext } from "@/context/ExtractionContext";
import { useRef } from "react";

export function WorkspaceSidebar() {
  const { loadFile, loadUrl, startScreenShare, reset, setPlaybackRate } = useVideoContext();
  const { rois, removeRoi, settings, updateSettings, isCapturing, setCapturing } = useExtractionContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  return (
    <aside className="w-[320px] bg-card border-r border-border flex flex-col h-full overflow-y-auto">
      {/* 1. Source Control */}
      <div className="p-4 border-b border-border space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Source Control</h3>
        
        {/* URL Input */}
        <div className="flex gap-2">
            <Input 
                placeholder="Video URL (CORS allowed)" 
                className="h-8 text-xs font-mono"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        loadUrl(e.currentTarget.value);
                    }
                }}
            />
        </div>

        {/* Screen Share Button */}
        <Button 
            className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" 
            onClick={startScreenShare}
        >
             🖥️ Start Screen Share
        </Button>

        {/* File Input */}
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="video/*" 
            className="hidden" 
          />
          <Button className="flex-1 h-8 text-xs" variant="outline" onClick={() => fileInputRef.current?.click()}>
            Open File
          </Button>
          <Button className="w-[80px] h-8 text-xs" variant="secondary" onClick={reset}>
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
          <span className="text-muted-foreground text-xs">Playback Speed</span>
          <Select defaultValue="1.0" onValueChange={(v) => setPlaybackRate(parseFloat(v))}>
             <SelectTrigger className="w-[80px] h-7 text-xs">
               <SelectValue placeholder="Speed" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="0.5">0.5x</SelectItem>
               <SelectItem value="1.0">1.0x</SelectItem>
               <SelectItem value="1.5">1.5x</SelectItem>
               <SelectItem value="2.0">2.0x</SelectItem>
             </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Capture Settings */}
      <div className="p-4 border-b border-border space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Capture Settings</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <label className="text-muted-foreground">최소 주기 (ms)</label>
            <Input 
                type="number" 
                value={settings.interval} 
                onChange={(e) => updateSettings({ interval: parseInt(e.target.value) || 1000 })}
                className="w-[80px] h-8 text-right bg-background" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="text-muted-foreground">민감도</label>
              <span className="text-xs text-muted-foreground">{settings.sensitivity}%</span>
            </div>
            <Slider 
                value={[settings.sensitivity]} 
                onValueChange={(v) => updateSettings({ sensitivity: v[0] })}
                max={100} 
                step={1} 
                className="w-full" 
            />
          </div>
        </div>
      </div>

      {/* 3. ROI Structure */}
      <div className="p-4 flex-1 flex flex-col space-y-4">
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ROI Structure</h3>
                <span className="text-[10px] text-muted-foreground">Drag on video to add</span>
            </div>
            
            {/* Capture Control */}
            <div className="bg-muted/30 p-2 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium flex items-center gap-2">
                        Auto Extraction
                        {isCapturing && (
                            <span className="flex w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        )}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {rois.length} Regions
                    </span>
                </div>
                <Button 
                    className="w-full h-8 text-xs"
                    variant={isCapturing ? "destructive" : "default"} 
                    onClick={() => setCapturing(!isCapturing)}
                >
                   {isCapturing ? "Stop Capture" : "Start Capture"}
                </Button>
            </div>
        </div>

        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 text-xs">
                <TableHead className="h-8 w-[40px]">Col</TableHead>
                <TableHead className="h-8">Key</TableHead>
                <TableHead className="h-8 w-[40px] text-right">Del</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {rois.map((roi) => (
                <TableRow key={roi.id} className="hover:bg-muted/30">
                  <TableCell className="p-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: roi.color }}></div>
                  </TableCell>
                  <TableCell className="p-2">
                     <Input className="h-6 px-1 text-xs bg-transparent border-none focus-visible:ring-0" value={roi.name} readOnly />
                  </TableCell>
                  <TableCell className="p-2 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeRoi(roi.id)}
                      >
                          <Trash2 className="w-3 h-3" />
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rois.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-xs text-muted-foreground">
                        No regions defined
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <Button variant="outline" className="w-full border-dashed text-muted-foreground h-8 text-xs">
          <Plus className="w-3 h-3 mr-2" /> 영역 수동 추가
        </Button>
      </div>
    </aside>
  );
}
