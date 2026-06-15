import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, ShieldAlert, Cpu, CheckCircle2, Play, Circle, PlayCircle, Radio, Settings, AlertCircle, Terminal, HelpCircle } from "lucide-react";
import { TaskPlan, TaskStep, SystemState } from "../types";

interface AgentConsoleProps {
  systemState: SystemState;
  onUpdateState: (updates: Partial<SystemState>) => void;
  onRefreshAll: () => void;
  onPlanLoaded: (plan: TaskPlan) => void;
  activePlan: TaskPlan | null;
  setActivePlan: (plan: TaskPlan | null) => void;
  onExecuteStep: (step: TaskStep) => Promise<string>;
}

export default function AgentConsole({
  systemState,
  onUpdateState,
  onRefreshAll,
  onPlanLoaded,
  activePlan,
  setActivePlan,
  onExecuteStep
}: AgentConsoleProps) {
  const [inputText, setInputText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRecordMode, setIsRecordMode] = useState(false);
  const [customWakeWord, setCustomWakeWord] = useState("Hey TaskPilot");
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");
  const [speechVolume, setSpeechVolume] = useState(0);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const speechInterval = useRef<any>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [executionLogs]);

  // Handle Speech simulation
  const toggleSpeechRecording = () => {
    if (isRecordMode) {
      clearInterval(speechInterval.current);
      setIsRecordMode(false);
      setSpeechVolume(0);
      
      // Seed a random useful instruction in trigger list
      const commands = [
        "Create folders for Images, Videos and Documents",
        "Move PDFs to Reports and clean up temp caches",
        "Open Chrome Browser and search for current weather info",
        "Turn the volume down to 25% and lock computer"
      ];
      setInputText(commands[Math.floor(Math.random() * commands.length)]);
    } else {
      setIsRecordMode(true);
      setExecutionLogs((prev) => [...prev, "[Voice Unit] Initializing Whisper continuous listening codec..."]);
      speechInterval.current = setInterval(() => {
        setSpeechVolume(Math.floor(Math.random() * 80) + 10);
      }, 100);
    }
  };

  const handleSendCommand = async () => {
    if (!inputText.trim()) return;
    setIsEvaluating(true);
    setWarningMessage(null);
    setExecutionLogs((prev) => [
      ...prev,
      `[AI Agent Router] User instruction: "${inputText.trim()}"`,
      `[AI Agent Router] Invoking Planner core parsing layer using ${selectedModel}...`
    ]);

    try {
      const response = await fetch("/api/agent/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: inputText })
      });
      const data = await response.json();
      if (data.plan) {
        onPlanLoaded(data.plan);
        setExecutionLogs((prev) => [
          ...prev,
          `[Agent Planner] Created high-fidelity multi-step plan matching prompt: "${data.plan.steps.length} actions allocated."`,
          `[Agent Planner] System reasoning: "${data.plan.reasoning}"`
        ]);
        if (data.warning) {
          setWarningMessage(data.warning);
        }
      }
    } catch (e: any) {
      console.error(e);
      setExecutionLogs((prev) => [...prev, `[Agent Error] Failed generating task plan mapping trace: ${e.message}`]);
    } finally {
      setIsEvaluating(false);
      setInputText("");
    }
  };

  // Run a specific step of the plan
  const handleRunCommandStep = async (step: TaskStep, index: number) => {
    if (!activePlan) return;

    // Mutate step status to executing inside UI
    const updatedSteps = [...activePlan.steps];
    updatedSteps[index].status = "executing";
    setActivePlan({ ...activePlan, steps: updatedSteps });

    setExecutionLogs((prev) => [...prev, `[Action Driver] Dispatched worker thread for command segment ID: ${step.id}`]);

    try {
      const logOutput = await onExecuteStep(step);
      setExecutionLogs((prev) => [...prev, logOutput]);
      
      // Mutate status to completed
      const finalSteps = [...activePlan.steps];
      finalSteps[index].status = "completed";
      setActivePlan({ ...activePlan, steps: finalSteps });
    } catch (e: any) {
      const failedSteps = [...activePlan.steps];
      failedSteps[index].status = "failed";
      setActivePlan({ ...activePlan, steps: failedSteps });
      setExecutionLogs((prev) => [...prev, `[Action Driver Error] Command simulation failure: ${e}`]);
    }
  };

  // Authorize/Unapprove toggle for sensitive operations
  const handleAuthorizeToggle = (index: number) => {
    if (!activePlan) return;
    const updatedSteps = [...activePlan.steps];
    const prevStatus = updatedSteps[index].status;
    updatedSteps[index].status = prevStatus === "approved" ? "pending" : "approved";
    setActivePlan({ ...activePlan, steps: updatedSteps });
    
    const isNowApproved = updatedSteps[index].status === "approved";
    setExecutionLogs((prev) => [
      ...prev, 
      `[Security Manager] ${isNowApproved ? "GRANTED" : "REVOKED"} user security clearance for action: "${updatedSteps[index].target}"`
    ]);
  };

  // Run entire plan
  const handleRunCompletePlan = async () => {
    if (!activePlan) return;
    setExecutionLogs((prev) => [...prev, "[AI Agent Router] Commencing automated execution of full stacked plan list..."]);

    for (let i = 0; i < activePlan.steps.length; i++) {
      const step = activePlan.steps[i];
      if (step.status === "completed") continue;

      if (step.requiresApproval && step.status !== "approved") {
        setExecutionLogs((prev) => [
          ...prev,
          `[Security Block] Halted automated sequence at step ${i+1}. Action "${step.action}" needs active Security Clearance approval.`
        ]);
        break;
      }

      await handleRunCommandStep(step, i);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F1117] border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl">
      {/* Console Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161920] border-b border-slate-800/50">
        <div className="flex items-center gap-1.5 font-sans">
          <Cpu className="w-4 h-4 text-blue-500 stroke-[2.5]" />
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-widest">
            TaskPilot Assistant Console
          </h2>
        </div>

        {/* Model and Wake Word settings menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Wake Phrase:</span>
            <span className="font-mono text-blue-400 bg-[#0A0B0E] px-1 py-0.5 rounded border border-slate-800/40">
              {customWakeWord}
            </span>
          </div>
        </div>
      </div>

      {/* Main Console Split Area: Planner and Shell Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Core Settings Block */}
        <div className="p-3 bg-[#0A0B0E] border border-slate-800/60 rounded-lg text-xs space-y-3 font-sans">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Settings className="w-3.5 h-3.5 text-blue-500" />
              <span>System & Agent Properties</span>
            </div>
            <span className="text-[10px] text-blue-400 font-mono">v1.1 Active</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold block">Inference Brain</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#161920]/80 border border-slate-800 rounded text-slate-300 p-1 font-mono outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Core Node)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex Reasoner)</option>
                <option value="ollama-local-llama3">Ollama Local LLaMA 3 (Offline Mode)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold block">Listen Wakephrase</label>
              <input
                type="text"
                value={customWakeWord}
                onChange={(e) => setCustomWakeWord(e.target.value)}
                className="w-full bg-[#161920]/80 border border-slate-800 rounded text-slate-300 p-1 font-mono outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Hey TaskPilot"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Fallback warning from local execution */}
        {warningMessage && (
          <div className="p-3 bg-blue-950/15 border border-blue-500/20 rounded-lg text-[11px] text-blue-300 leading-normal flex gap-2.5 font-sans">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Local Sandbox Intelligence Mode Active:</span> {warningMessage}
            </div>
          </div>
        )}

        {/* AI PLANNED STEPS (The Brain / Planner View) */}
        {activePlan ? (
          <div className="space-y-3 font-sans">
            <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between font-sans">
                <span className="text-[10px] text-blue-300 uppercase font-bold tracking-widest block">
                  AI Task Plan Reasoning
                </span>
                <span className="text-[10px] text-slate-400 bg-[#0A0B0E] px-2 py-0.5 rounded border border-slate-800/60">
                  {activePlan.steps.length} Steps mapped
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 italic leading-relaxed">
                "{activePlan.reasoning}"
              </p>
            </div>

            {/* Checklist of steps */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-slate-40 tracking-wider">
                  Sequential Directives Checklist
                </span>
                <button
                  onClick={handleRunCompletePlan}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 ring-1 ring-emerald-500/30 rounded font-bold transition"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Run Stacked Plan
                </button>
              </div>

              <div className="space-y-2">
                {activePlan.steps.map((step, idx) => {
                  const isPending = step.status === "pending";
                  const isExecuting = step.status === "executing";
                  const isCompleted = step.status === "completed";
                  const isApproved = step.status === "approved";
                  const isFailed = step.status === "failed";

                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isExecuting
                          ? "bg-blue-950/15 border-blue-550/40 ring-1 ring-blue-500/20 animate-pulse"
                          : isCompleted
                            ? "bg-[#161920]/45 border-slate-800/70 opacity-60"
                            : "bg-[#0A0B0E] border-slate-800/80"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                          ) : isExecuting ? (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : isFailed ? (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-slate-200 truncate">
                              Step {idx + 1}: {step.action.toUpperCase()}
                            </h4>
                            <span className="text-[10px] bg-[#0A0B0E] px-1.5 py-0.5 rounded text-slate-400 font-mono border border-slate-800/30">
                              Target: {step.target}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                            {step.details}
                          </p>
                          <p className="text-[10px] text-blue-450 italic mt-1 pb-1 font-mono">
                            Motivation: {step.explanation}
                          </p>

                          {/* Security Clearance Alert Indicator */}
                          {step.requiresApproval && (
                            <div className="mt-2 flex items-center justify-between p-2 rounded bg-rose-500/5 border border-rose-500/20 text-[11px]">
                              <div className="flex items-center gap-1.5 text-rose-400 font-medium">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                                <span>Verification Needed</span>
                              </div>
                              <button
                                onClick={() => handleAuthorizeToggle(idx)}
                                className={`px-2.5 py-0.5 text-[10px] rounded font-semibold transition ${
                                  isApproved
                                    ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                                    : "bg-rose-500/25 text-rose-300 hover:bg-rose-500/35 ring-1 ring-rose-300/30"
                                }`}
                              >
                                {isApproved ? "Clearance GRANTED" : "Authorize Action"}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Direct Play/Simulate action trigger */}
                        <div className="mt-0.5">
                          <button
                            onClick={() => handleRunCommandStep(step, idx)}
                            disabled={isExecuting || isCompleted || (step.requiresApproval && !isApproved)}
                            className="p-1 px-2 text-[10px] bg-[#161920]/80 border border-slate-800 text-blue-400 hover:text-blue-300 rounded hover:bg-blue-950/20 disabled:opacity-45 disabled:pointer-events-none font-semibold flex items-center gap-1 transition"
                            title="Execute this command step"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            Simulate
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-800/80 rounded-lg text-slate-500 font-sans">
            <Cpu className="w-8 h-8 text-blue-500/25 mb-2.5" />
            <h4 className="text-xs font-semibold text-slate-300">Awaiting Commands</h4>
            <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 leading-normal">
              Type or speak an instruction below (such as <span className="text-blue-400">"reorganize my downloads"</span> or <span className="text-blue-400 font-medium">"lock computer"</span>) to generate task plans.
            </p>
          </div>
        )}

        {/* SCROLLING SHELL EXECUTION LOGS (The Executor Console) */}
        <div className="space-y-1.5 flex-1 min-h-[140px] flex flex-col font-sans">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-blue-500" /> TaskPilot Active Execution Shell
          </span>
          <div className="flex-1 bg-[#0A0B0E] border border-slate-800/60 rounded-lg p-2.5 font-mono text-[10px] leading-relaxed text-slate-400 overflow-y-auto max-h-[160px]">
            {executionLogs.length === 0 ? (
              <span className="text-slate-650 block">[Console Idle] Launch commands to inspect system logs.</span>
            ) : (
              executionLogs.map((log, idx) => (
                <div key={idx} className="border-l border-slate-800/80 pl-2 py-0.5 leading-relaxed text-[#5FCEFF]/90 select-all font-mono">
                  {log}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      {/* Futuristic Command Input Panel */}
      <div className="p-3 bg-[#0A0B0E] border-t border-slate-800/40">
        {/* Animated Voice indicators when mic active */}
        {isRecordMode && (
          <div className="flex items-center gap-1.5 justify-center py-2 mb-2 bg-blue-950/15 border border-blue-500/20 rounded-md font-sans">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse mr-1" />
            <span className="text-[11px] text-slate-300 font-semibold uppercase font-mono tracking-wider">
              Continuous listening Mode Active
            </span>
            <div className="flex gap-0.5 items-end h-4 ml-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-500 rounded-full transition-all"
                  style={{ height: `${Math.max(4, (speechVolume * (i % 2 === 0 ? 0.7 : 1.2)) / 7.5)}px` }}
                ></div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 font-sans">
          {/* Continuous Listener Mic Trigger */}
          <button
            onClick={toggleSpeechRecording}
            className={`p-2.5 rounded-lg border transition-all ${
              isRecordMode
                ? "bg-rose-600 border-rose-500 text-white animate-pulse shadow-md"
                : "bg-[#161920]/80 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Speech-to-Text conversion triggers"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Prompt Entry Input */}
          <div className="flex-1 flex items-center bg-[#161920]/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus-within:ring-1 focus-within:ring-blue-500">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendCommand()}
              placeholder={isRecordMode ? "Whisper listening... Click mic button again to finalize" : "Instruct computer... e.g. Open website google.com"}
              className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500"
              disabled={isEvaluating}
            />
          </div>

          <button
            onClick={handleSendCommand}
            disabled={isEvaluating || !inputText.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-550 disabled:opacity-40 disabled:pointer-events-none rounded-lg text-white transition font-semibold"
          >
            {isEvaluating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
