import React, { useState, useEffect } from "react";
import { 
  Cpu, HardDrive, Database, RefreshCw, Activity, Network, ShieldCheck, 
  Terminal, Server, AlertCircle, Sparkles, CheckCircle2, Zap 
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend 
} from "recharts";

interface TelemetryPoint {
  timeLabel: string;
  timestamp: number;
  cpu: number;
  cpuAgent: number;
  cpuSystem: number;
  ram: number;
  ramUsed: number;
  ramTotal: number;
  disk: number;
  diskUsed: number;
  diskTotal: number;
  networkIn: number;
  networkOut: number;
  latency: number;
}

interface HealthData {
  history: TelemetryPoint[];
  current: TelemetryPoint;
  commandsAnalyzed: number;
  stepsExecuted: number;
  lastActionTimestamp: number;
  environmentMode: string;
  ollamaStatus: string;
}

export default function SystemHealth() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gcSuccess, setGcSuccess] = useState(false);
  const [gcExecuting, setGcExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<"performance" | "memory" | "disk">("performance");

  const fetchHealthData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setHealth(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading health telemetry dataset:", err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Poll for live metrics updates every 2 seconds
  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(() => {
      fetchHealthData(true);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleGarbageCollection = () => {
    if (gcExecuting) return;
    setGcExecuting(true);
    setGcSuccess(false);

    setTimeout(() => {
      setGcExecuting(false);
      setGcSuccess(true);
      // Simulate resource reduction locally before next poll
      if (health) {
        setHealth(prev => {
          if (!prev) return null;
          const currentCopy = { ...prev.current };
          currentCopy.ramUsed = Math.max(currentCopy.ramUsed - 1.1, 3.8);
          currentCopy.ram = Math.round((currentCopy.ramUsed / currentCopy.ramTotal) * 100);
          return {
            ...prev,
            current: currentCopy
          };
        });
      }
      setTimeout(() => setGcSuccess(false), 3000);
    }, 1200);
  };

  if (isLoading || !health) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#161920]/40 border border-slate-800/40 rounded-xl h-full font-sans">
        <Activity className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-semibold tracking-wide">Dialing System Telemetry Interfaces...</p>
      </div>
    );
  }

  const currentPoint = health.current;

  // Colors for visualization segments
  const DISK_COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#6366F1"];
  const diskBreakdownData = [
    { name: "OS Core & Node VM", value: 142.1 },
    { name: "TaskPilot AI Files", value: 4.8 },
    { name: "Ollama Models Workspace", value: 32.5 },
    { name: "Simulated User Desktop", value: currentPoint ? Math.round((currentPoint.diskUsed - 179.4) * 10) / 10 : 5.0 }
  ];

  return (
    <div className="flex flex-col gap-5 h-full text-xs font-sans">
      
      {/* Upper Quick Statistics row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Card 1: CPU usage dial ratio */}
        <div className="p-4 bg-[#161920] border border-slate-800/50 rounded-xl relative overflow-hidden group hover:border-blue-500/30 transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">CPU Thread Load</span>
              <span className="text-2xl font-bold tracking-tight text-white">{currentPoint.cpu}%</span>
            </div>
            <div className="p-2 rounded bg-[#0A0B0E] border border-slate-800/80 text-blue-500">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 space-y-1">
            <div className="w-full bg-[#0A0B0E] h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  currentPoint.cpu > 80 ? "bg-rose-500" : currentPoint.cpu > 55 ? "bg-amber-500" : "bg-blue-500"
                }`}
                style={{ width: `${currentPoint.cpu}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Agent Core: {currentPoint.cpuAgent}%</span>
              <span>Sys OS: {currentPoint.cpuSystem}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Memory Load buffer */}
        <div className="p-4 bg-[#161920] border border-slate-800/50 rounded-xl relative overflow-hidden group hover:border-emerald-500/30 transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Allocated Memory</span>
              <span className="text-2xl font-bold tracking-tight text-white">{currentPoint.ram}%</span>
            </div>
            <div className="p-2 rounded bg-[#0A0B0E] border border-slate-800/80 text-emerald-500">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 space-y-1">
            <div className="w-full bg-[#0A0B0E] h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${currentPoint.ram}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Used: {currentPoint.ramUsed} GB</span>
              <span>Available: 16.0 GB</span>
            </div>
          </div>
        </div>

        {/* Card 3: Storage sector */}
        <div className="p-4 bg-[#161920] border border-slate-800/50 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">SSD Disk Capacity</span>
              <span className="text-2xl font-bold tracking-tight text-white">{currentPoint.disk}%</span>
            </div>
            <div className="p-2 rounded bg-[#0A0B0E] border border-slate-800/80 text-amber-500">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 space-y-1">
            <div className="w-full bg-[#0A0B0E] h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${currentPoint.disk}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Occupied: {currentPoint.diskUsed} GB</span>
              <span>Total: 512.0 GB</span>
            </div>
          </div>
        </div>

        {/* Card 4: Daemon Network status and stats */}
        <div className="p-4 bg-[#161920] border border-slate-800/50 rounded-xl relative overflow-hidden group hover:border-indigo-500/30 transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Model RPC Latency</span>
              <span className="text-2xl font-bold tracking-tight text-white">{currentPoint.latency} <span className="text-xs text-slate-400 font-normal">ms</span></span>
            </div>
            <div className="p-2 rounded bg-[#0A0B0E] border border-slate-800/80 text-indigo-400">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                In: {currentPoint.networkIn} KB/s
              </span>
              <span>Out: {currentPoint.networkOut} KB/s</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
              <span>Environment:</span>
              <span className="text-blue-400 uppercase font-bold text-[9px]">{health.environmentMode}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main split visualization space */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* Left Side: Real-time Recharts panel */}
        <div className="lg:col-span-8 bg-[#161920] border border-slate-800/50 rounded-2xl p-4 flex flex-col shadow-xl min-h-[340px]">
          <div className="flex items-center justify-between border-b border-slate-800/50 pb-3 mb-4">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-500" />
                Live Performance Telemetry Spectrum
              </h3>
              <p className="text-[10px] text-slate-500">Historical performance ticks parsed inside sandbox environments</p>
            </div>

            {/* Metric Tab Selector */}
            <div className="flex bg-[#0A0B0E] p-1 rounded-lg border border-slate-800/60">
              <button 
                onClick={() => setActiveTab("performance")}
                className={`px-3 py-1 text-[10px] font-semibold rounded-md transition ${
                  activeTab === "performance" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                CPU Spectrum
              </button>
              <button 
                onClick={() => setActiveTab("memory")}
                className={`px-3 py-1 text-[10px] font-semibold rounded-md transition ${
                  activeTab === "memory" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Network activity
              </button>
              <button 
                onClick={() => setActiveTab("disk")}
                className={`px-3 py-1 text-[10px] font-semibold rounded-md transition ${
                  activeTab === "disk" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Directory sectors
              </button>
            </div>
          </div>

          {/* Visual Canvas containing Recharts renders */}
          <div className="flex-1 w-full min-h-[220px]">
            {activeTab === "performance" && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={health.history}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="agentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.4} />
                  <XAxis 
                    dataKey="timeLabel" 
                    stroke="#475569" 
                    fontSize={9} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={9} 
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#0F1117", 
                      borderColor: "rgba(100, 116, 139, 0.3)", 
                      borderRadius: "8px",
                      fontSize: "10px",
                      fontFamily: "monospace" 
                    }}
                    labelStyle={{ color: "#94A3B8" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cpu" 
                    name="Global CPU Load" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#cpuGradient)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cpuAgent" 
                    name="TaskPilot AI Engine" 
                    stroke="#6366F1" 
                    strokeWidth={1.5}
                    fillOpacity={1} 
                    fill="url(#agentGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeTab === "memory" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={health.history}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.4} />
                  <XAxis 
                    dataKey="timeLabel" 
                    stroke="#475569" 
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    unit=" KB"
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#0F1117", 
                      borderColor: "rgba(100, 116, 139, 0.3)", 
                      borderRadius: "8px",
                      fontSize: "10px",
                      fontFamily: "monospace" 
                    }}
                    labelStyle={{ color: "#94A3B8" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "9px" }} />
                  <Line 
                    type="monotone" 
                    dataKey="networkIn" 
                    name="Network RX (Inbound)" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 4 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="networkOut" 
                    name="Network TX (Outbound)" 
                    stroke="#EC4899" 
                    strokeWidth={1.5} 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeTab === "disk" && (
              <div className="flex flex-col md:flex-row items-center justify-between h-full py-2">
                <div className="w-full md:w-[45%] h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={diskBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {diskBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={DISK_COLORS[index % DISK_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} GB`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-[50%] space-y-3 p-2 bg-[#0A0B0E]/60 border border-slate-800/40 rounded-lg">
                  <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">Partition Space Allocations</h4>
                  {diskBreakdownData.map((part, idx) => (
                    <div key={part.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: DISK_COLORS[idx] }}></span>
                        <span className="text-[10px] text-slate-400 font-medium">{part.name}</span>
                      </div>
                      <span className="font-mono text-slate-200 font-semibold">{part.value} GB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Assistant Control / Live Health Actions */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Box 1: Assistant Diagnostic telemetry */}
          <div className="p-4 bg-[#161920] border border-slate-800/50 rounded-2xl space-y-4 shadow-xl flex-1 flex flex-col justify-between">
            <div className="space-y-3.5">
              <div>
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-emerald-500 animate-pulse" />
                  Performance parameters
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Automated CPU-governor parameters overview</p>
              </div>

              {/* Param 1: Agent State */}
              <div className="space-y-2.5 pt-1.5 border-t border-slate-800/40 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Commands Parsed:</span>
                  <span className="font-mono font-bold text-blue-400 bg-[#0A0B0E] px-1.5 py-0.5 rounded border border-slate-800/60">
                    {health.commandsAnalyzed}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Daemon Steps Executed:</span>
                  <span className="font-mono font-bold text-emerald-400 bg-[#0A0B0E] px-1.5 py-0.5 rounded border border-slate-800/60">
                    {health.stepsExecuted}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ollama Local Model Status:</span>
                  <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                    health.ollamaStatus === "INFERENCE_RUNNING" 
                      ? "text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse" 
                      : "text-slate-400 bg-[#0A0B0E] border-slate-800/60"
                  }`}>
                    {health.ollamaStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Garbage Collector daemon:</span>
                  <span className="font-mono text-slate-420 font-semibold text-emerald-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Secure Active
                  </span>
                </div>
              </div>
            </div>

            {/* Action Item: Flush Memory Cache */}
            <div className="pt-4 border-t border-slate-800/40 mt-auto space-y-2.5">
              <button
                onClick={handleGarbageCollection}
                disabled={gcExecuting}
                className="w-full py-2.5 px-3 bg-[#0A0B0E] hover:bg-[#111319] border border-slate-800/80 hover:border-slate-700 hover:text-slate-200 transition text-slate-350 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {gcExecuting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                    Clearing Cache & GC buffers...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Manually Flush Memory/GC
                  </>
                )}
              </button>
              
              {gcSuccess && (
                <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[10px]">Successfully released 1.1 GB of virtual sandbox RAM storage cache.</span>
                </div>
              )}
            </div>
          </div>

          {/* Box 2: System Safety Status info widget */}
          <div className="p-4 bg-[#161920] border border-slate-800/50 rounded-2xl space-y-3 shadow-xl">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              Agent Sandbox Protections
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              TaskPilot AI is bound to sandbox virtualization parameters. Sensitive shell actions (formatting/deletion of registry variables) require manual user approval via the Control Hub.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-[10px]">
              <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Security Protocols: v1.1 Active</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
