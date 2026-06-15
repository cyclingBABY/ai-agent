import React, { useState, useEffect } from "react";
import { 
  Terminal, ShieldCheck, Cpu, Play, Settings, RefreshCw, Layers, 
  HelpCircle, Coffee, Layout, Sparkles, FolderGit, Volume2, Activity
} from "lucide-react";
import { SystemState, DiskFile, TaskPlan, TaskStep, Workflow, HistoryItem, DeveloperFile } from "./types";
import DesktopSimulator from "./components/DesktopSimulator";
import AgentConsole from "./components/AgentConsole";
import WorkflowBuilder from "./components/WorkflowBuilder";
import DeveloperKit from "./components/DeveloperKit";
import SystemHealth from "./components/SystemHealth";

export default function App() {
  const [mainActiveTab, setMainActiveTab] = useState<"dashboard" | "health" | "workflows" | "developer">("dashboard");
  const [simulatorTab, setSimulatorTab] = useState<"files" | "browser" | "screen">("files");

  // State engines loaded from Express full-stack API
  const [systemState, setSystemState] = useState<SystemState>({
    volume: 68,
    brightness: 85,
    currentApp: "Desktop",
    openedUrl: "https://www.google.com",
    isSleeping: false,
    isLocked: false,
    lastScreenshotTime: null,
    screenshotContent: null,
    ocrDetectedText: []
  });

  const [fileSystem, setFileSystem] = useState<DiskFile[]>([]);
  const [tasksHistory, setTasksHistory] = useState<HistoryItem[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [developerFiles, setDeveloperFiles] = useState<DeveloperFile[]>([]);
  const [activePlan, setActivePlan] = useState<TaskPlan | null>(null);

  // Load backend states on mount
  useEffect(() => {
    fetchStates();
    fetchDeveloperFiles();
    fetchWorkflows();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await fetch("/api/state");
      const data = await response.json();
      if (data.systemState) setSystemState(data.systemState);
      if (data.fileSystem) setFileSystem(data.fileSystem);
      if (data.tasksHistory) setTasksHistory(data.tasksHistory);
    } catch (err) {
      console.error("Error load API states:", err);
    }
  };

  const fetchDeveloperFiles = async () => {
    try {
      const response = await fetch("/api/dev/files");
      const data = await response.json();
      setDeveloperFiles(data);
    } catch (err) {
      console.error("Error load developer files:", err);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await fetch("/api/workflows");
      const data = await response.json();
      setWorkflows(data);
    } catch (err) {
      console.error("Error load workflow list:", err);
    }
  };

  const handleUpdateSystemState = async (updates: Partial<SystemState>) => {
    setSystemState((prev) => ({ ...prev, ...updates }));
    try {
      await fetch("/api/state/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error("Error persisting states update:", e);
    }
  };

  const handleDeleteSimulatedFile = async (filePath: string) => {
    try {
      const res = await fetch("/api/file/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath })
      });
      const data = await res.json();
      if (data.fileSystem) setFileSystem(data.fileSystem);
    } catch (e) {
      console.error("Error executing file delete:", e);
    }
  };

  const handleCaptureScreenshotSimulated = async () => {
    try {
      const res = await fetch("/api/state/screenshot", { method: "POST" });
      const data = await res.json();
      if (data.systemState) setSystemState(data.systemState);
      setSimulatorTab("screen"); // Quick tab focus to OCR Vision view
    } catch (e) {
      console.error("Error during simulated capture:", e);
    }
  };

  const handleExecuteStepSimulated = async (step: TaskStep): Promise<string> => {
    try {
      const res = await fetch("/api/agent/simulate-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step })
      });
      const data = await res.json();
      if (data.systemState) setSystemState(data.systemState);
      if (data.fileSystem) setFileSystem(data.fileSystem);
      if (data.tasksHistory) setTasksHistory(data.tasksHistory);

      // Force UI updates based on executed action category
      if (step.action === "browser_action") {
        setSimulatorTab("browser");
      } else if (step.action === "manage_files") {
        setSimulatorTab("files");
      } else if (step.action === "ocr_understanding") {
        setSimulatorTab("screen");
      }

      return data.consoleLog || `[TaskPilot AI Simulator] Successfully executed action step: ${step.target}`;
    } catch (e: any) {
      throw new Error(e.message || "Execution error on API");
    }
  };

  const handleSaveWorkflowSimulated = async (name: string, description: string, steps: any[]) => {
    try {
      const res = await fetch("/api/workflows/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, steps, icon: "Activity" })
      });
      const data = await res.json();
      if (data.success) {
        fetchWorkflows();
      }
    } catch (e) {
      console.error("Error writing workflow:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-350 flex flex-col font-sans">
      
      {/* Dynamic Security/Locked Suspended Overlays */}
      {systemState.isLocked && (
        <div className="fixed inset-0 bg-[#0A0B0E]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0F1117] border border-slate-800/60 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-100">
                TaskPilot AI Secured Lockscreen
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Workstation was locked through automated system triggers. Input password parameters to authorize session retrieval.
              </p>
            </div>
            <button
              onClick={() => handleUpdateSystemState({ isLocked: false })}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-lg text-white transition-all shadow-lg"
            >
              Sign In (Sandbox Authorization)
            </button>
          </div>
        </div>
      )}

      {systemState.isSleeping && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md text-center space-y-4">
            <p className="text-sm text-slate-500 font-mono tracking-widest animate-pulse">
              [SYSTEM SUSPENDED]
            </p>
            <button
              onClick={() => handleUpdateSystemState({ isSleeping: false })}
              className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-[#0F1117] text-xs font-bold text-slate-300 rounded-lg transition"
            >
              Wake TaskPilot Assistant
            </button>
          </div>
        </div>
      )}

      {/* Primary Application Header */}
      <header className="px-6 py-4 bg-[#0F1117] border-b border-slate-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg ring-2 ring-blue-500/20">
            <Cpu className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                TaskPilot<span className="text-blue-500">AI</span>
              </h1>
              <span className="text-[10px] text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded border border-blue-800/50 font-bold font-mono tracking-wider">
                DESKTOP AGENT PLATFORM
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Control operating systems & browser pipelines via natural instructions.</p>
          </div>
        </div>

        {/* Global tab routing selection bar */}
        <nav className="flex items-center gap-1 bg-[#161920] p-1 rounded-lg border border-slate-800/50">
          <button
            onClick={() => setMainActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              mainActiveTab === "dashboard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            Control Hub
          </button>
          <button
            onClick={() => setMainActiveTab("health")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              mainActiveTab === "health"
                ? "bg-blue-600 text-white shadow-md shadow-blue-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            System Health
          </button>
          <button
            onClick={() => setMainActiveTab("workflows")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              mainActiveTab === "workflows"
                ? "bg-blue-600 text-white shadow-md shadow-blue-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Routine Automation
          </button>
          <button
            onClick={() => setMainActiveTab("developer")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              mainActiveTab === "developer"
                ? "bg-blue-600 text-white shadow-md shadow-blue-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderGit className="w-3.5 h-3.5" />
            Developer Kit & Code
          </button>
        </nav>
      </header>

      {/* Main Content viewport container */}
      <main className="flex-1 p-4 lg:p-6 overflow-hidden max-w-[1536px] w-full mx-auto">
        {mainActiveTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
            {/* Left Desktop VM sandbox simulator */}
            <div className="lg:col-span-6 xl:col-span-7 h-[calc(100vh-180px)] min-h-[480px]">
              <DesktopSimulator
                systemState={systemState}
                fileSystem={fileSystem}
                onUpdateState={handleUpdateSystemState}
                onRefreshAll={fetchStates}
                onDeleteFile={handleDeleteSimulatedFile}
                onCaptureScreenshot={handleCaptureScreenshotSimulated}
                activeTab={simulatorTab}
                setActiveTab={setSimulatorTab}
              />
            </div>

            {/* Right Assistant Command Console */}
            <div className="lg:col-span-6 xl:col-span-5 h-[calc(100vh-180px)] min-h-[480px]">
              <AgentConsole
                systemState={systemState}
                onUpdateState={handleUpdateSystemState}
                onRefreshAll={fetchStates}
                onPlanLoaded={setActivePlan}
                activePlan={activePlan}
                setActivePlan={setActivePlan}
                onExecuteStep={handleExecuteStepSimulated}
              />
            </div>
          </div>
        )}

        {mainActiveTab === "health" && (
          <div className="h-[calc(100vh-180px)] min-h-[480px] overflow-auto pr-1">
            <SystemHealth />
          </div>
        )}

        {mainActiveTab === "workflows" && (
          <div className="h-[calc(100vh-180px)] min-h-[480px]">
            <WorkflowBuilder
              workflows={workflows}
              onSaveNewWorkflow={handleSaveWorkflowSimulated}
              onExecuteSimulatedStep={handleExecuteStepSimulated}
            />
          </div>
        )}

        {mainActiveTab === "developer" && (
          <div className="h-[calc(100vh-180px)] min-h-[480px]">
            <DeveloperKit devFiles={developerFiles} />
          </div>
        )}
      </main>
    </div>
  );
}
