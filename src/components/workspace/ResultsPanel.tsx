"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, ScrollText, Trash2 } from "lucide-react";
import { useExtractionContext } from "@/context/ExtractionContext";

export function ResultsPanel() {
  const { results, clearResults } = useExtractionContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Simple auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [results]);

  const handleExport = () => {
    const jsonString = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[250px] shrink-0 bg-card border-t border-border flex flex-col z-20">
      {/* Header */}
      <div className="h-[40px] px-4 border-b border-border flex items-center justify-between bg-muted/20">
         <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground">Extraction Results ({results.length})</h3>
         </div>

         <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearResults}>
                <Trash2 className="w-3 h-3 mr-1" /> Clear
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-2" onClick={handleExport}>
                <Download className="w-3 h-3" /> Export JSON
            </Button>
         </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted/40 sticky top-0 z-10 text-xs uppercase text-muted-foreground">
                <tr>
                    <th className="px-4 py-2 border-b border-border w-[100px] font-medium">Time</th>
                    <th className="px-4 py-2 border-b border-border w-[150px] font-medium">Key</th>
                    <th className="px-4 py-2 border-b border-border font-medium">Value</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-card">
                {results.length === 0 ? (
                    <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground text-xs">
                            No results extracted yet. Set up ROIs and click Start Capture.
                        </td>
                    </tr>
                ) : (
                    results.map((res) => (
                        <tr key={res.id} className="hover:bg-muted/10 font-mono text-xs text-muted-foreground transition-colors">
                            <td className="px-4 py-2">{res.formattedTime}</td>
                            <td className="px-4 py-2 font-semibold text-foreground">{res.key}</td>
                            <td className="px-4 py-2 text-foreground break-all">{res.value}</td>
                        </tr>
                    ))
                )}
                {/* Dummy div for auto-scroll target */}
                <tr ref={bottomRef as any}></tr>
            </tbody>
        </table>
      </div>
    </div>
  );
}
