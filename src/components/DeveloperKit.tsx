import React, { useState } from "react";
import { 
  FolderGit, Check, Copy, FileCode, Server, Play, ChevronRight, Terminal, 
  HelpCircle, HardDrive, Cpu, ShieldCheck, Search, Filter, AppWindow, 
  Brain, Mic, Keyboard, Globe, FileText, Lock, Database, GitBranch, 
  SlidersHorizontal, CheckCircle2, Zap, LayoutGrid, Eye, ExternalLink
} from "lucide-react";
import { DeveloperFile } from "../types";

interface DeveloperKitProps {
  devFiles: DeveloperFile[];
}

interface StackTool {
  id: string;
  name: string;
  recommendedTool: string;
  category: "ai" | "voice" | "control" | "scraping" | "integrations" | "infra";
  categoryLabel: string;
  description: string;
  feature: string;
  command: string;
  sampleCode: string;
}

// Highly detailed open-source desktop stack index
const PILOT_MVP_STACK: StackTool[] = [
  {
    id: "ollama",
    name: "Natural Language & Planning",
    recommendedTool: "Ollama (Llama 3)",
    category: "ai",
    categoryLabel: "AI & Planning",
    description: "Operates optimized regional models offline directly inside local system containers to process automation intent.",
    feature: "Zero cloud hops, 100% active private context, low memory parameters.",
    command: "curl http://localhost:11434",
    sampleCode: `// Process local llama queries via native JS loop
const queryOllama = async (prompt) => {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt: prompt,
      stream: false
    })
  });
  const data = await res.json();
  return data.response;
};`
  },
  {
    id: "crewai",
    name: "Multi-Agent Orchestration",
    recommendedTool: "CrewAI & LangChain",
    category: "ai",
    categoryLabel: "AI & Planning",
    description: "Enables structural task partitioning, multi-agent feedback loops, and sequential logical dependency analysis.",
    feature: "Establishes distinct role definitions like System Analyser, Execution Agent, and Sandbox Auditor.",
    command: "pip install crewai langchain-community",
    sampleCode: `// Multi-agent workflow role creation pattern
const setupAgents = () => {
  const researcher = new Agent({
    role: "Desktop File Scout",
    goal: "Locate specific system directory parameters",
    backstory: "Autonomous navigator skilled in filesystem parsing",
    tools: [new FileSearchTool()]
  });
  
  const worker = new Agent({
    role: "PowerShell Operator",
    goal: "Build verified script packages",
    backstory: "An expert developer inside Windows PowerShell parameters"
  });
};`
  },
  {
    id: "whisper",
    name: "Speech-to-Text Transduction",
    recommendedTool: "Whisper.cpp",
    category: "voice",
    categoryLabel: "Voice Control",
    description: "Blazing fast native C/C++ port of OpenAI's Whisper model that runs locally on local CPU threads.",
    feature: "Near zero speech latency, operates without cloud internet requirements.",
    command: "git clone https://github.com/ggerganov/whisper.cpp",
    sampleCode: `# Run local accelerated audio transcribing via console CLI
./main -m models/ggml-tiny.en.bin -f voice_action.wav -otxt

# Standard NodeJS Spawn wrapper for local Whisper.cpp thread:
const { spawn } = require('child_process');
const transcribe = (audioPath) => {
  const whisper = spawn('./main', ['-m', 'models/ggml-tiny.en.bin', '-f', audioPath]);
  whisper.stdout.on('data', (data) => console.log('Parsed speech text:', data.toString()));
};`
  },
  {
    id: "piper",
    name: "Text-to-Speech Synthesis",
    recommendedTool: "Piper TTS / Coqui TTS",
    category: "voice",
    categoryLabel: "Voice Control",
    description: "A fast, local neural text-to-speech system optimized for low-latency desktop execution.",
    feature: "Authentic, high-fidelity voices generated directly via C/C++ threads.",
    command: "pip install piper-tts",
    sampleCode: `// Generate voice response audio stream inside system
const { exec } = require('child_process');

const speakText = (text, outputWavPath) => {
  const cleanedText = text.replace(/"/g, '\\"');
  const piperCmd = \`echo "\${cleanedText}" | piper --model en_US-lessac-medium.onnx --output_file \${outputWavPath}\`;
  
  exec(piperCmd, (err) => {
    if (!err) playAudioFile(outputWavPath);
  });
};`
  },
  {
    id: "robotjs",
    name: "Keyboard & Mouse Automation",
    recommendedTool: "RobotJS",
    category: "control",
    categoryLabel: "OS Control & Files",
    description: "Enables native keyboard keystrokes, smooth mouse movements, and click event triggers under active node control.",
    feature: "Zero user interaction required, dials directly into desktop OS windows.",
    command: "npm install robotjs",
    sampleCode: `const robot = require('robotjs');

// Bring desktop window to focus and open utility programmatically
robot.setMouseDelay(2);
robot.setKeyboardDelay(10);

// Move to specified application coordinate
robot.moveMouseSmooth(240, 480);
robot.mouseClick();

// Send safe systemic keys to launch notepad
robot.keyTap("r", ["control", "alt"]); 
robot.typeString("notepad.exe");
robot.keyTap("enter");`
  },
  {
    id: "pyautogui",
    name: "Cross-Platform Macro GUI",
    recommendedTool: "PyAutoGUI & PyWin32",
    category: "control",
    categoryLabel: "OS Control & Files",
    description: "Highly stable Python desktop control system featuring precise window placement and fallback hotkey bindings.",
    feature: "Advanced failsafes, supports direct Windows assembly handles via HWND parsing.",
    command: "pip install pyautogui pywin32",
    sampleCode: `import pyautogui
import win32gui, win32con

# Python wrapper to center a targeted application window
def center_active_window(window_title):
    hwnd = win32gui.FindWindow(None, window_title)
    if hwnd:
        win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
        win32gui.SetForegroundWindow(hwnd)
        # Force mouse center click
        rect = win32gui.GetWindowRect(hwnd)
        x = (rect[0] + rect[2]) // 2
        y = (rect[1] + rect[3]) // 2
        pyautogui.click(x, y)`
  },
  {
    id: "chokidar",
    name: "Filesystem Watcher Daemon",
    recommendedTool: "Chokidar Watcher",
    category: "control",
    categoryLabel: "OS Control & Files",
    description: "Optimal filesystem event sensor monitoring user folders for downloaded spreadsheets, PDFs, or configurations.",
    feature: "Reliably handles native file locking, recursive directory tracking, and node symlinks.",
    command: "npm install chokidar",
    sampleCode: `const chokidar = require('chokidar');

// Establish watcher for downloaded user resources
const watcher = chokidar.watch('C:/Users/Downloads', {
  ignored: /(^|[\\/])\\../, // ignore dotfiles
  persistent: true
});

watcher.on('add', (filePath) => {
  console.log(\`[Agent Sensor] New User resource picked up: \${filePath}\`);
  // Automatically queue AI Summarization pipeline
  triggerAgentSummarization(filePath);
});`
  },
  {
    id: "playwright",
    name: "Stealth Browser Automation",
    recommendedTool: "Playwright",
    category: "scraping",
    categoryLabel: "Browser & Scraping",
    description: "Automates search sessions, crawls complex tables, and signs into personal directories using secure system credentials.",
    feature: "Handles dynamic JavaScript, cookies storage, and shadow DOM elements cleanly.",
    command: "npm install playwright",
    sampleCode: `const { chromium } = require('playwright');

const scrapeSecureSession = async (searchQuery) => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://duckduckgo.com');
  await page.fill('input[name="q"]', searchQuery);
  await page.press('input[name="q"]', 'Enter');
  
  // Wait to load search telemetry nodes
  await page.waitForSelector('.react-results--main');
  const results = await page.locator('.result__title').allTextContents();
  
  await browser.close();
  return results;
};`
  },
  {
    id: "gmail",
    name: "Mail & Calendaring",
    recommendedTool: "Gmail & Google Calendar API",
    category: "integrations",
    categoryLabel: "Integrations & Docs",
    description: "Secures real OAuth login access to synchronize calendars, map schedules, and safely dispatch alerts.",
    feature: "Comprehensive official validation, granular user OAuth permission limits.",
    command: "npm install googleapis",
    sampleCode: `const { google } = require('googleapis');

// Synchronize next corporate team event session
const scheduleMeeting = async (auth) => {
  const calendar = google.calendar({ version: 'v3', auth });
  const event = {
    summary: 'TaskPilot Automation Cycle',
    description: 'System-triggered automatic database schema sync',
    start: { dateTime: '2026-06-15T10:00:00-07:00' },
    end: { dateTime: '2026-06-15T11:00:00-07:00' }
  };
  
  const created = await calendar.events.insert({ calendarId: 'primary', resource: event });
  return created.data;
};`
  },
  {
    id: "tesseract",
    name: "Screen Intelligence & OCR",
    recommendedTool: "Tesseract OCR & OpenCV",
    category: "scraping",
    categoryLabel: "Browser & Scraping",
    description: "Parses system active windows, detects button layout grids, and extracts tabular texts from live screenshots.",
    feature: "Real-time edge analysis, coordinate detection for instant mouse mapping.",
    command: "npm install tesseract.js",
    sampleCode: `const Tesseract = require('tesseract.js');

// Read screen text coordinate details
const readActiveScreenRegion = async (imageBuffer) => {
  const result = await Tesseract.recognize(
    imageBuffer,
    'eng',
    { logger: m => console.log('OCR status packet:', m) }
  );
  
  // Extract parsed paragraph text lines
  console.log("Extracted Sandbox Text:", result.data.text);
  return result.data.text;
};`
  },
  {
    id: "sqlite",
    name: "Local State Persistence",
    recommendedTool: "SQLite3 (Drizzle ORM)",
    category: "infra",
    categoryLabel: "Logs, DB & Infra",
    description: "Highly robust, lightweight, zero-configuration local embedded database engine to archive histories and tasks.",
    feature: "Instant query execution speeds, no host daemon installation blockages.",
    command: "npm install sqlite3 drizzle-orm",
    sampleCode: `const sqlite3 = require('sqlite3').verbose();
const dbName = 'taskpilot_agent.db';

// Establish system audit table schemas
const db = new sqlite3.Database(dbName, (err) => {
  if (!err) {
    db.run(\`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        action TEXT,
        status TEXT
      )
    \`);
  }
});`
  },
  {
    id: "n8n",
    name: "Automated Workflows Core",
    recommendedTool: "n8n (Self-Hosted Model)",
    category: "infra",
    categoryLabel: "Logs, DB & Infra",
    description: "Bridges user events with hundreds of webhooks, web services, and systems through custom node connectors.",
    feature: "Highly intuitive visual editor, secure isolated offline docker hosting.",
    command: "npx n8n start",
    sampleCode: `// standard JSON webhook payload dispatched to n8n triggers:
const triggerN8nWorkflow = async (taskPayload) => {
  const hookUrl = "http://localhost:5678/webhook/trigger-task";
  const res = await fetch(hookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentStatus: "ACTIVE",
      timestamp: Date.now(),
      taskDetails: taskPayload
    })
  });
  return res.status === 200;
};`
  }
];

