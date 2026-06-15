import React, { useState, useEffect } from "react";
import { Folder, File, Terminal, Globe, Volume2, Sun, Laptop, ShieldCheck, HelpCircle, ArrowRight, Eye, RefreshCw, Layers, Toggle2, HardDrive, Loader, AlertCircle } from "lucide-react";
import { DiskFile, SystemState } from "../types";

interface DesktopSimulatorProps {
  systemState: SystemState;
  fileSystem: DiskFile[];
  onUpdateState: (updates: Partial<SystemState>) => void;
  onRefreshAll: () => void;
  onDeleteFile: (filePath: string) => void;
  onCaptureScreenshot: () => void;
  activeTab: "files" | "browser" | "screen";
  setActiveTab: (tab: "files" | "browser" | "screen") => void;
  
  // Real file system props
  useRealFileSystem?: boolean;
  setUseRealFileSystem?: (value: boolean) => void;
  realFileSystem?: DiskFile[];
  realFileSystemLoading?: boolean;
  fetchRealFileSystem?: () => void;
  browsePath?: (path: string) => void;
  
  // Document viewing props
  fetchDocumentContent?: (filePath: string) => void;
  selectedDocumentPath?: string | null;
  documentContent?: string | null;
  documentLoading?: boolean;
  documentError?: string | null;
}

