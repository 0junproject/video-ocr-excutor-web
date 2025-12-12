import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { VideoStage } from "@/components/workspace/VideoStage";
import { ResultsPanel } from "@/components/workspace/ResultsPanel";
import { VideoProvider } from "@/context/VideoContext";
import { ExtractionProvider } from "@/context/ExtractionContext";
import { AutoCaptureManager } from "@/components/workspace/AutoCaptureManager";

export default function WorkspacePage() {
  return (
    <VideoProvider>
      <ExtractionProvider>
        <AutoCaptureManager />
        <div className="flex h-full w-full overflow-hidden">
          {/* 1. Left Panel */}
          <WorkspaceSidebar />

          {/* 2. Main Area (Video + Results) */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <VideoStage />
              <ResultsPanel />
          </div>
        </div>
      </ExtractionProvider>
    </VideoProvider>
  );
}
