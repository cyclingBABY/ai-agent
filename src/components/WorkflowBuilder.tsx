import React, { useState } from "react";
import { Play, Plus, Trash2, Save, Sparkles, Activity, Layers, CornerDownRight, CheckCircle, Terminal, Coffee, Code, AlertCircle } from "lucide-react";
import { Workflow, WorkflowStep, TaskStep } from "../types";

interface WorkflowBuilderProps {
  workflows: Workflow[];
  onSaveNewWorkflow: (name: string, description: string, steps: WorkflowStep[]) => Promise<void>;
  onExecuteSimulatedStep: (step: TaskStep) => Promise<string>;
}

export default function WorkflowBuilder({
  workflows,
  onSaveNewWorkflow,
  onExecuteSimulatedStep
}: WorkflowBuilderProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(workflows[0] || null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState<number | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  // Form states for creating a new workflow
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDesc, setNewWorkflowDesc] = useState("");
  const [newSteps, setNewSteps] = useState<WorkflowStep[]>([]);
  const [stepAction, setStepAction] = useState("open_app");
  const [stepTarget, setStepTarget] = useState("");

  const handleAddStepToForm = () => {
    if (!stepTarget.trim()) return;
    const newStep: WorkflowStep = {
      id: `wfs-${Date.now()}`,
      name: `Step: ${stepAction.toUpperCase()}`,
      action: stepAction,
      target: stepTarget
    };
    setNewSteps((prev) => [...prev, newStep]);
    setStepTarget("");
  };

  const handleRemoveStepFromForm = (id: string) => {
    setNewSteps((prev) => prev.filter((step) => step.id !== id));
  };

  const handleSaveWorkflow = async () => {
    if (!newWorkflowName.trim() || newSteps.length === 0) return;
    await onSaveNewWorkflow(newWorkflowName, newWorkflowDesc, newSteps);
    setNewWorkflowName("");
    setNewWorkflowDesc("");
    setNewSteps([]);
  };

  // Run the selected workflow steps sequentially in a simulated automation routine
  const handleTriggerWorkflow = async (workflow: Workflow) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setConsoleOutput([`[Routine Orchestrator] Booting trigger checklist for routine: "${workflow.name}"`]);

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      setActiveStepIdx(i);
      setConsoleOutput((prev) => [...prev, `[Running step ${i + 1}/${workflow.steps.length}]: Dispatching ${step.action} - Target "${step.target}"`]);

      // Translate workflow step to standard execution TaskStep contract
      const executionStep: TaskStep = {
        id: step.id,
        action: step.action as any,
        status: "pending",
        target: step.target,
        details: `Dispatched from reusable routine sequence: "${workflow.name}"`,
        requiresApproval: false,
        explanation: "Automated macro step list."
      };

      try {
        const consoleResult = await onExecuteSimulatedStep(executionStep);
        setConsoleOutput((prev) => [...prev, consoleResult]);
      } catch (e: any) {
        setConsoleOutput((prev) => [...prev, `[Action Failure] Error running routine step: ${e.message || e}`]);
      }

      // Small pause delay between steps for beautiful orchestration visualizer
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    setActiveStepIdx(null);
    setIsExecuting(false);
    setConsoleOutput((prev) => [...prev, `[Routine Orchestrator] Routine "${workflow.name}" successfully terminated.`]);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Coffee":
        return <Coffee className="w-4 h-4 text-amber-500" />;
      case "Terminal":
        return <Code className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full font-sans">
      {/* LEFT: Choose & run routines */}
      <div className="flex-1 space-y-4">
        <div className="p-4 bg-[#161920] border border-slate-800/50 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Active Automation Routines
              </h3>
              <p className="text-[10px] text-slate-505 mt-0.5">Define multi-app macros to launch on a single click.</p>
            </div>
          </div>

          {/* Workflow Picker Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workflows.map((wf) => {
              const isSelected = activeWorkflow?.id === wf.id;
              return (
                <div
                  key={wf.id}
                  onClick={() => !isExecuting && setActiveWorkflow(wf)}
                  className={`p-3.5 border rounded-lg cursor-pointer transition ${
                    isSelected
                      ? "bg-blue-600/10 border-blue-500/50"
                      : "bg-[#0A0B0E]/60 border-slate-800/80 hover:border-slate-800 hover:bg-[#0A0B0E]/80"
                  } ${isExecuting ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded bg-[#0A0B0E] border border-slate-800 mt-0.5">
                      {getIcon(wf.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200">{wf.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-normal mt-1 block">
                        {wf.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Macro Step Details */}
          {activeWorkflow && (
            <div className="p-4 bg-[#0A0B0E] border border-slate-800/60 rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{activeWorkflow.name} Steps</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{activeWorkflow.steps.length} sequential steps allocated</p>
                </div>
                <button
                  onClick={() => handleTriggerWorkflow(activeWorkflow)}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 ring-1 ring-blue-500/30 rounded-lg font-bold transition disabled:opacity-40"
                >
                  <Play className="w-3 h-3 fill-current text-blue-400" />
                  Trigger Routine
                </button>
              </div>

              {/* Steps timeline visualization */}
              <div className="space-y-3">
                {activeWorkflow.steps.map((step, idx) => {
                  const isCurrent = activeStepIdx === idx;
                  const isDone = activeStepIdx !== null && idx < activeStepIdx;
                  return (
                    <div
                      key={step.id}
                      className={`flex gap-3 text-xs p-2.5 border rounded-lg transition duration-200 ${
                        isCurrent
                          ? "bg-blue-950/15 border-blue-500/50 shadow-lg"
                          : isDone
                            ? "bg-[#161920]/40 border-slate-800/60 opacity-60"
                            : "bg-[#161920]/60 border-slate-800/40"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold ${
                            isCurrent
                              ? "bg-blue-600 text-white animate-pulse"
                              : isDone
                                ? "bg-emerald-950 border border-emerald-500 text-emerald-400"
                                : "bg-[#0A0B0E] text-slate-500 border border-slate-800/80"
                          }`}
                        >
                          {isDone ? "✓" : idx + 1}
                        </div>
                        {idx !== activeWorkflow.steps.length - 1 && (
                          <div className="w-0.5 h-6 bg-slate-800 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 font-sans">
                        <div className="flex items-center justify-between font-sans">
                          <span className="font-semibold text-slate-200">{step.name}</span>
                          <span className="text-[9px] text-blue-400 font-mono font-semibold">
                            {step.action.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <CornerDownRight className="w-3 h-3 text-blue-500" /> Target:{" "}
                          <span className="text-slate-400 font-mono">{step.target}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Executor details window */}
        {consoleOutput.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase text-slate-505 tracking-wider flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-blue-500" /> Routine Execution Output
            </span>
            <div className="bg-[#0A0B0E] border border-slate-800/80 rounded-lg p-3 font-mono text-[10px] leading-relaxed text-[#5FCEFF]/95 max-h-[140px] overflow-y-auto">
              {consoleOutput.map((l, idx) => (
                <p key={idx} className="hover:text-white transition-all select-all font-mono py-0.5">
                  {l}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>      {/* RIGHT: Custom Visual macro setup builder */}
      <div className="w-full lg:w-[320px] shrink-0 p-4 bg-[#161920] border border-slate-800/50 rounded-xl space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-500" />
            Composite Routine Builder
          </h3>
          <p className="text-[10px] text-slate-505 mt-0.5 font-medium">Assemble your own recurring tasks sequence.</p>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-[#a0afca] font-medium block">Routine Label</label>
            <input
              type="text"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              className="w-full bg-[#0A0B0E] border border-slate-800/80 rounded text-slate-200 p-2 outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-650"
              placeholder="e.g. Code Review Setup"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#a0afca] font-medium block">Description</label>
            <textarea
              value={newWorkflowDesc}
              onChange={(e) => setNewWorkflowDesc(e.target.value)}
              rows={2}
              className="w-full bg-[#0A0B0E] border border-slate-800/80 rounded text-slate-200 p-2 outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-650 resize-none"
              placeholder="Provide a description of what this workflow launches..."
            />
          </div>

          {/* Steps Assembly area */}
          <div className="border border-slate-800/70 rounded-lg p-2.5 bg-[#0A0B0E]/60 space-y-3">
            <span className="text-[10px] font-bold text-blue-450 block uppercase tracking-wider">
              Add Execution Step Tuple
            </span>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500">Action Block</span>
                  <select
                    value={stepAction}
                    onChange={(e) => setStepAction(e.target.value)}
                    className="w-full bg-[#161920]/80 border border-slate-800/80 rounded text-slate-350 p-1 font-mono text-[10px] outline-none"
                  >
                    <option value="open_app">launch_app</option>
                    <option value="browser_action">visit_page</option>
                    <option value="manage_files">organize_files</option>
                    <option value="system_control">control_state</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500">Parameters</span>
                  <input
                    type="text"
                    value={stepTarget}
                    onChange={(e) => setStepTarget(e.target.value)}
                    placeholder="e.g. VS Code, URL"
                    className="w-full bg-[#161920]/80 border border-slate-800/80 rounded text-slate-200 p-1 text-[10px] placeholder-slate-650 outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleAddStepToForm}
                className="w-full py-1 bg-[#161920]/80 hover:bg-[#161920] border border-slate-800 text-[10px] text-slate-300 rounded font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3 h-3 text-blue-500" /> Assemble Step
              </button>
            </div>
          </div>

          {/* Form Stack Checklist Preview */}
          {newSteps.length > 0 && (
            <div className="space-y-2 progress-steps max-h-[140px] overflow-y-auto">
              <span className="text-[9px] font-bold text-slate-400 block uppercase font-sans">Draft Sequence List</span>
              <div className="space-y-1.5">
                {newSteps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between p-2 bg-[#0A0B0E] border border-slate-800/80 rounded text-[10px] font-sans">
                    <div className="truncate flex-1 pr-2">
                      <span className="font-mono text-blue-400 text-[8px] uppercase tracking-wide mr-1.5 font-bold">[{step.action}]</span>
                      <span className="text-slate-300 font-medium">{step.target}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveStepFromForm(step.id)}
                      className="text-rose-450 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSaveWorkflow}
            disabled={!newWorkflowName.trim() || newSteps.length === 0}
            className="w-full py-2 bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5 text-blue-200" /> Save Automation Macro
          </button>
        </div>
      </div>
    </div>
  );
}
