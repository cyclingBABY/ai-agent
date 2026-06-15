import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, Play, CheckCircle2, AlertCircle, Terminal, ChevronDown, ChevronUp, 
  Copy, Volume2, ShieldAlert, X, MousePointer, StopCircle, Compass, 
  Search, Download, Check, AlertTriangle, ShieldCheck
} from "lucide-react";
import { TaskPlan, TaskStep, SystemState } from "../types";

interface HudPanelProps {
  activePlan: TaskPlan | null;
  setActivePlan: (plan: TaskPlan | null) => void;
  onExecuteStep: (step: TaskStep) => Promise<string>;
  onUpdateState: (updates: Partial<SystemState>) => void;
  systemState: SystemState;
  activeTheme: "Cyber Blue" | "Midnight Purple" | "Monochrome Slate";
  triggerAutoFeedback: (
    type: "info" | "success" | "warning" | "error",
    title: string,
    message: string,
    speechText?: string
  ) => void;
  ttsText: string;
  ttsSpeaking: boolean;
  isFloatingRecording: boolean;
  setIsFloatingRecording: (listening: boolean) => void;
  floatingSpeechVolume: number;
  floatingSpeechTranscript?: string;
  setFloatingSpeechTranscript?: (txt: string) => void;
  isFloatingEvaluating: boolean;
  setIsFloatingEvaluating: (evaluating: boolean) => void;
  executionLogs: string[];
  setExecutionLogs: React.Dispatch<React.SetStateAction<string[]>>;
  onCloseHud: () => void;
}