export default function DeveloperKit({ devFiles }: DeveloperKitProps) {
  const [activeTab, setActiveTab] = useState<"code" | "stack">("stack");
  const [selectedFile, setSelectedFile] = useState<DeveloperFile>(devFiles[0] || null);
  const [copied, setCopied] = useState(false);
  const [copiedStackId, setCopiedStackId] = useState<string | null>(null);
  
  // Free Stack filter states
  const [stackSearch, setStackSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedToolItem, setSelectedToolItem] = useState<StackTool>(PILOT_MVP_STACK[0]);

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyStackCode = (tool: StackTool, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tool.sampleCode);
    setCopiedStackId(tool.id);
    setTimeout(() => setCopiedStackId(null), 2000);
  };

  // Filter tech stack logic
  const filteredStack = PILOT_MVP_STACK.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(stackSearch.toLowerCase()) ||
                          item.recommendedTool.toLowerCase().includes(stackSearch.toLowerCase()) ||
                          item.description.toLowerCase().includes(stackSearch.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-5 h-full font-sans text-xs text-slate-300">
      
      {/* Navigation Headers with dual mode toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#161920] border border-slate-800/50 p-4 rounded-xl shadow-md">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-blue-500" />
            TaskAgent System Engineering Center
          </h2>
          <p className="text-[10px] text-slate-400">Review deployment blueprints and build recipes for local system integration</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-[#0A0B0E] p-1 rounded-lg border border-slate-800/60 shrink-0 self-end sm:self-auto">
          <button 
            onClick={() => setActiveTab("stack")}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition ${
              activeTab === "stack" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            MVP Free Stack Blueprint
          </button>
          <button 
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition ${
              activeTab === "code" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Desktop Code explorer
          </button>
        </div>
      </div>

      {/* RENDER VIEW 1: OPEN SOURCE MVP TECH STACK INTERACTIVE BOARD */}
      {activeTab === "stack" && (
        <div className="flex flex-col xl:flex-row gap-5 h-full min-h-0">
          
          {/* Left panel: Filters, categories & list of tools */}
          <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-4">
            
            {/* Search and general category selectors */}
            <div className="p-4 bg-[#161920] border border-slate-800/40 rounded-xl space-y-3.5">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input 
                  type="text"
                  placeholder="Query modules (e.g. Ollama)..."
                  value={stackSearch}
                  onChange={(e) => setStackSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-[#0A0B0E] border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/80 transition"
                />
              </div>

              {/* Grid categories select */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">Stack Sectors</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button 
                    onClick={() => setSelectedCategory("all")}
                    className={`px-2 py-1.5 rounded text-[10px] font-semibold text-center truncate ${
                      selectedCategory === "all" ? "bg-blue-600/15 border border-blue-500/40 text-blue-300" : "bg-[#0A0B0E] border border-transparent hover:bg-[#111319] hover:border-slate-800 text-slate-400"
                    }`}
                  >
                    All Sectors
                  </button>
                  <button 
                    onClick={() => setSelectedCategory("ai")}
                    className={`px-2 py-1.5 rounded text-[10px] font-semibold text-center truncate ${
                      selectedCategory === "ai" ? "bg-blue-600/15 border border-blue-500/40 text-blue-300" : "bg-[#0A0B0E] border border-transparent hover:bg-[#111319] hover:border-slate-800 text-slate-400"
                    }`}
                  >
                    AI/Planning
                  </button>
                  <button 
                    onClick={() => setSelectedCategory("voice")}
                    className={`px-2 py-1.5 rounded text-[10px] font-semibold text-center truncate ${
                      selectedCategory === "voice" ? "bg-blue-600/15 border border-blue-500/40 text-blue-300" : "bg-[#0A0B0E] border border-transparent hover:bg-[#111319] hover:border-slate-800 text-slate-400"
                    }`}
                  >
                    Voice/Audio
                  </button>
                  <button 
                    onClick={() => setSelectedCategory("control")}
                    className={`px-2 py-1.5 rounded text-[10px] font-semibold text-center truncate ${
                      selectedCategory === "control" ? "bg-blue-600/15 border border-blue-500/40 text-blue-300" : "bg-[#0A0B0E] border border-transparent hover:bg-[#111319] hover:border-slate-800 text-slate-400"
                    }`}
                  >
                    OS Control
                  </button>
                  <button 
                    onClick={() => setSelectedCategory("scraping")}
                    className={`px-2 py-1.5 rounded text-[10px] font-semibold text-center truncate ${
                      selectedCategory === "scraping" ? "bg-blue-600/15 border border-blue-500/40 text-blue-300" : "bg-[#0A0B0E] border border-transparent hover:bg-[#111319] hover:border-slate-800 text-slate-400"
                    }`}
                  >
                    Vision/Scrape
                  </button>
                  <button 
                    onClick={() => setSelectedCategory("infra")}
                    className={`px-2 py-1.5 rounded text-[10px] font-semibold text-center truncate ${
                      selectedCategory === "infra" ? "bg-blue-600/15 border border-blue-500/40 text-blue-300" : "bg-[#0A0B0E] border border-transparent hover:bg-[#111319] hover:border-slate-800 text-slate-400"
                    }`}
                  >
                    DB / Infra
                  </button>
                </div>
              </div>
            </div>

            {/* List of filtered tools */}
            <div className="flex-1 bg-[#161920] border border-slate-800/40 rounded-xl p-3 flex flex-col min-h-[220px] max-h-[460px] overflow-auto">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2 px-1">Selected Frameworks ({filteredStack.length})</span>
              <div className="space-y-1.5 flex-1 overflow-y-auto">
                {filteredStack.map((tool) => {
                  const isSelected = selectedToolItem.id === tool.id;
                  return (
                    <div
                      key={tool.id}
                      onClick={() => setSelectedToolItem(tool)}
                      className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer flex flex-col gap-1 ${
                        isSelected 
                          ? "bg-blue-600/10 border-blue-500/50 text-slate-100" 
                          : "bg-[#0A0B0E]/60 border-slate-850/40 text-slate-400 hover:text-slate-200 hover:bg-[#0A0B0E]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] truncate tracking-wide text-white">{tool.name}</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono scale-90">{tool.categoryLabel}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 font-medium">
                        <Play className="w-2.5 h-2.5" />
                        <span>{tool.recommendedTool}</span>
                      </div>
                    </div>
                  );
                })}
                {filteredStack.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No tools match search parameters.
                  </div>
                )}
              </div>
            </div>
            
          </div>

          {/* Right Main panel: Code Integration detail view for Selected Stack tool */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#161920] border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl">
            
            {/* Header portion */}
            <div className="p-4 bg-[#0A0B0E] border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-blue-600/15 text-blue-400 uppercase font-mono tracking-wider border border-blue-500/20">
                    {selectedToolItem.categoryLabel}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">Blueprint ID: {selectedToolItem.id}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-100 mt-1 flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#5FCEFF]" />
                  {selectedToolItem.name} — <span className="text-cyan-400">{selectedToolItem.recommendedTool}</span>
                </h3>
              </div>

              {/* Install cmd */}
              <div className="flex items-center gap-2 bg-[#161920] border border-slate-800/80 px-3 py-1.5 rounded-lg max-w-sm shrink-0">
                <span className="text-[10px] text-amber-500 font-mono truncate select-all">{selectedToolItem.command}</span>
                <button 
                  onClick={(e) => {
                    navigator.clipboard.writeText(selectedToolItem.command);
                    setCopiedStackId(selectedToolItem.id + "_cmd");
                    setTimeout(() => setCopiedStackId(null), 2000);
                  }}
                  className="hover:text-white transition shrink-0 p-1 bg-[#0A0B0E] rounded border border-slate-850"
                  title="Copy terminal command"
                >
                  {copiedStackId === selectedToolItem.id + "_cmd" ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Main scrollable grid area for analysis */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              
              {/* Detailed grid parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#0A0B0E]/60 border border-slate-800/60 rounded-xl space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> Architectural Role
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{selectedToolItem.description}</p>
                </div>
                
                <div className="p-3.5 bg-[#0A0B0E]/60 border border-slate-800/60 rounded-xl space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Advantage & Failsafes
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{selectedToolItem.feature}</p>
                </div>
              </div>

              {/* Code code editor layout */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#a0afca]">System Integration Recipe</span>
                  <button
                    onClick={(e) => handleCopyStackCode(selectedToolItem, e)}
                    className="px-2.5 py-1 text-[10px] bg-[#0A0B0E] border border-slate-800 rounded flex items-center gap-1 hover:text-white transition font-medium"
                  >
                    {copiedStackId === selectedToolItem.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copied Recipe!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Recipe
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-[#0A0B0E] rounded-xl border border-slate-800/80 p-4 font-mono text-[11px] overflow-x-auto leading-relaxed text-blue-100 select-all min-h-[160px] max-h-[300px]">
                  <pre className="font-mono whitespace-pre bg-transparent p-0">
                    <code>{selectedToolItem.sampleCode}</code>
                  </pre>
                </div>
              </div>

            </div>

            {/* Orchestration pipeline visual */}
            <div className="p-4 bg-[#0A0B0E]/80 border-t border-slate-800/40">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                Active Local Desktop Pipeline Topology (100% Free / Private)
              </h4>
              <div className="flex flex-col md:flex-row items-center justify-around gap-2 py-1.5 text-slate-400 text-[10px]">
                <div className="flex items-center gap-2 bg-[#161920] border border-slate-800 px-3 py-2 rounded-lg w-full md:w-auto justify-center">
                  <AppWindow className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="text-center">
                    <span className="block font-bold text-slate-200">Local Electron + React</span>
                    <span className="text-[9px] text-slate-500">Native UI Shell & Sandbox</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-700 hidden md:block" />
                <div className="flex items-center gap-2 bg-[#161920] border border-slate-800 px-3 py-2 rounded-lg w-full md:w-auto justify-center">
                  <Brain className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-center">
                    <span className="block font-bold text-slate-200">Ollama / Llama3</span>
                    <span className="text-[9px] text-slate-500">Local Reasoning Brain</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-700 hidden md:block" />
                <div className="flex items-center gap-2 bg-[#161920] border border-slate-800 px-3 py-2 rounded-lg w-full md:w-auto justify-center">
                  <Keyboard className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="text-center">
                    <span className="block font-bold text-slate-200">RobotJS & Playwright</span>
                    <span className="text-[9px] text-slate-500">Automated Browser & Keys</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-700 hidden md:block" />
                <div className="flex items-center gap-2 bg-[#161920] border border-slate-800 px-3 py-2 rounded-lg w-full md:w-auto justify-center">
                  <Database className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="text-center">
                    <span className="block font-bold text-slate-200">SQLite Log Records</span>
                    <span className="text-[9px] text-slate-500">Encrypted Local Storage</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* RENDER VIEW 2: ORIGINAL LOCAL REPOSITORY DIRECTORY EXPLORER */}
      {activeTab === "code" && (
        <div className="flex flex-col lg:flex-row gap-5 h-full min-h-0">
          
          {/* File Navigation sidebar */}
          <div className="w-full lg:w-[260px] shrink-0 space-y-4">
            
            {/* Architecture Checklist Card */}
            <div className="p-3.5 bg-[#161920] border border-slate-800/50 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <FolderGit className="w-4 h-4 text-blue-500" />
                Desktop Repository
              </h3>
              <p className="text-[10px] text-[#a0afca] leading-normal font-sans">
                Real cross-platform IPC hooks and AI logic used to package TaskPilot AI into a single <code className="text-amber-500 font-mono">.exe</code> installer.
              </p>

              <div className="space-y-1.5 pt-1.5 border-t border-slate-800/60 max-h-[300px] overflow-y-auto">
                {devFiles.map((file) => {
                  const isSelected = selectedFile?.name === file.name;
                  return (
                    <button
                      key={file.name}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center gap-2 transition ${
                        isSelected
                          ? "bg-blue-600/10 border-l-2 border-blue-500 text-blue-200"
                          : "text-slate-400 hover:text-[#5FCEFF]/90 hover:bg-[#0A0B0E]/40"
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 text-blue-450 shrink-0" />
                      <span className="truncate font-mono text-[11px]">{file.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Local Ollama / AI Server parameters */}
            <div className="p-3.5 bg-[#161920] border border-slate-800/50 rounded-xl space-y-3.5">
              <h4 className="text-[11px] font-bold text-blue-450 uppercase tracking-widest flex items-center gap-1.5 font-sans animate-pulse">
                <Server className="w-3.5 h-3.5 text-blue-550" /> Ollama Integration
              </h4>
              <div className="text-[10px] text-slate-400 space-y-2 leading-relaxed font-sans">
                <p>
                  To process commands offline, TaskPilot dials native LLaMA 3 models locally:
                </p>
                <div className="bg-[#0A0B0E] p-2 rounded border border-slate-800/60 font-mono text-[9px] text-amber-500 line-clamp-2 select-all leading-normal">
                  {"# curl http://localhost:11434/api/generate -d '{\"model\": \"llama3\", \"prompt\": \"Why is sky blue\"}'"}
                </div>
              </div>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#161920] border border-slate-800/50 rounded-xl overflow-hidden shadow-xl">
            {selectedFile ? (
              <div className="flex-1 flex flex-col h-full min-h-[380px]">
                {/* Header detail */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0B0E] border-b border-slate-800/50">
                  <div className="font-sans">
                    <span className="text-[10px] text-blue-400 font-mono tracking-wider font-semibold">
                      Target Integration File - {selectedFile.path}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-300 mt-0.5 truncate max-w-sm sm:max-w-md lg:max-w-lg">
                      {selectedFile.description}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-350 bg-[#161920] hover:bg-[#111319] border border-slate-800/80 rounded-md transition font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                {/* Code Body */}
                <div className="flex-1 p-4 overflow-auto font-mono text-[11px] leading-relaxed bg-[#0A0B0E]/65 text-slate-300 select-all min-h-[300px]">
                  <pre className="font-mono bg-transparent border-none p-0 leading-normal whitespace-pre">
                    <code>{selectedFile.code}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-10 text-slate-500 font-sans">
                Select a target code resource inside the sidebar to review integration.
              </div>
            )}

            {/* EXE PACKAGING DEPLOYMENT STEP-BY-STEP GUIDE */}
            <div className="p-4 bg-[#0A0B0E] border-t border-slate-800/40 space-y-3 font-sans">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                <Terminal className="w-3.5 h-3.5 text-blue-500" />
                EXE Packaging Deployment Guide (Windows Native Setup)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] text-slate-400">
                <div className="p-2.5 bg-[#161920]/80 border border-slate-800/60 rounded">
                  <div className="flex items-center gap-1.5 text-slate-200 font-semibold mb-1">
                    <span className="bg-[#0A0B0E] px-1 py-0.5 text-blue-400 rounded border border-slate-800/40">01</span> Setup Electron Node Core
                  </div>
                  Build React files, then bundle inside electron package directories. Invoke <code className="text-amber-500">npm inst</code> to resolve root dependencies.
                </div>

                <div className="p-2.5 bg-[#161920]/80 border border-slate-800/60 rounded">
                  <div className="flex items-center gap-1.5 text-slate-200 font-semibold mb-1">
                    <span className="bg-[#0A0B0E] px-1 py-0.5 text-blue-400 rounded border border-slate-800/40">02</span> Secure Automation IPC
                  </div>
                  Command requests dial IPC handlers. Local node servers bridge standard processes like PowerShell commands within system control parameters.
                </div>

                <div className="p-2.5 bg-[#161920]/80 border border-slate-800/60 rounded">
                  <div className="flex items-center gap-1.5 text-slate-200 font-semibold mb-1">
                    <span className="bg-[#0A0B0E] px-1 py-0.5 text-blue-400 rounded border border-slate-800/40">03</span> electron-builder Bundles EXE
                  </div>
                  Configure <code className="text-amber-500">package.json</code> and run <code className="text-amber-500">npm run build</code>. Builds TaskPilotAI Setup.exe in destination packages.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
