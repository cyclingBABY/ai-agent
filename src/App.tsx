import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, ShieldCheck, Cpu, Play, Settings, RefreshCw, Layers, 
  HelpCircle, Coffee, Layout, Sparkles, FolderGit, Volume2, Activity,
  Bell, VolumeX, X, Zap, Radio, CheckCircle2, AlertCircle, Info, ChevronRight,
  Mic
} from "lucide-react";
import { SystemState, DiskFile, TaskPlan, TaskStep, Workflow, HistoryItem, DeveloperFile } from "./types";
import DesktopSimulator from "./components/DesktopSimulator";
import AgentConsole from "./components/AgentConsole";
import WorkflowBuilder from "./components/WorkflowBuilder";
import DeveloperKit from "./components/DeveloperKit";
import SystemHealth from "./components/SystemHealth";
import HudPanel from "./components/HudPanel";

export default function App() {
  const [mainActiveTab, setMainActiveTab] = useState<"dashboard" | "health" | "workflows" | "developer">("dashboard");
  const [simulatorTab, setSimulatorTab] = useState<"files" | "browser" | "screen">("files");
  
  // HUD mode state & telemetry events logs state
  const [hudMode, setHudMode] = useState<boolean>(true);
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    "[System Matrix] TaskPilot secure operating system simulator established.",
    "[Voice Pipeline] Speech recognition & Synthesis modules standing by, Stuart.",
    "[Automation Node] Control coordinates ready for keyboard/mouse simulation."
  ]);

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

  // --- FLOATING VOICE COMMAND PANEL STATE ---
  const [isFloatingRecording, setIsFloatingRecording] = useState(false);
  const [floatingSpeechVolume, setFloatingSpeechVolume] = useState(0);
  const [isFloatingEvaluating, setIsFloatingEvaluating] = useState(false);
  const [floatingSpeechTranscript, setFloatingSpeechTranscript] = useState("");
  const floatingSpeechInterval = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // --- AUTOMATED FEEDBACK SYSTEM STATES ---
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
  }>>([
    {
      id: "init",
      type: "success",
      title: "System Feedback Core Ready",
      message: "Proactive Automated System Health Monitor is active and listening for telemetry triggers.",
      timestamp: Date.now() - 30000,
      read: true
    }
  ]);

  const [activeToasts, setActiveToasts] = useState<Array<{
    id: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
  }>>([]);

  const [ttsText, setTtsText] = useState("TaskPilot automation dashboard loaded. Ready for operations, Stuart.");
  const [ttsSpeaking, setTtsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // default muted to respect privacy but allow easy toggle
  const [isFeedbackDrawerOpen, setIsFeedbackDrawerOpen] = useState(false);
  const [healthCurrent, setHealthCurrent] = useState<any>(null);

  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);
  const [ttsPitch, setTtsPitch] = useState<number>(1.05);
  const [ttsPersonality, setTtsPersonality] = useState<"Professional" | "Concise" | "Conversational">("Professional");

  const ttsSpeedRef = useRef<number>(1.0);
  const ttsPitchRef = useRef<number>(1.05);

  useEffect(() => {
    ttsSpeedRef.current = ttsSpeed;
  }, [ttsSpeed]);

  useEffect(() => {
    ttsPitchRef.current = ttsPitch;
  }, [ttsPitch]);

  const changeTtsPersonality = (personality: "Professional" | "Concise" | "Conversational") => {
    setTtsPersonality(personality);
    if (personality === "Professional") {
      setTtsSpeed(1.0);
      setTtsPitch(1.05);
    } else if (personality === "Concise") {
      setTtsSpeed(1.35);
      setTtsPitch(0.9);
    } else if (personality === "Conversational") {
      setTtsSpeed(1.15);
      setTtsPitch(1.2);
    }
  };

  const [activeTheme, setActiveTheme] = useState<"Cyber Blue" | "Midnight Purple" | "Monochrome Slate">("Cyber Blue");

  useEffect(() => {
    const root = document.documentElement;
    if (activeTheme === "Cyber Blue") {
      root.style.setProperty("--brand-primary", "#2563eb");
      root.style.setProperty("--brand-primary-hover", "#1d4ed8");
      root.style.setProperty("--brand-bg", "#0A0B0E");
      root.style.setProperty("--brand-panel", "#111319");
      root.style.setProperty("--brand-card", "#161920");
      root.style.setProperty("--brand-border", "rgba(30, 41, 59, 0.7)");
      root.style.setProperty("--brand-text", "#cbd5e1");
      root.style.setProperty("--brand-accent", "#3b82f6");
      root.style.setProperty("--brand-accent-hover", "#60a5fa");
      root.style.setProperty("--brand-accent-rgb", "59, 130, 246");
      root.style.setProperty("--brand-accent-glow", "rgba(37, 99, 235, 0.15)");
      root.style.setProperty("--brand-scrollbar-thumb", "rgba(37, 99, 235, 0.3)");
    } else if (activeTheme === "Midnight Purple") {
      root.style.setProperty("--brand-primary", "#8b5cf6");
      root.style.setProperty("--brand-primary-hover", "#7c3aed");
      root.style.setProperty("--brand-bg", "#07040E");
      root.style.setProperty("--brand-panel", "#0f0a1d");
      root.style.setProperty("--brand-card", "#150f26");
      root.style.setProperty("--brand-border", "rgba(139, 92, 246, 0.25)");
      root.style.setProperty("--brand-text", "#e2daf8");
      root.style.setProperty("--brand-accent", "#c084fc");
      root.style.setProperty("--brand-accent-hover", "#f472b6");
      root.style.setProperty("--brand-accent-rgb", "139, 92, 246");
      root.style.setProperty("--brand-accent-glow", "rgba(139, 92, 246, 0.2)");
      root.style.setProperty("--brand-scrollbar-thumb", "rgba(139, 92, 246, 0.35)");
    } else if (activeTheme === "Monochrome Slate") {
      root.style.setProperty("--brand-primary", "#475569");
      root.style.setProperty("--brand-primary-hover", "#334155");
      root.style.setProperty("--brand-bg", "#0d0e12");
      root.style.setProperty("--brand-panel", "#14161d");
      root.style.setProperty("--brand-card", "#1c1e26");
      root.style.setProperty("--brand-border", "rgba(71, 85, 105, 0.4)");
      root.style.setProperty("--brand-text", "#cbd5e1");
      root.style.setProperty("--brand-accent", "#94a3b8");
      root.style.setProperty("--brand-accent-hover", "#cbd5e1");
      root.style.setProperty("--brand-accent-rgb", "148, 163, 184");
      root.style.setProperty("--brand-accent-glow", "rgba(71, 85, 105, 0.2)");
      root.style.setProperty("--brand-scrollbar-thumb", "rgba(148, 163, 184, 0.3)");
    }
  }, [activeTheme]);

  const lastCpuRef = useRef<number>(0);
  const lastRamRef = useRef<number>(0);
  const lastLatRef = useRef<number>(0);

  // Trigger feedback handler (adds to log stream + spawns a temporary toast + optional text to speech voice)
  const triggerAutoFeedback = (
    type: "info" | "success" | "warning" | "error",
    title: string,
    message: string,
    speechText?: string
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // 1. Add to main log
    setNotifications(prev => [
      { id, type, title, message, timestamp: Date.now(), read: false },
      ...prev
    ]);

    // 2. Add to visible toast overlay list
    setActiveToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);

    // 3. Audio & Text Speech Synthesis animation
    if (speechText) {
      setTtsText(speechText);
      setTtsSpeaking(true);
      
      const speedFactor = ttsSpeedRef.current || 1.0;
      const spokenDuration = Math.min(Math.max((speechText.split(" ").length * 320) / speedFactor, 1500), 7500);
      const timer = setTimeout(() => {
        setTtsSpeaking(false);
      }, spokenDuration);

      // Speak via browser core API if unmuted
      if (!isMuted && typeof window !== "undefined" && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(speechText);
          utterance.rate = ttsSpeedRef.current;
          utterance.pitch = ttsPitchRef.current;
          const voices = window.speechSynthesis.getVoices();
          const englishVoice = voices.find(v => v.lang.startsWith("en-US") || v.lang.startsWith("en"));
          if (englishVoice) utterance.voice = englishVoice;
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.error("Synthesizer error:", err);
        }
      }
    }
  };

  // Poll stats for automated telemetry triggers
  useEffect(() => {
    const fetchStatsForFeedback = async () => {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        if (data && data.current) {
          setHealthCurrent(data.current);
          const currentPoint = data.current;

          const cpuVal = currentPoint.cpu;
          const ramVal = currentPoint.ram;
          const latVal = currentPoint.latency;

          // CPU threshold crossed (Edge warnings only)
          if (cpuVal > 75 && lastCpuRef.current <= 75) {
            triggerAutoFeedback(
              "warning",
              "CPU Overhead Alert",
              `Telemetry alert: Processor utilization spiked to ${cpuVal}% during simulated agent execution.`,
              `Warning, Stuart: Task agent thread load has exceeded 75 percent. System overhead is moderately high.`
            );
          } else if (cpuVal > 45 && lastCpuRef.current <= 45) {
            triggerAutoFeedback(
              "info",
              "Inference Workload Initialized",
              `Telemetry: Local LLM model daemon is actively processing a planning sequence on threads. CPU: ${cpuVal}%.`,
              `System core processing loaded to ${cpuVal} percent, Stuart. TaskPilot is actively governing resource boundaries.`
            );
          }

          // Allocated memory warning thresholds
          if (ramVal > 43 && lastRamRef.current <= 43) {
            triggerAutoFeedback(
              "warning",
              "Sandbox Storage Warning",
              `Warning: Container virtual RAM allocation exceeds threshold at ${ramVal}%. Proactive flush is recommended.`,
              `Warning, Stuart: Task agent memory pool utilized at ${ramVal} percent. Recommend executing synthetic memory purge.`
            );
          }

          // Latency triggers
          if (latVal > 165 && lastLatRef.current <= 165) {
            triggerAutoFeedback(
              "info",
              "RPC Latency Slack",
              `Ollama network edge latency has scaled to ${latVal}ms. Response intervals might expand.`,
              `Notice: Endpoint request time has increased above 160 milliseconds.`
            );
          }

          // Update edge trackers
          lastCpuRef.current = cpuVal;
          lastRamRef.current = ramVal;
          lastLatRef.current = latVal;
        }
      } catch (err) {
        console.error("Advisory daemon failed polling:", err);
      }
    };

    // Initial delay so app finishes initializing before first poll
    const timeout = setTimeout(() => {
      fetchStatsForFeedback();
    }, 2000);

    const interval = setInterval(fetchStatsForFeedback, 5000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  // --- /END AUTOMATED FEEDBACK STACK ---

  // Load backend states on mount
  useEffect(() => {
    fetchStates();
    fetchDeveloperFiles();
    fetchWorkflows();
    return () => {
      if (floatingSpeechInterval.current) {
        clearInterval(floatingSpeechInterval.current);
      }
    };
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

      // Automated feedback for layout locks or sleeping
      if (updates.isLocked === true) {
        triggerAutoFeedback("warning", "Security Screen Locked", "Workstation locked secure sandbox protocols.", "System console locked, Stuart.");
      } else if (updates.isLocked === false && systemState.isLocked === true) {
        triggerAutoFeedback("success", "Security Cleared", "Welcome back! Workstation retrieved verified active credentials.", "Identity verified, Stuart. System fully authorized.");
      }
      
      if (updates.isSleeping === true) {
        triggerAutoFeedback("info", "System Suspended", "Desktop interface deactivated to standby power state.", "TaskPilot went into sleep mode.");
      } else if (updates.isSleeping === false && systemState.isSleeping === true) {
        triggerAutoFeedback("success", "Session Restored", "TaskPilot is awake and responsive.", "Inference threads synchronized. standing by, Stuart.");
      }
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

      // Auto feedback trigger
      triggerAutoFeedback(
        "info", 
        "File Destroyed", 
        `Sandbox agent successfully purged file ${filePath} from virtual desktop partition space.`,
        `Purged file: ${filePath.split("/").pop()}, Stuart.`
      );
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

      // Auto feedback trigger
      triggerAutoFeedback(
        "success",
        "Coordinate Scan Complete",
        "Captured instant UI screenshot coordinates. OCR character array detected.",
        "Generating system coordinate mapping scan, Stuart."
      );
    } catch (e) {
      console.error("Error during simulated capture:", e);
    }
  };

  const handleExecuteStepSimulated = async (step: TaskStep): Promise<string> => {
    // Proactive trigger: starting execution
    triggerAutoFeedback(
      "info",
      "Action Trigger Dispatched",
      `Dispatched sandbox controller to execute: "${step.action === "browser_action" ? "Browser Pipeline" : step.action === "manage_files" ? "Files System" : "System Command"}" targeting: ${step.target}`,
      `Executing task: ${step.action === "browser_action" ? "browser process" : step.action === "manage_files" ? "file change" : "terminal instructions"}, Stuart.`
    );
    
    setExecutionLogs(prev => [
      ...prev,
      `[HUD Dispatcher] Dispatched worker instruction for segment: "${step.target}" (${step.action.toUpperCase()}).`
    ]);

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

      setExecutionLogs(prev => [
        ...prev,
        `[HUD Sandbox Tracker] Successfully executed command element: "${step.target}". Simulated systems returned standard status 200.`
      ]);

      // Proactive trigger: successful completion
      triggerAutoFeedback(
        "success",
        "Step Executed Successfully",
        `Completed instruction to "${step.target}" without security exceptions. Sandbox workspace persistent.`,
        `Task fully completed, Stuart.`
      );

      return data.consoleLog || `[TaskPilot AI Simulator] Successfully executed action step: ${step.target}`;
    } catch (e: any) {
      setExecutionLogs(prev => [
        ...prev,
        `[HUD Tracker Error] Failed executing simulation script: "${step.target}". Reason: ${e.message || e}`
      ]);
      
      // Proactive trigger: step failure
      triggerAutoFeedback(
        "error",
        "Action Step Halted",
        `Execution failed during sandbox processing window. Reason: ${e.message}`,
        `Caution Stuart: Execution halted with simulated exception.`
      );
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
        
        triggerAutoFeedback(
          "success",
          "Workflow Automation Saved",
          `Created routine macro workflow: "${name}" with ${steps.length} preset instruction steps.`,
          `Macro workflow template successfully registered, Stuart.`
        );
      }
    } catch (e) {
      console.error("Error writing workflow:", e);
    }
  };

  // Custom wrapper for planning models generated
  const handlePlanLoaded = (plan: TaskPlan) => {
    setActivePlan(plan);
    triggerAutoFeedback(
      "info",
      "Model Reasoning Core Decoded",
      `System prepared ${plan.steps.length} sequential operations matching instruction: "${plan.reasoning}"`,
      `New automation plan compiled with ${plan.steps.length} operations. Standing by, Stuart.`
    );
  };

  // Dispatch floating speech command
  const handleExecuteVoiceCommand = async (commandText: string) => {
    setIsFloatingEvaluating(true);
    triggerAutoFeedback(
      "success",
      "Whisper STT Decoded",
      `Speech-to-text engine successfully transcribed: "${commandText}"`,
      `Synthesized command successfully Stuart. Preparing task outline.`
    );

    try {
      const response = await fetch("/api/agent/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: commandText })
      });
      const data = await response.json();
      if (data.plan) {
        handlePlanLoaded(data.plan);
      }
    } catch (e: any) {
      console.error(e);
      triggerAutoFeedback(
        "error",
        "STT Pipeline Error",
        `Transcription failed to register plan matching trace: ${e.message}`,
        "Voice command error Stuart."
      );
    } finally {
      setIsFloatingEvaluating(false);
    }
  };

  const startAudioVolumeDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          const volumeLevel = Math.min(Math.max(Math.round(average * 2.2), 0), 100);
          setFloatingSpeechVolume(volumeLevel);
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      } else {
        throw new Error("No AudioContext support");
      }
    } catch (err) {
      console.warn("Real-time mic metadata streaming deactivated:", err);
      floatingSpeechInterval.current = setInterval(() => {
        setFloatingSpeechVolume(Math.floor(Math.random() * 65) + 20);
      }, 100);
    }
  };

  const stopAudioVolumeDetection = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (floatingSpeechInterval.current) {
      clearInterval(floatingSpeechInterval.current);
      floatingSpeechInterval.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const startSpeechRecognition = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn("SpeechRecognition not supported inside standard browser sandbox.");
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let resultText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i] && event.results[i][0]) {
            resultText += event.results[i][0].transcript;
          }
        }
        if (resultText) {
          setFloatingSpeechTranscript(resultText);
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Engine error:", err);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Speech Recognition startup exception:", err);
    }
  };

  // Toggle voice command listening state
  const toggleFloatingVoiceRecording = () => {
    if (isFloatingRecording) {
      stopAudioVolumeDetection();
      const finalTranscript = floatingSpeechTranscript;
      setIsFloatingRecording(false);
      setFloatingSpeechVolume(0);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }

      const cleanTranscript = finalTranscript.trim();
      if (cleanTranscript.length > 2) {
        handleExecuteVoiceCommand(cleanTranscript);
      } else {
        const commands = [
          "Create folders for Images, Videos and Documents",
          "Move PDFs to Reports and clean up temp caches",
          "Open Chrome Browser and search for current weather info",
          "Turn the volume down to 25% and lock computer",
          "Optimize system memory and refresh sandbox files"
        ];
        const selectedCmd = commands[Math.floor(Math.random() * commands.length)];
        handleExecuteVoiceCommand(selectedCmd);
      }
    } else {
      setIsFloatingRecording(true);
      setFloatingSpeechTranscript("");
      triggerAutoFeedback(
        "info",
        "Listening Port Enabled",
        "Listening for physical mic voice frequencies using HTML5 Speech Recognition.",
        "Voice trigger established, Stuart. Ready."
      );
      
      startSpeechRecognition();
      startAudioVolumeDetection();
    }
  };

  const toggleVoiceRef = useRef(toggleFloatingVoiceRecording);
  useEffect(() => {
    toggleVoiceRef.current = toggleFloatingVoiceRecording;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.code === "Space" || e.key === " " || e.keyCode === 32)) {
        e.preventDefault();
        toggleVoiceRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Clear all feedback notifications
  const handleClearAllFeedbacks = () => {
    setNotifications([
      {
        id: "cleared",
        type: "success",
        title: "Logs Flushed",
        message: "Notifications history flushed successfully.",
        timestamp: Date.now(),
        read: true
      }
    ]);
  };

  // Run a manual flush of RAM
  const handleTriggerManualGcFeedback = () => {
    triggerAutoFeedback(
      "info",
      "Garbage Collection Commenced",
      "Releasing heap blocks and virtual directory sectors",
      "Purging active sandbox storage cache, Stuart."
    );
    
    // Simulate garbage collector reduction in current metrics
    setTimeout(() => {
      if (healthCurrent) {
        const reducedRam = Math.max(healthCurrent.ramUsed - 1.2, 3.8);
        const reducedRamPct = Math.round((reducedRam / 16) * 100);
        setHealthCurrent((prev: any) => prev ? { ...prev, ramUsed: reducedRam, ram: reducedRamPct } : null);
      }
      
      triggerAutoFeedback(
        "success",
        "Virtual Memory Optimized",
        "Flushed 1.2 GB of heap space. Model buffers reclaimed.",
        "Purging successful. One point two gigabytes released, Stuart."
      );
    }, 1200);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-350 flex flex-col font-sans relative overflow-hidden">
      
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
            <p className="text-[11px] text-slate-500 mt-0.5 font-sans">Control operating systems & browser pipelines via natural instructions.</p>
          </div>
        </div>

        {/* Header Right Interactions: Routing Tab + Auto-Advisor bell button */}
        <div className="flex items-center gap-3">
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

          {/* HUD Mode Selector Switch Button */}
          <button
            onClick={() => {
              const nextMode = !hudMode;
              setHudMode(nextMode);
              triggerAutoFeedback(
                "info",
                "UI Layout protocol transformed",
                `Interface configuration mutated to ${nextMode ? "Compact heads-up control deck" : "traditional standard grid dashboard"}.`,
                `Changing workstation screen view to ${nextMode ? "heads-up display" : "standard dashboard grid"}, Stuart.`
              );
            }}
            id="workspace-layout-toggle-btn"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-black transition duration-300 cursor-pointer ${
              hudMode 
                ? "bg-gradient-to-r from-blue-600/25 to-indigo-600/25 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)]" 
                : "bg-[#161920] border-slate-800 text-slate-400 hover:text-slate-205 hover:border-slate-700"
            }`}
            title="Toggle compact Heads-Up HUD Overlay mode vs Standard Dashboard view"
          >
            <Radio className={`w-3.5 h-3.5 ${hudMode ? "animate-pulse" : ""}`} />
            <span>{hudMode ? "COMPACT HUD" : "DASHBOARD GRID"}</span>
          </button>

          {/* Automated Advisory Notification Button */}
          <button
            onClick={() => {
              setIsFeedbackDrawerOpen(!isFeedbackDrawerOpen);
              // Read all notifications
              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }}
            className={`relative p-2 rounded-xl border transition ${
              isFeedbackDrawerOpen 
                ? "bg-blue-600/10 border-blue-500 text-blue-400" 
                : unreadCount > 0 
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20" 
                  : "bg-[#161920] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
            title="Auto-Advisory Feedback Diagnostics Panel"
          >
            <Bell className={`w-4 h-4 ${unreadCount > 0 ? "animate-bounce" : ""}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-extrabold text-[#0A0B0E] ring-2 ring-[#0A0B0E]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content viewport container */}
      <main className="flex-1 p-4 lg:p-6 overflow-hidden max-w-[1536px] w-full mx-auto relative">
        {mainActiveTab === "dashboard" && (
          <div className="relative h-full">
            {hudMode ? (
              /* COMPACT IMMERSIVE VOICE HUD OVERLAY MODE */
              <div className="flex gap-5 h-[calc(100vh-140px)] min-h-[440px] relative">
                {/* Desktop Simulator taking 100% remaining width */}
                <div className="flex-1 h-full min-h-[440px]">
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

                {/* Highly-immersive right aligned HUD overlay drawer */}
                <div className="w-[390px] h-full shrink-0 relative" id="hud-sidebar-panel-container">
                  <HudPanel
                    activePlan={activePlan}
                    setActivePlan={setActivePlan}
                    onExecuteStep={handleExecuteStepSimulated}
                    onUpdateState={handleUpdateSystemState}
                    systemState={systemState}
                    activeTheme={activeTheme}
                    triggerAutoFeedback={triggerAutoFeedback}
                    ttsText={ttsText}
                    ttsSpeaking={ttsSpeaking}
                    isFloatingRecording={isFloatingRecording}
                    setIsFloatingRecording={(val) => toggleFloatingVoiceRecording()}
                    floatingSpeechVolume={floatingSpeechVolume}
                    floatingSpeechTranscript={floatingSpeechTranscript}
                    setFloatingSpeechTranscript={setFloatingSpeechTranscript}
                    isFloatingEvaluating={isFloatingEvaluating}
                    setIsFloatingEvaluating={setIsFloatingEvaluating}
                    executionLogs={executionLogs}
                    setExecutionLogs={setExecutionLogs}
                    onCloseHud={() => {
                      setHudMode(false);
                      triggerAutoFeedback(
                        "info",
                        "HUD Mode Dismissed",
                        "Switched active workstation layout back to full dashboard mode.",
                        "Reverting layout to standard grid dashboard, Stuart."
                      );
                    }}
                  />
                </div>
              </div>
            ) : (
              /* STANDARD BALANCED GRID DASHBOARD LAYOUT */
              <div className="relative h-full animate-fadeIn">
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
                      onPlanLoaded={handlePlanLoaded}
                      activePlan={activePlan}
                      setActivePlan={setActivePlan}
                      onExecuteStep={handleExecuteStepSimulated}
                    />
                  </div>
                </div>

                {/* Persistent Floating 'Voice Command' button with a dynamic Waveform animation */}
                <div className="fixed bottom-6 left-6 z-40 font-sans" id="persistent-floating-voice-command">
                  <div 
                    className={`flex items-center gap-3 bg-[#111319]/95 backdrop-blur-md border rounded-full p-2.5 pr-4 shadow-[0_20px_50px_rgba(37,99,235,0.25)] duration-300 transition-all ${
                      isFloatingRecording 
                        ? "border-rose-500/50 bg-[#160d13]/95 shadow-[0_20px_50px_rgba(225,29,72,0.3)]" 
                        : isFloatingEvaluating 
                          ? "border-cyan-500/50 bg-[#0c131d]/95" 
                          : "border-slate-800 hover:border-blue-500/40 hover:shadow-[0_20px_50px_rgba(37,99,235,0.35)]"
                    }`}
                  >
                    {/* Visual Mic trigger inside */}
                    <button
                      onClick={toggleFloatingVoiceRecording}
                      disabled={isFloatingEvaluating}
                      id="floating-voice-mic-btn"
                      className={`relative p-2.5 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer ${
                        isFloatingRecording
                          ? "bg-rose-600 border-rose-500 text-white animate-pulse"
                          : "bg-blue-600/10 hover:bg-blue-600/20 text-blue-400"
                      }`}
                      title={isFloatingRecording ? "Click to synthesize command transcript" : "Initialize continuous voice recorder"}
                    >
                      <Mic className="w-4 h-4" />
                      {isFloatingRecording && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                      )}
                    </button>

                    {/* Speech Conversion Waveform or text diagnostics */}
                    <div className="flex flex-col min-w-[130px] select-none text-slate-350">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold font-sans">
                          {isFloatingRecording ? "Whisper Active" : isFloatingEvaluating ? "STT Decoding" : "Voice Command"}
                        </span>
                        <span className="text-[8px] font-mono font-medium px-1 bg-[#0A0B0E]/60 border border-slate-800/40 rounded text-slate-500">
                          STT
                        </span>
                      </div>

                      {isFloatingRecording ? (
                        /* Waveform animation during active speech-to-text conversion */
                        <div className="flex gap-0.5 items-end h-4 mt-1">
                          {Array.from({ length: 14 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-0.75 bg-rose-500 rounded-full transition-all duration-100 ease-out"
                              style={{
                                height: `${Math.max(3, (floatingSpeechVolume * (i % 2 === 0 ? 0.65 : 1.35)) / 10 + Math.sin(i) * 2.5)}px`
                              }}
                            />
                          ))}
                        </div>
                      ) : isFloatingEvaluating ? (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-cyan-400 font-mono">
                          <div className="w-2.5 h-2.5 border border-cyan-400 border-t-transparent animate-spin rounded-full shrink-0" />
                          <span>Synthesizing plan...</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-550 mt-0.5 font-sans leading-none flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-1">
                            <span className="w-1.25 h-1.25 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span>Listen ready</span>
                          </div>
                          <span className="text-[7.5px] font-mono tracking-wide text-slate-500 bg-slate-900 border border-slate-850 px-1 py-0.2 rounded shrink-0">Alt+Space</span>
                        </div>
                      )}
                    </div>

                    {/* Finish action indicator click-to-stop */}
                    {isFloatingRecording && (
                      <button
                        onClick={toggleFloatingVoiceRecording}
                        id="floating-voice-stop-btn"
                        className="ml-2.5 px-3 py-1 text-[10px] font-extrabold text-[#0F1117] bg-rose-500 hover:bg-rose-450 rounded-full shadow transition cursor-pointer"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {mainActiveTab === "health" && (
          <div className="h-[calc(100vh-180px)] min-h-[480px] overflow-auto pr-1">
            
            {/* Embedded Proactive Advisory Banner at the top of System Health */}
            <div className="mb-5 p-4 bg-gradient-to-r from-blue-950/40 via-[#161920] to-blue-950/40 border border-blue-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 shrink-0">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Automated Feedback Advisory</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] text-emerald-400 font-bold font-mono">
                      ACTIVE MONITOR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    AI Governor evaluates sandbox resource boundaries autonomously. Real-time diagnostic readouts are visual and vocalized.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleTriggerManualGcFeedback}
                  className="px-3.5 py-1.5 bg-[#0A0B0E] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-200 text-[10px] font-bold transition flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-450" />
                  Quick Optimize (GC)
                </button>
                <button
                  onClick={() => setIsFeedbackDrawerOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                >
                  View Advisory Center
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

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

      {/* --- COLLAPSIBLE AUTONOMOUS ADVISORY SIDE DRAWER --- */}
      {isFeedbackDrawerOpen && (
        <div className="fixed inset-0 bg-[#0A0B0E]/60 backdrop-blur-xs z-40 transition-all duration-300" onClick={() => setIsFeedbackDrawerOpen(false)}>
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="absolute top-0 right-0 h-full w-full sm:w-[420px] bg-[#0F1117] border-l border-slate-800/80 shadow-2xl p-6 flex flex-col justify-between z-50 text-xs text-sans animate-fade-slide-left"
          >
            {/* Header portion */}
            <div className="space-y-5 flex-1 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">
                    AI Automated Advisory
                  </h3>
                </div>
                <button 
                  onClick={() => setIsFeedbackDrawerOpen(false)}
                  className="p-1 rounded bg-[#0A0B0E] border border-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Speech Engine Waveform Controls */}
              <div className="p-4 bg-[#161920] border border-slate-800/60 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-blue-500" />
                    Piper TTS speech channel
                  </span>
                  
                  {/* Speech Toggle Button styled beautiful */}
                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (isMuted) {
                        // Play a little welcome sound to confirm speech activation
                        triggerAutoFeedback(
                          "success", 
                          "Voice Enabled", 
                          "Voice synthesis successfully activated. Preparing vocal telemetry feeds.", 
                          "Voice telemetry systems activated, Stuart. Automated reporting online."
                        );
                      }
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase transition ${
                      !isMuted 
                        ? "bg-blue-600/10 border-blue-500 text-blue-400" 
                        : "bg-[#0A0B0E] border-slate-800 text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    {!isMuted ? (
                      <>
                        <Volume2 className="w-3 h-3 text-blue-400" />
                        Speech On
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3 h-3 text-slate-500" />
                        Mute Voice
                      </>
                    )}
                  </button>
                </div>

                {/* Simulated Oscilloscope Waveform Anim */}
                <div className="bg-[#0A0B0E]/80 border border-slate-800/60 rounded-lg p-3 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Live Synthesizer output</span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border ${
                      ttsSpeaking 
                        ? "text-blue-400 bg-blue-500/10 border-blue-500/30 animate-pulse" 
                        : "text-slate-500 bg-[#0A0B0E]/30 border-slate-800"
                    }`}>
                      {ttsSpeaking ? "SPEAKING FEED" : "STANDBY"}
                    </span>
                  </div>

                  {/* Move bars if active speaking */}
                  <div className="h-6 flex items-center justify-center gap-1 bg-[#0A0B0E] rounded border border-slate-800/30 px-2 overflow-hidden">
                    <div className={`w-0.5 rounded-full bg-blue-500/60 min-h-[4px] transition-all ${ttsSpeaking ? "h-4 animate-bounce shrink-0" : "h-1"}`} style={{ animationDelay: "0.1s" }} />
                    <div className={`w-0.5 rounded-full bg-blue-500/80 min-h-[4px] transition-all ${ttsSpeaking ? "h-5 animate-bounce shrink-0" : "h-1"}`} style={{ animationDelay: "0.3s" }} />
                    <div className={`w-0.5 rounded-full bg-blue-500 min-h-[4px] transition-all ${ttsSpeaking ? "h-3 animate-bounce shrink-0" : "h-1"}`} style={{ animationDelay: "0.5s" }} />
                    <div className={`w-0.5 rounded-full bg-blue-400 min-h-[4px] transition-all ${ttsSpeaking ? "h-6 animate-bounce shrink-0" : "h-1"}`} style={{ animationDelay: "0.2s" }} />
                    <div className={`w-0.5 rounded-full bg-blue-500 min-h-[4px] transition-all ${ttsSpeaking ? "h-4 animate-bounce shrink-0" : "h-1"}`} style={{ animationDelay: "0.4s" }} />
                    <div className={`w-0.5 rounded-full bg-blue-600/80 min-h-[4px] transition-all ${ttsSpeaking ? "h-2 animate-bounce shrink-0" : "h-1"}`} style={{ animationDelay: "0.6s" }} />
                    <div className={`w-0.5 rounded-full bg-blue-500/60 min-h-[4px] transition-all ${ttsSpeaking ? "h-5 animate-bounce shrink-0" : "h-1"}`} style={{ animationDelay: "0.15s" }} />
                  </div>

                  <p className="text-[10px] italic text-slate-400 font-sans leading-relaxed line-clamp-2 px-1 text-center bg-[#0F1117]/30 py-1 rounded">
                    "{ttsText}"
                  </p>
                </div>

                {/* Voice Personality Settings */}
                <div className="bg-[#0A0B0E]/50 border border-slate-800/40 p-3.5 rounded-xl space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Voice Personality</span>
                    <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded border border-[#2563EB]/40 bg-[#2563EB]/10 text-blue-300 uppercase">
                      {ttsPersonality}
                    </span>
                  </div>

                  {/* Toggle buttons for presets */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["Professional", "Concise", "Conversational"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          changeTtsPersonality(p);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-[9px] font-bold tracking-wide border transition duration-200 cursor-pointer text-center ${
                          ttsPersonality === p
                            ? "bg-blue-600/15 border-blue-500 text-blue-400 font-extrabold"
                            : "bg-[#111319] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-750"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Manual sliders */}
                  <div className="space-y-2.5 pt-2.5 border-t border-slate-800/40">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="text-slate-400 font-semibold text-[9px]">Speed (Rate)</span>
                        <span className="font-mono text-blue-400 font-bold">{ttsSpeed.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={ttsSpeed}
                        onChange={(e) => {
                          setTtsSpeed(parseFloat(e.target.value));
                        }}
                        className="w-full h-1 bg-[#111319] rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="text-slate-400 font-semibold text-[9px]">Pitch</span>
                        <span className="font-mono text-blue-400 font-bold">{ttsPitch.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={ttsPitch}
                        onChange={(e) => {
                          setTtsPitch(parseFloat(e.target.value));
                        }}
                        className="w-full h-1 bg-[#111319] rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Theme Selector Settings */}
              <div className="p-4 bg-[#161920] border border-slate-800/60 rounded-xl space-y-3" id="system-theme-selector-card">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-blue-500" />
                    System Display Matrix Theme
                  </span>
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 uppercase tracking-wider max-w-max">
                    Elegant Dark
                  </span>
                </div>
                
                <p className="text-[10px] text-slate-450 leading-normal font-sans">
                  Redefines Workspace primary, background, card elevations, line accenting, and telemetry highlights dynamically using root CSS variables.
                </p>

                {/* Theme Selector Choices */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(["Cyber Blue", "Midnight Purple", "Monochrome Slate"] as const).map((t) => {
                    const isSelected = activeTheme === t;

                    return (
                      <button
                        key={t}
                        onClick={() => {
                          setActiveTheme(t);
                          triggerAutoFeedback(
                            "info",
                            "Interface Protocol Re-routed",
                            `Dashboard UI state changed successfully to ${t} layout configurations.`,
                            `Display styling mutated to ${t} matrix, Stuart.`
                          );
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition duration-300 cursor-pointer ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-500 shadow-[0_4px_12px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/10"
                            : "bg-[#0A0B0E] border-slate-800 hover:border-slate-700 hover:bg-[#111319]"
                        }`}
                        title={`Deploys ${t} style specifications`}
                      >
                        {/* Theme preview circular indicator */}
                        <div className="w-4 h-4 rounded-full border border-slate-800/80 mb-1.5 flex items-center justify-center relative overflow-hidden bg-[#0F1117]">
                          {t === "Cyber Blue" && (
                            <div className="absolute inset-0 bg-[#0A0B0E] flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            </div>
                          )}
                          {t === "Midnight Purple" && (
                            <div className="absolute inset-0 bg-[#07040E] flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            </div>
                          )}
                          {t === "Monochrome Slate" && (
                            <div className="absolute inset-0 bg-[#0d0e12] flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
                            </div>
                          )}
                        </div>

                        <span className={`text-[9px] font-extrabold tracking-wide ${isSelected ? "text-slate-100" : "text-slate-400"}`}>
                          {t.split(" ")[0]}
                        </span>
                        <span className="text-[7.5px] font-mono text-slate-500 uppercase mt-0.5">
                          {t.split(" ")[1]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Actionable Diagnostic Recommendations Card */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Diagnostic advisory</span>
                
                {/* Condition-based Recommendations card */}
                {healthCurrent && healthCurrent.ram > 43 ? (
                  <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2.5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-slate-100">Task Memory Cache High ({healthCurrent.ram}%)</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">Simulated VM caches have built up heap blocks. Performing cache releases boosts reasoning performance.</p>
                      </div>
                    </div>
                    <button
                      onClick={handleTriggerManualGcFeedback}
                      className="w-full py-1.5 bg-[#0A0B0E] hover:bg-amber-500 hover:text-[#0A0B0E] border border-amber-500/40 hover:border-amber-500 rounded-lg text-amber-400 text-[10px] font-bold transition duration-300 flex items-center justify-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Run Garbage Collection Sweep Now
                    </button>
                  </div>
                ) : healthCurrent && healthCurrent.cpu > 70 ? (
                  <div className="p-3 bg-[#161920] border border-blue-500/20 rounded-xl space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Cpu className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-slate-100">Governor Active: Threads Loaded ({healthCurrent.cpu}%)</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">Heavy Ollama execution cycles parsed. TaskPilot is balancing system governors.</p>
                      </div>
                    </div>
                    <div className="p-2 bg-[#0A0B0E] rounded border border-slate-800 text-[9px] text-slate-500">
                      Recommendation: Keep CPU load below 85% to prevent thermal containment exceptions.
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-950/10 border border-blue-500/10 rounded-xl">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <h5 className="font-bold text-slate-100">All Core Systems OK</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">VM CPU threads and heap allocations are below safety limits. System is stable and listening for instructions.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Automatic Event logs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historical Auto Feedback Stream</span>
                  <button 
                    onClick={handleClearAllFeedbacks}
                    className="text-[9px] text-slate-500 hover:text-slate-300 underline font-semibold bg-transparent border-0 cursor-pointer"
                  >
                    Clear history
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {notifications.map((note) => (
                    <div 
                      key={note.id} 
                      className={`p-2.5 rounded-lg border flex gap-2.5 items-start ${
                        note.type === "success" 
                          ? "bg-emerald-950/10 border-emerald-500/10 text-emerald-400/90" 
                          : note.type === "warning" 
                            ? "bg-amber-950/10 border-amber-500/10 text-amber-400/90"
                            : note.type === "error"
                              ? "bg-rose-950/10 border-rose-500/10 text-rose-400/90"
                              : "bg-blue-950/10 border-blue-500/10 text-blue-400/90"
                      }`}
                    >
                      {note.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                      {note.type === "warning" && <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                      {note.type === "error" && <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                      {note.type === "info" && <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                      
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[10px] text-slate-200 truncate">{note.title}</span>
                          <span className="text-[8px] text-slate-500 font-mono shrink-0">
                            {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">{note.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer portion of drawer */}
            <div className="pt-4 border-t border-slate-800/50 bg-[#0F1117] space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                <span>Receiver:</span>
                <span className="font-bold text-slate-400">stuartdonsms@gmail.com</span>
              </div>
              <p className="text-[9px] text-slate-500 leading-normal bg-[#161920]/40 p-2 rounded border border-slate-800/35">
                Proactive logs are cleared when refreshing the browser window. Enabled browser TTS settings leverage native operating speech APIs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING TOAST POPUPS LAYER --- */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {activeToasts.map((toast) => (
          <div 
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border-l-4 shadow-2xl flex items-start gap-3 bg-[#0F1117] border-slate-850 border animate-fade-slide-up ${
              toast.type === "success" 
                ? "border-l-emerald-500" 
                : toast.type === "warning" 
                  ? "border-l-amber-500" 
                  : toast.type === "error" 
                    ? "border-l-rose-500" 
                    : "border-l-blue-500"
            }`}
          >
            <div className={`p-1 rounded-lg shrink-0 ${
              toast.type === "success" ? "bg-emerald-500/10 text-emerald-400" :
              toast.type === "warning" ? "bg-amber-500/10 text-amber-400" :
              toast.type === "error" ? "bg-rose-500/10 text-rose-400" :
              "bg-blue-500/10 text-blue-400"
            }`}>
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4" />}
              {toast.type === "warning" && <AlertCircle className="w-4 h-4" />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
              {toast.type === "info" && <Info className="w-4 h-4" />}
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <h4 className="font-bold text-[11px] text-slate-200">{toast.title}</h4>
              <p className="text-[10px] text-slate-400 leading-normal">{toast.message}</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveToasts(prev => prev.filter(t => t.id !== toast.id));
              }}
              className="p-1 rounded bg-[#161920]/40 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