export default function DesktopSimulator({
  systemState,
  fileSystem,
  onUpdateState,
  onRefreshAll,
  onDeleteFile,
  onCaptureScreenshot,
  activeTab,
  setActiveTab,
  useRealFileSystem = false,
  setUseRealFileSystem = () => {},
  realFileSystem = [],
  realFileSystemLoading = false,
  fetchRealFileSystem = () => {},
  browsePath = () => {},
  fetchDocumentContent = () => {},
  selectedDocumentPath = null,
  documentContent = null,
  documentLoading = false,
  documentError = null
}: DesktopSimulatorProps) {
  const [selectedFolder, setSelectedFolder] = useState<string>("/");
  const [currentBrowserUrl, setCurrentBrowserUrl] = useState<string>(systemState.openedUrl);
  const [browserHistory, setBrowserHistory] = useState<string[]>([systemState.openedUrl]);
  
  // Display files based on mode
  const displayedFileSystem = useRealFileSystem ? realFileSystem : fileSystem;

  // Keep browser URL input bar synchronized with external automated browser actions
  useEffect(() => {
    setCurrentBrowserUrl(systemState.openedUrl);
    setBrowserHistory((prev) => {
      if (prev[prev.length - 1] !== systemState.openedUrl) {
        return [...prev, systemState.openedUrl];
      }
      return prev;
    });
  }, [systemState.openedUrl]);

  // Navigate back to parent folder helper
  const navigateToParent = () => {
    if (selectedFolder === "/" || selectedFolder === "") return;
    const parts = selectedFolder.split("\\").filter(Boolean);
    parts.pop();
    const newPath = parts.join("\\");
    setSelectedFolder(newPath || "C:\\");
  };

  // Find files in current subdirectory
  const getCurrentFiles = (): DiskFile[] => {
    if (useRealFileSystem) {
      // For real file system, just return top-level items directly
      return displayedFileSystem;
    } else {
      // For simulated file system (original logic)
      if (selectedFolder === "/") return fileSystem;
      const parts = selectedFolder.split("/").filter(Boolean);
      let current = fileSystem;
      for (const part of parts) {
        const match = current.find((item) => item.name === part && item.type === "directory");
        if (match && match.children) {
          current = match.children;
        }
      }
      return current;
    }
  };

  const handleBrowserGo = () => {
    let url = currentBrowserUrl;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    setCurrentBrowserUrl(url);
    onUpdateState({ openedUrl: url });
    setBrowserHistory((prev) => [...prev, url]);
  };

  const currentFolderFiles = getCurrentFiles();

  return (
    <div className="flex flex-col h-full bg-[#0F1117] border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl">
      {/* Top OS Frame Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161920] border-b border-slate-800/50 text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <Laptop className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-semibold text-slate-200">Local OS Space: TaskPilot Sandbox VM</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Volume: {systemState.volume}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Brightness: {systemState.brightness}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider font-semibold">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Simulator Navigation Tabs */}
      <div className="flex items-center px-4 py-1.5 bg-[#161920]/40 border-b border-slate-800/50 text-xs">
        <div className="flex gap-1.5 font-sans">
          <button
            onClick={() => setActiveTab("files")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
              activeTab === "files"
                ? "bg-blue-600/15 border border-blue-500/40 text-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-blue-500" />
            File system View
          </button>
          <button
            onClick={() => setActiveTab("browser")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
              activeTab === "browser"
                ? "bg-blue-600/15 border border-blue-500/40 text-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            Automated Browser
          </button>
          <button
            onClick={() => setActiveTab("screen")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
              activeTab === "screen"
                ? "bg-blue-600/15 border border-blue-500/40 text-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            Screen & OCR View
          </button>
        </div>
        <div className="ml-auto">
          <button
            onClick={onRefreshAll}
            title="Refresh local states"
            className="p-1 text-slate-500 hover:text-slate-300 rounded transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Simulator Workspace Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* FILE SYSTEM VIEW */}
        {activeTab === "files" && (
          <div className="space-y-4">
            {/* File System Mode Toggle */}
            <div className="flex items-center justify-between gap-3 p-3 bg-[#161920]/40 border border-slate-800/60 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${useRealFileSystem ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`}></div>
                <span className="text-xs font-semibold text-slate-300">
                  {useRealFileSystem ? "Viewing Real Computer Files" : "Viewing Simulated Files"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {useRealFileSystem && (
                  <button
                    onClick={() => fetchRealFileSystem()}
                    disabled={realFileSystemLoading}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/15 ring-1 ring-blue-500/20 rounded font-medium transition disabled:opacity-50"
                  >
                    {realFileSystemLoading && <Loader className="w-3 h-3 animate-spin" />}
                    {realFileSystemLoading ? "Loading..." : "Load Desktop"}
                  </button>
                )}
                <button
                  onClick={() => setUseRealFileSystem(!useRealFileSystem)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-700/40 hover:bg-slate-700/60 ring-1 ring-slate-600/40 rounded font-medium transition"
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  {useRealFileSystem ? "Show Simulated" : "Show Real Files"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs py-1 px-2.5 bg-[#0A0B0E] rounded border border-slate-800/55 font-mono">
              <span className="text-slate-500 font-semibold text-[10px] uppercase font-sans">Current Path:</span>
              <span className="text-amber-500 font-semibold truncate">{useRealFileSystem ? (selectedFolder || "C:\\") : selectedFolder}</span>
            </div>

            {/* Folder Actions Panel */}
            <div className="flex items-center justify-between">
              {((useRealFileSystem && selectedFolder) || (!useRealFileSystem && selectedFolder !== "/")) && (
                <button
                  onClick={navigateToParent}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/15 ring-1 ring-blue-500/20 rounded font-medium transition"
                >
                  ← Up to parent
                </button>
              )}
              <span className="text-[11px] text-slate-500 font-sans">
                {getCurrentFiles().length} item{getCurrentFiles().length !== 1 && "s"} inside
              </span>
            </div>

            {/* Grid of files and directories */}
            {currentFolderFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-800/60 rounded-lg text-slate-505">
                <Folder className="w-8 h-8 text-slate-600 mb-2" />
                <span className="text-xs font-medium">Directory is empty</span>
                <span className="text-[10px] text-slate-600 mt-1">
                  Instruct TaskPilot client via chat command to populate this folder.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                {currentFolderFiles.map((file) => {
                  const isDir = file.type === "directory";
                  const isSelected = selectedDocumentPath === file.path;
                  return (
                    <div
                      key={file.path}
                      onClick={() => {
                        if (isDir) {
                          setSelectedFolder(file.path);
                        } else if (useRealFileSystem) {
                          // Open document content viewer for real files
                          fetchDocumentContent(file.path);
                        }
                      }}
                      className={`group relative p-3 border rounded-lg transition duration-200 ${
                        isSelected
                          ? "bg-blue-600/15 border-blue-500/60 ring-1 ring-blue-500/40"
                          : isDir
                          ? "bg-[#161920]/60 border-slate-800 hover:border-slate-700/80 cursor-pointer"
                          : "bg-[#161920]/20 border-slate-800/80 hover:border-slate-800 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded bg-[#0A0B0E] border border-slate-800/80 mt-0.5 animate-fade-in">
                          {isDir ? (
                            <Folder className="w-4 h-4 text-amber-500 fill-amber-500/25" />
                          ) : (
                            <File className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition">
                            {file.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {isDir ? "Folder" : file.size || "Unknown size"}
                          </span>

                          {/* Preview document text snippet if present */}
                          {!isDir && file.content && (
                            <p className="text-[10px] text-slate-400 mt-1.5 p-1 bg-[#0A0B0E] border border-slate-900 rounded font-mono truncate leading-normal">
                              {file.content}
                            </p>
                          )}
                        </div>

                        {/* Interactive local Delete mock */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFile(file.path);
                          }}
                          className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-all"
                          title="Delete simulation"
                        >
                          <span className="text-[9px] font-semibold bg-rose-950 px-1 py-0.5 rounded ring-1 ring-rose-500/20">
                            Delete
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Document Content Viewer Panel */}
            {useRealFileSystem && selectedDocumentPath && (
              <div className="mt-4 p-4 bg-[#0A0B0E] border border-slate-800/60 rounded-lg max-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-200">
                    📄 {selectedDocumentPath.split('\\').pop()}
                  </span>
                  <button
                    onClick={() => setSelectedDocumentPath(null)}
                    className="text-slate-500 hover:text-slate-300 text-xs"
                  >
                    ✕ Close
                  </button>
                </div>
                
                {documentLoading ? (
                  <div className="flex items-center justify-center py-8 text-slate-400">
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Loading document...
                  </div>
                ) : documentError ? (
                  <div className="flex items-center gap-2 py-4 px-3 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{documentError}</span>
                  </div>
                ) : documentContent ? (
                  <div className="flex-1 overflow-y-auto text-[11px] font-mono text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
                    {documentContent}
                  </div>
                ) : null}
              </div>
            )}

            {/* Quick Helper Section */}
            <div className="p-3 bg-[#161920]/35 border border-slate-800/40 rounded-lg text-[11px] leading-relaxed text-slate-400 font-sans">
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                Active Sandbox File System Sync
              </div>
              Files are tracked directly in-memory within the Express server environment. Try saying:{" "}
              <code className="text-amber-500 font-mono">"Create a folder named Archives"</code> or{" "}
              <code className="text-amber-500 font-mono">"organize files in Downloads"</code> to watch TaskPilot
              automatically update the tree structure above.
            </div>
          </div>
        )}

        {/* AUTOMATED BROWSER SIMULATOR */}
        {activeTab === "browser" && (
          <div className="space-y-4">
            {/* Mock Web Address browser bar */}
            <div className="flex items-center gap-2 p-1.5 bg-[#0A0B0E] border border-slate-800/50 rounded-lg">
              <div className="flex gap-1 px-1 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
              </div>
              <div className="flex-1 flex items-center bg-[#161920]/40 border border-slate-800/55 rounded px-2 py-1 text-xs text-slate-300 focus-within:ring-1 focus-within:ring-blue-500">
                <Globe className="w-3.5 h-3.5 text-blue-500 mr-2" />
                <input
                  type="text"
                  value={currentBrowserUrl}
                  onChange={(e) => setCurrentBrowserUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBrowserGo()}
                  className="flex-1 bg-transparent border-none outline-none font-mono text-slate-200"
                />
              </div>
              <button
                onClick={handleBrowserGo}
                className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-550 rounded transition"
              >
                Go
              </button>
            </div>

            {/* Generated Mock Browser Page Window */}
            <div className="border border-slate-800/50 rounded-lg bg-[#0A0B0E] overflow-hidden min-h-[220px] flex flex-col">
              {/* Browser window banner */}
              <div className="bg-[#161920]/60 px-3 py-1.5 border-b border-slate-800/50 text-[10px] text-slate-500 font-mono truncate">
                Status: Connected via Playwright driver frame. Loaded SSL layer.
              </div>

              {/* Dynamic Site Representation */}
              <div className="p-4 flex-1 flex flex-col justify-center items-center text-center">
                {currentBrowserUrl.includes("google.com/search") ? (() => {
                  let query = "latest AI trends";
                  try {
                    const params = new URLSearchParams(currentBrowserUrl.split("?")[1]);
                    query = params.get("q") || "latest AI trends";
                  } catch (e) {}

                  const formattedQuery = decodeURIComponent(query).replace(/\+/g, " ");
                  
                  return (
                    <div className="w-full text-left space-y-3 font-sans">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                        <h3 className="text-xs font-semibold text-slate-400">Google Search Results</h3>
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded font-mono">
                          Query: "{formattedQuery}"
                        </span>
                      </div>
                      
                      <div 
                        onClick={() => {
                          const dest = `https://en.wikipedia.org/wiki/${encodeURIComponent(formattedQuery)}`;
                          setCurrentBrowserUrl(dest);
                          onUpdateState({ openedUrl: dest });
                        }}
                        className="p-3 bg-[#161920]/40 hover:bg-blue-600/5 hover:border-blue-500/30 rounded border border-slate-800/50 cursor-pointer transition"
                      >
                        <span className="text-blue-400 text-xs font-medium hover:underline">
                          Wikipedia: {formattedQuery} - Definitions, Details, and Context
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Comprehensive documentation of {formattedQuery} including historical background, modern practical implications, and related technologies.
                        </p>
                      </div>

                      <div 
                        onClick={() => {
                          const dest = `https://techcrunch.com/tag/${encodeURIComponent(formattedQuery)}`;
                          setCurrentBrowserUrl(dest);
                          onUpdateState({ openedUrl: dest });
                        }}
                        className="p-3 bg-[#161920]/40 hover:bg-blue-600/5 hover:border-blue-500/30 rounded border border-slate-800/50 cursor-pointer transition"
                      >
                        <span className="text-blue-400 text-xs font-medium hover:underline">
                          Latest News, Updates, and Industry Reports on: "{formattedQuery}"
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Read deep dives, trending debates, vendor evaluations, and expert panels exploring the next-gen innovations of {formattedQuery}.
                        </p>
                      </div>

                      <div 
                        onClick={() => {
                          const dest = `https://github.com/topics/${encodeURIComponent(formattedQuery)}`;
                          setCurrentBrowserUrl(dest);
                          onUpdateState({ openedUrl: dest });
                        }}
                        className="p-3 bg-[#161920]/40 hover:bg-blue-600/5 hover:border-blue-500/30 rounded border border-slate-800/50 cursor-pointer transition"
                      >
                        <span className="text-blue-400 text-xs font-medium hover:underline">
                          GitHub - Open Source Repository Directory: {formattedQuery}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Explore collaborative codebases, tool bundles, orchestration libraries, and community checklists built around the {formattedQuery} ecosystem.
                        </p>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="space-y-3 max-w-sm font-sans">
                    <div className="w-10 h-10 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                      <Globe className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Simulated Active Viewport</h4>
                      <p className="text-[11px] text-slate-405 mt-1 truncate">
                        Currently viewing: <span className="text-blue-400 font-mono">{currentBrowserUrl}</span>
                      </p>
                    </div>
                    <div className="p-2 bg-[#161920]/50 rounded text-[10px] font-mono text-slate-400 max-w-xs mx-auto">
                      TaskPilot is parsing web structure. Instruct agent prompts:{" "}
                      <span className="text-amber-500">"Summarize this website"</span> to fetch pages.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SCREEN & OCR COGNITION VIEW */}
        {activeTab === "screen" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-200">Computer Vision Screen Reader</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Simulate agent computer vision screen scanning.</p>
              </div>
              <button
                onClick={onCaptureScreenshot}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/35 rounded-lg transition font-semibold"
              >
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                Capture Display
              </button>
            </div>

            {/* Virtual Screen display card */}
            {systemState.screenshotContent ? (
              <div className="space-y-3 font-sans">
                {/* Visual Representation of Active Display */}
                <div className="relative border border-slate-800/65 rounded-lg overflow-hidden bg-[#0A0B0E] p-4 min-h-[220px] flex flex-col justify-between">
                  {/* Overlay grids simulating screen detection */}
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-5 hover:opacity-10 transition duration-300">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="border border-slate-600/40"></div>
                    ))}
                  </div>

                  {/* Top bar */}
                  <div className="flex items-center justify-between text-[9px] text-blue-400 font-mono z-10">
                    <span className="bg-blue-900/40 border border-blue-800/40 px-2 py-0.5 rounded">
                      OCR CAPTURE IN PROGRESS
                    </span>
                    <span className="text-slate-505">{systemState.lastScreenshotTime?.split("T")[1].slice(0, 8)}</span>
                  </div>

                  {/* Main screen content mapping */}
                  <div className="my-6 z-10">
                    <div className="space-y-2 max-w-sm mx-auto bg-[#161920]/90 border border-slate-800 p-3 rounded-lg backdrop-blur-sm shadow-xl">
                      <div className="flex items-center gap-2 border-b border-blue-500/20 pb-1.5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-blue-550 animate-pulse"></span>
                        <span className="text-[10px] font-mono text-blue-400 font-semibold">Active Windows identified</span>
                      </div>
                      <div className="space-y-1.5 font-mono text-[9px] text-slate-300">
                        {systemState.ocrDetectedText.map((text, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-[#0A0B0E]/60 p-1 rounded hover:bg-blue-950/20 transition-all border border-slate-900/60 select-all">
                            <span className="text-[8px] text-blue-400 bg-blue-950/70 px-1 rounded border border-blue-805/30">0{idx+1}</span>
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Target coordinates bar */}
                  <div className="text-[9px] text-slate-500 font-mono text-right z-10">
                    Capture dimensions: 1925x1080 | Scaling: 100%
                  </div>
                </div>

                <div className="p-3 bg-[#161920]/40 border border-slate-800/45 rounded-lg text-[11px] leading-relaxed text-slate-400 font-sans">
                  <span className="text-amber-500 font-semibold uppercase text-[9px] font-sans block mb-1">Agent Vision Reasoning:</span>
                  Dispatched screenshot frame scanner. TaskPilot maps localized coordinate targets (like clicking buttons or highlighting inputs) via OCR reading. Try asking: <span className="text-blue-450 font-semibold">"Read my screen"</span>.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-800/60 rounded-lg text-slate-500 bg-[#0A0B0E]/30 font-sans">
                <Laptop className="w-10 h-10 text-slate-600 mb-2" />
                <span className="text-xs font-medium text-slate-400">No system capture loaded</span>
                <span className="text-[10px] text-slate-505 mt-1 max-w-xs text-center leading-normal">
                  Click 'Capture Display' above or prompt TaskPilot with command instructions that require screen content.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simulator System State Controls Footer */}
      <div className="p-3.5 bg-blue-950/10 border-t border-slate-800/50 font-sans">
        <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-blue-500" />
          Interactive System Controls & Parameters
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#0A0B0E]/60 p-2.5 rounded border border-slate-800/80 space-y-2">
            <span className="text-[10px] text-slate-400 block font-medium">Primary Mixer (Volume)</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={systemState.volume}
                onChange={(e) => onUpdateState({ volume: parseInt(e.target.value) })}
                className="flex-1 accent-blue-500"
              />
              <span className="font-mono text-slate-300 w-8 text-right">{systemState.volume}%</span>
            </div>
          </div>

          <div className="bg-[#0A0B0E]/60 p-2.5 rounded border border-slate-800/80 space-y-2">
            <span className="text-[10px] text-slate-400 block font-medium">Monitor Intensity (Brightness)</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={systemState.brightness}
                onChange={(e) => onUpdateState({ brightness: parseInt(e.target.value) })}
                className="flex-1 accent-blue-500"
              />
              <span className="font-mono text-slate-300 w-8 text-right">{systemState.brightness}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