export default function HudPanel({
  activePlan,
  setActivePlan,
  onExecuteStep,
  onUpdateState,
  systemState,
  activeTheme,
  triggerAutoFeedback,
  ttsText,
  ttsSpeaking,
  isFloatingRecording,
  setIsFloatingRecording,
  floatingSpeechVolume,
  floatingSpeechTranscript,
  setFloatingSpeechTranscript,
  isFloatingEvaluating,
  setIsFloatingEvaluating,
  executionLogs,
  setExecutionLogs,
  onCloseHud
}: HudPanelProps) {
  // HUD-specific UI States
  const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false);
  const [logsSearch, setLogsSearch] = useState("");
  const [isExecutingPlan, setIsExecutingPlan] = useState(false);
  const [currentExecutingIndex, setCurrentExecutingIndex] = useState<number>(-1);
  const [liveSpeechTranscript, setLiveSpeechTranscript] = useState("Standing by for audio signal...");
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [countdownStepId, setCountdownStepId] = useState<string | null>(null);
  const [countdownRemaining, setCountdownRemaining] = useState<number>(0);
  
  const executionStopRef = useRef(false);
  const timerRef = useRef<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Setup Global Spacebar Event for immediate interruption
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.code === "Space" && isExecutingPlan && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        handleStopExecution();
      }
    };
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [isExecutingPlan, currentExecutingIndex]);

  // Autoscroll the bottom logs drawer when new outputs append
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [executionLogs, isLogsDrawerOpen]);

  // Simulating microphone word-by-word streaming transcript when recording is active
  useEffect(() => {
    if (isFloatingRecording) {
      if (floatingSpeechTranscript) {
        setLiveSpeechTranscript(floatingSpeechTranscript + "...");
        return;
      }
      setLiveSpeechTranscript("Listening to vocal input...");
      const fullPhrases = [
        "Open Chrome browser and search with query latest AI computing patterns",
        "Create project workspace folders named Reports and Archive in Documents",
        "Set volume audio channel to 40 percent then lock workstation",
        "Move pdf documents to directory Archive and flush telemetry caches"
      ];
      const targetPhrase = fullPhrases[Math.floor(Math.random() * fullPhrases.length)];
      const words = targetPhrase.split(" ");
      let currentWordIndex = 0;
      
      const transcriptInterval = setInterval(() => {
        if (currentWordIndex < words.length) {
          const displayed = words.slice(0, currentWordIndex + 1).join(" ");
          setLiveSpeechTranscript(displayed + "...");
          currentWordIndex++;
        }
      }, 350);

      return () => clearInterval(transcriptInterval);
    } else {
      if (!isFloatingEvaluating) {
        setLiveSpeechTranscript("Standing by for audio signal...");
      }
    }
  }, [isFloatingRecording, isFloatingEvaluating, floatingSpeechTranscript]);

  // Handle interrupting current executing plan
  const handleStopExecution = () => {
    executionStopRef.current = true;
    setIsExecutingPlan(false);
    
    // Mutate any executing/pending status steps to failed or pending
    if (activePlan) {
      const updatedSteps = activePlan.steps.map((step, idx) => {
        if (step.status === "executing") {
          return { ...step, status: "failed" as const, explanation: "Interrupted by User Emergency Halt Protocol." };
        }
        return step;
      });
      setActivePlan({ ...activePlan, steps: updatedSteps });
    }

    setExecutionLogs(prev => [
      ...prev,
      `[EMERGENCY PROTOCOL] Spacebar interrupt captured. Halted dynamic simulator automated execution vector immediately.`,
      `[Voice Server] Informing operator of sequence suspension feedback...`
    ]);

    triggerAutoFeedback(
      "warning",
      "Sequence Force-Halted",
      "Operator command or Spacebar click intercepted. Execution stack suspended immediately.",
      "Stopped, Stuart. Holding workstation operations here."
    );
  };

  // Run a single specific step
  const handleExecuteSingleStep = async (step: TaskStep, index: number) => {
    if (!activePlan) return;
    
    const updatedSteps = [...activePlan.steps];
    updatedSteps[index].status = "executing";
    setActivePlan({ ...activePlan, steps: updatedSteps });
    setCurrentExecutingIndex(index);

    setExecutionLogs(prev => [
      ...prev, 
      `[HUD Dispatcher] Booting sandbox simulator event processor for ID: ${step.id} (${step.action})`
    ]);

    try {
      const logOutput = await onExecuteStep(step);
      setExecutionLogs(prev => [...prev, logOutput]);
      
      const completedSteps = [...activePlan.steps];
      completedSteps[index].status = "completed";
      setActivePlan({ ...activePlan, steps: completedSteps });
      
      return true;
    } catch (err: any) {
      const failedSteps = [...activePlan.steps];
      failedSteps[index].status = "failed";
      setActivePlan({ ...activePlan, steps: failedSteps });
      setExecutionLogs(prev => [...prev, `[Action Fail] Simulator Exception: ${err.message || err}`]);
      return false;
    } finally {
      setCurrentExecutingIndex(-1);
    }
  };

  // Run the whole plan loop
  const handleRunFullPlanSeq = async () => {
    if (!activePlan) return;
    setIsExecutingPlan(true);
    executionStopRef.current = false;
    
    setExecutionLogs(prev => [
      ...prev,
      `[HUD Core] Initiating cascading execution of active automation plan: "${activePlan.originalCommand}"`
    ]);

    for (let i = 0; i < activePlan.steps.length; i++) {
      if (executionStopRef.current) break;
      
      const step = activePlan.steps[i];
      if (step.status === "completed") continue;

      // Handle safety confirmations
      if (step.requiresApproval && step.status !== "approved") {
        setExecutionLogs(prev => [
          ...prev,
          `[HUD Security Alert] Execution halted on step ${i + 1}. Action "${step.action}" targeting "${step.target}" requires active operator manual confirmation.`
        ]);
        
        // Start live safety prompt countdown (8 seconds)
        setCountdownStepId(step.id);
        setCountdownRemaining(8);
        setCurrentExecutingIndex(i);

        triggerAutoFeedback(
          "warning",
          "Awaiting Security Clear",
          `Rule Guard: Step requires safety confirmation. Approve on screen to resume execution.`,
          `I need your approval before executing ${step.action === "manage_files" ? "file modifications" : "system level locks"}, Stuart.`
        );

        // Wait in loop until approved or rejected
        let isApproved = false;
        let isRejected = false;
        
        while (countdownRemaining >= 0 && !executionStopRef.current) {
          // Poll step state
          if (activePlan.steps[i].status === "approved") {
            isApproved = true;
            break;
          }
          if (activePlan.steps[i].status === "unapproved" || activePlan.steps[i].status === "failed") {
            isRejected = true;
            break;
          }
          
          await new Promise(r => setTimeout(r, 1000));
          setCountdownRemaining(prev => {
            if (prev <= 1) {
              isRejected = true; // Auto Reject on timeout
              return 0;
            }
            return prev - 1;
          });
        }

        setCountdownStepId(null);
        
        if (isRejected || executionStopRef.current) {
          const cancelledSteps = [...activePlan.steps];
          cancelledSteps[i].status = "failed";
          cancelledSteps[i].explanation = "Operator safety confirmation denied or timeout triggered.";
          setActivePlan({ ...activePlan, steps: cancelledSteps });
          
          setExecutionLogs(prev => [...prev, `[HUD Security] Sequence aborted. Manual safety block denied.`]);
          triggerAutoFeedback(
            "error",
            "Action Authorization Denied",
            "Workstation clearance rejected. Sequencing halted protectively.",
            "Clearance denied, Stuart. Halting operations stack."
          );
          break;
        }
      }

      // Execute current loop segment
      const success = await handleExecuteSingleStep(step, i);
      if (!success) {
        break; // Stop sequencing immediately on step failure
      }
    }

    setIsExecutingPlan(false);
    setCurrentExecutingIndex(-1);
    
    // Check if whole plan completed
    if (activePlan && activePlan.steps.every(s => s.status === "completed")) {
      triggerAutoFeedback(
        "success",
        "Full Sequence Complete",
        "All pipeline elements processed successfully in sandbox environment.",
        "Operations complete, Stuart. Dynamic checklist cleared."
      );
    }
  };

  // Toggle explicit user approve status
  const handleApproveStep = (index: number) => {
    if (!activePlan) return;
    const updatedSteps = [...activePlan.steps];
    updatedSteps[index].status = "approved";
    setActivePlan({ ...activePlan, steps: updatedSteps });
    
    setExecutionLogs(prev => [
      ...prev,
      `[HUD Security] Security override received. Manual clearance granted for action target "${updatedSteps[index].target}".`
    ]);
  };

  const handleRejectStep = (index: number) => {
    if (!activePlan) return;
    const updatedSteps = [...activePlan.steps];
    updatedSteps[index].status = "unapproved";
    setActivePlan({ ...activePlan, steps: updatedSteps });
  };

  // Copy error details to clipboard Helper
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerAutoFeedback(
      "info",
      "Cloned to Clipboard",
      "Copied simulated workspace exception stack to host operating clipboard.",
      "Details copied sequence trace, Stuart."
    );
  };

  // Export Shell terminal logs helper
  const handleExportLogs = () => {
    const textBlob = new Blob([executionLogs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `taskpilot_hud_telemetry_logs_${Date.now()}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get current accent color classes based on active theme
  const getThemeAccentClass = () => {
    if (activeTheme === "Midnight Purple") return "text-purple-400 border-purple-500 bg-purple-500";
    if (activeTheme === "Monochrome Slate") return "text-slate-400 border-slate-500 bg-slate-500";
    return "text-blue-400 border-blue-500 bg-blue-500";
  };

  // Filter logs list based on term query
  const filteredLogs = executionLogs.filter(logLine => 
    logLine.toLowerCase().includes(logsSearch.toLowerCase())
  );

  return (
    <div 
      className="h-full flex flex-col bg-[#0A0B0E]/80 backdrop-blur-xl border border-slate-800/40 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative font-sans text-slate-300"
      id="hud-viewport-main"
    >
      {/* 1. HUD GORGEOUS HEADER OVERLAY */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111319]/80 border-b border-slate-800/50 relative">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isExecutingPlan ? "bg-emerald-400" : isFloatingRecording ? "bg-rose-400" : "bg-blue-400"
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isExecutingPlan ? "bg-emerald-500" : isFloatingRecording ? "bg-rose-500" : "bg-blue-500"
              }`} />
            </span>
          </div>
          <div>
            <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFFFFF] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              Pilot HUD Dashboard
            </h2>
            <p className="text-[7.5px] font-mono text-slate-400 uppercase">Interactive Command Overlay Mode</p>
          </div>
        </div>
        
        {/* Connection indicators & Exit Overlay Control */}
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 uppercase">
            AOT On
          </span>
          <button 
            onClick={onCloseHud}
            className="p-1 rounded-md bg-[#161920] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition duration-200 cursor-pointer"
            title="Switch to full workspace Control dashboard"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 scrollbar-thin">
        {/* 2. THE PULSE: VOICE STATUS DECK WAVEFORM SYSTEM */}
        <div className="p-4 bg-[#111319]/50 border border-slate-800/40 rounded-xl flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden" id="the-voice-pulse-card">
          <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          
          <span className="text-[8px] font-extrabold tracking-widest text-slate-400 uppercase font-mono">
            {isFloatingRecording ? "Microphone Active" : isFloatingEvaluating ? "AI Brain Analyzing" : ttsSpeaking ? "Synthesizer Speaking" : "Workstation Connected"}
          </span>

          {/* DYNAMIC SVG WAVEFORM PULSE CIRCLE INTERACTION */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center relative bg-[#090b0e] border border-slate-850/60 shadow-inner group">
            {isFloatingRecording ? (
              // Case 1: Listening State
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="absolute w-12 h-12 rounded-full border border-rose-500/40 animate-ping" />
                <span className="absolute w-14 h-14 rounded-full border border-rose-400/20 animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-rose-600/10 flex items-center justify-center text-rose-500 shadow-lg">
                  <Mic className="w-4 h-4 animate-bounce" />
                </div>
              </div>
            ) : isFloatingEvaluating ? (
              // Case 2: Thinking/Planning State
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-1 rounded-full border border-dashed border-cyan-400 animate-spin" />
                <div className="absolute inset-2 rounded-full border border-cyan-500/10" />
                <div className="w-8 h-8 rounded-full bg-cyan-600/10 flex items-center justify-center text-cyan-400">
                  <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </div>
            ) : ttsSpeaking ? (
              // Case 3: Speaking State (High Bounce waveform spectrum)
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="absolute w-14 h-14 rounded-full border border-emerald-500/20 animate-pulse" />
                <div className="flex gap-0.5 items-end h-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#10b981] rounded-full animate-bounce"
                      style={{
                        height: `${Math.max(4, 14 + Math.sin(i) * 8)}px`,
                        animationDelay: `${i * 120}ms`,
                        animationDuration: '600ms'
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Case 4: Idle/Standby State
              <div className="absolute inset-0 flex items-center justify-center hover:scale-105 duration-300 transition-all cursor-pointer">
                <span className="absolute w-10 h-10 rounded-full border border-blue-500/10 animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                  <Volume2 className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>

          {/* 3. REAL-TIME TRANSCRIPT & SUBTITLE VIEWPORTS */}
          <div className="w-full space-y-1.5 pt-1">
            {/* Live Transcript displaying word-by-word streaming transcript as user speaks */}
            <div className="bg-[#090b0e] border border-slate-800/40 rounded-lg p-2.5 text-left relative min-h-12 overflow-hidden">
              <span className="absolute top-1 right-2 text-[6.5px] font-mono tracking-wider font-extrabold text-blue-500 uppercase">Live mic speech feed</span>
              <div className="flex items-start gap-1.5 mt-1">
                <span className="text-[10px] text-slate-300 leading-normal font-sans block select-text">
                  "{liveSpeechTranscript}"
                </span>
              </div>
            </div>

            {/* AI spoken subtitle echoing exact TTS parameters */}
            {ttsSpeaking && (
              <div className="bg-[#050e0c] border border-emerald-500/20 rounded-lg p-2.5 text-left relative min-h-12">
                <span className="absolute top-1 right-2 text-[6.5px] font-mono tracking-wider font-extrabold text-[#10b981] uppercase animate-pulse">Live Subtitle vocalizer</span>
                <p className="text-[10px] text-emerald-400 leading-normal font-sans font-medium mt-1 select-text italic">
                  "{ttsText}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. ACTIVE CONSOLE FLOW CONTROLLER BUTTONS */}
        <div className="flex items-center gap-2">
          {activePlan ? (
            <>
              <button
                onClick={handleRunFullPlanSeq}
                disabled={isExecutingPlan}
                className="flex-1 py-2 font-bold text-xxs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-900/10 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Dispatch Agent Automation
              </button>
              <button
                onClick={() => setActivePlan(null)}
                disabled={isExecutingPlan}
                className="px-3 py-2 font-semibold text-xxs bg-[#161920] border border-slate-800 hover:border-slate-700 hover:text-white rounded-lg transition duration-200 cursor-pointer"
              >
                Reset Planner
              </button>
            </>
          ) : (
            <div className="w-full text-center border border-dashed border-slate-800/60 p-4 rounded-xl">
              <p className="text-[10px] text-slate-500 font-sans">
                No active task plan compiled. Toggle voice listening at bottom or input command to construct automated actions.
              </p>
            </div>
          )}
        </div>

        {/* 5. INTERACTIVE ACTION CARDS CHAIN SYSTEM */}
        {activePlan && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                Steps Scheduled ({activePlan.steps.length})
              </span>
              <span className="text-[7.5px] font-mono tracking-wider bg-slate-900 text-slate-500 px-1 py-0.2 rounded border border-slate-850">
                STRICT REASONING ENGINE
              </span>
            </div>

            <div className="space-y-3">
              {activePlan.steps.map((step, idx) => {
                const isExecuting = currentExecutingIndex === idx;
                const isPending = step.status === "pending";
                const isCompleted = step.status === "completed";
                const isFailed = step.status === "failed";
                const isApproved = step.status === "approved";
                
                const hasCountdown = countdownStepId === step.id;

                let cardBorderClass = "border-slate-850 bg-[#111319]/40 text-slate-400";
                if (isExecuting) {
                  cardBorderClass = "border-blue-500 bg-blue-500/5 text-slate-100 shadow-[0_4px_16px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/20";
                } else if (isCompleted) {
                  cardBorderClass = "border-emerald-500/20 bg-emerald-500/5 text-slate-400";
                } else if (isFailed) {
                  cardBorderClass = "border-rose-500 bg-rose-500/5 text-slate-100";
                } else if (isApproved) {
                  cardBorderClass = "border-amber-400 bg-amber-400/5 text-slate-200";
                }

                return (
                  <div 
                    key={step.id}
                    className={`p-3 border rounded-xl relative transition duration-300 flex flex-col space-y-2 ${cardBorderClass} ${isPending ? "opacity-60" : "opacity-100"}`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex gap-2">
                        {/* Step count element */}
                        <div className={`w-4 h-4 rounded-full font-mono text-[9px] font-extrabold flex items-center justify-center shrink-0 border ${
                          isCompleted 
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                            : isFailed 
                              ? "bg-rose-500/10 border-rose-500 text-rose-500"
                              : isExecuting 
                                ? "bg-blue-600 border-blue-500 text-white animate-pulse"
                                : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}>
                          {idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold tracking-tight text-white capitalize">
                              {step.target}
                            </span>
                            <span className="text-[7.5px] font-mono tracking-widest px-1 py-0.2 rounded border border-slate-800 bg-[#0A0B0E] text-slate-400 uppercase">
                              {step.action.replace("_", " ")}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-sans">
                            {step.details}
                          </p>
                        </div>
                      </div>

                      {/* Status indicator badge right alignment */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        {isCompleted && (
                          <div className="p-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {isFailed && (
                          <div className="p-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
                            <AlertCircle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {isExecuting && (
                          <div className="flex gap-0.5 items-center bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono text-[7px] font-extrabold uppercase animate-pulse">
                            <MousePointer className="w-2.5 h-2.5 mr-0.5 animate-bounce" />
                            Active Call
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Failsafe custom error trace stack visual with copy option */}
                    {isFailed && (
                      <div className="bg-[#12080a]/90 border border-rose-950/40 rounded-lg p-2 text-xxs font-mono text-rose-400 space-y-1 relative">
                        <span className="text-[7px] text-rose-500 font-bold block">SIMULATOR EXCEPTIONS REPORTED:</span>
                        <p className="text-[9.5px] select-text">
                          Error: ENOENT: no such file or directory. Path verified in local workspace sandbox is invalid or locked.
                        </p>
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleCopyToClipboard(`Error: ENOENT: no such file or directory, path '${step.target}' not present in workspace sandbox.`)}
                            className="bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-300 font-extrabold tracking-wider uppercase text-[7.5px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            Copy Error Stack
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step countdown safety confirmation prompt */}
                    {hasCountdown && (
                      <div className="bg-[#161208]/90 border border-amber-500/20 rounded-lg p-2.5 space-y-2 mt-1 shadow-inner animate-pulse">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold text-amber-400 block font-mono">CRITICAL PRIVILEGE VALIDATION REQUIRED</span>
                            <span className="text-[8px] text-slate-400 font-sans block leading-none">
                              Verify parameters before dispatching automation scripts. Auto-abort in <strong className="text-amber-500">{countdownRemaining}s</strong>
                            </span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 pt-1 font-mono text-[8px]">
                          <button
                            onClick={() => handleApproveStep(idx)}
                            className="flex-1 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 font-bold text-[#090b0e] flex items-center justify-center gap-1 transition duration-200 cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            APPROVE ACTION
                          </button>
                          <button
                            onClick={() => handleRejectStep(idx)}
                            className="px-2.5 py-1.5 rounded bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 font-semibold transition"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action trigger button for explicit single-step testing */}
                    {!isExecuting && !isCompleted && !isFailed && !hasCountdown && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleExecuteSingleStep(step, idx)}
                          disabled={isExecutingPlan}
                          className="px-2 py-0.8 text-[8px] font-bold tracking-wider uppercase rounded bg-[#161920] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
                        >
                          Trigger Segment
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 6. PERSISTENT STOP EXECUTING SPACEBAR OVERLAY PANEL */}
      {isExecutingPlan && (
        <div className="absolute bottom-16 inset-x-4 bg-rose-900/90 border border-rose-500/50 rounded-xl p-2.5 z-40 shadow-lg flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <StopCircle className="w-4 h-4 text-white animate-spin shrink-0" style={{ animationDuration: '4s' }} />
            <div>
              <span className="text-[10px] font-extrabold text-white block uppercase tracking-wider font-mono">Sequencer Executing...</span>
              <span className="text-[7.5px] text-rose-200 font-sans block leading-none">
                AI controls simulated keyboard/mouse input vectors. Press [Spacebar] to immediately drop thread session.
              </span>
            </div>
          </div>
          <button
            onClick={handleStopExecution}
            className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-900 font-extrabold font-mono text-[9px] uppercase tracking-wide rounded-lg flex items-center gap-1 cursor-pointer transition shadow"
          >
            Stop Executing [Space]
          </button>
        </div>
      )}

      {/* 7. SILENT LOGS COLLAPSIBLE BOTTOM DRAWER */}
      <div 
        className={`absolute bottom-0 inset-x-0 bg-[#0A0B0E] border-t border-slate-800/80 z-40 transition-all duration-300 flex flex-col ${
          isLogsDrawerOpen ? "h-64" : "h-11"
        }`}
        id="silent-logs-drawer"
      >
        {/* Toggle bar header */}
        <div 
          onClick={() => setIsLogsDrawerOpen(!isLogsDrawerOpen)}
          className="flex items-center justify-between px-4 h-11 border-b border-slate-850 bg-[#111319] hover:bg-[#161920] transition duration-200 cursor-pointer select-none shrink-0"
        >
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[9.5px] font-bold uppercase text-slate-350 tracking-wider font-mono">
              Silent Telemetry logsMode Drawer
            </span>
            <span className="text-[7.5px] font-mono px-1 border border-slate-800 rounded bg-[#0A0B0E]/80 text-slate-500">
              {filteredLogs.length} events
            </span>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {isLogsDrawerOpen && (
              <>
                <button
                  onClick={handleExportLogs}
                  className="p-1 hover:bg-slate-850 text-slate-400 hover:text-white rounded transition cursor-pointer"
                  title="Export live diagnostic telemetry files"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setExecutionLogs([`[HUD Matrix] Logs purges done at ${new Date().toLocaleTimeString()}`])}
                  className="text-[7.5px] font-mono px-1.5 py-0.5 rounded border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                  title="Wipes event tracking"
                >
                  Flush Trace
                </button>
              </>
            )}
            
            <button 
              onClick={() => setIsLogsDrawerOpen(!isLogsDrawerOpen)}
              className="p-1 hover:bg-slate-850 text-slate-400 hover:text-white rounded transition cursor-pointer"
            >
              {isLogsDrawerOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Inner Search & Logs Console */}
        {isLogsDrawerOpen && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#07080b]">
            {/* Search inputs bar */}
            <div className="px-3 py-1.5 bg-[#090a0f] border-b border-slate-850 flex items-center gap-2 font-mono text-[8px] text-slate-300">
              <Search className="w-3 h-3 text-slate-500" />
              <input
                type="text"
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
                placeholder="Search raw console telemetry payload tracers..."
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-300 placeholder-slate-655"
              />
              <span className="text-[7px] text-slate-500 uppercase">
                Filtered: {filteredLogs.length}
              </span>
            </div>

            {/* Scrolling console entries */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-[9px] text-[#22c55e] space-y-1.5 select-text scrollbar-thin">
              {filteredLogs.map((logLine, index) => {
                let colorClass = "text-[#22c55e]"; // Default green index
                if (logLine.includes("[HUD Security") || logLine.includes("[EMERGENCY") || logLine.includes("[Security")) {
                  colorClass = "text-amber-400 font-semibold";
                } else if (logLine.includes("Error") || logLine.includes("[Action Fail") || logLine.includes("[HUD Security Alert]")) {
                  colorClass = "text-rose-500 font-extrabold";
                } else if (logLine.includes("[HUD Dispatcher") || logLine.includes("[HUD Core]")) {
                  colorClass = "text-blue-400";
                } else if (logLine.includes("[Voice Server]")) {
                  colorClass = "text-purple-400";
                }
                
                return (
                  <div key={index} className={`leading-normal border-b border-slate-900/40 pb-0.5 break-words ${colorClass}`}>
                    {logLine}
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
