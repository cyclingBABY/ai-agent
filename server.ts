import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { DiskFile, TaskStep, TaskPlan, SystemState, Workflow, HistoryItem, DeveloperFile } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Global In-Memory Simulator Database
let lastActionTime = 0;
let commandsAnalyzedCount = 5;
let stepsExecutedCount = 12;

let systemState: SystemState = {
  volume: 68,
  brightness: 85,
  currentApp: "Desktop",
  openedUrl: "https://www.google.com",
  isSleeping: false,
  isLocked: false,
  lastScreenshotTime: null,
  screenshotContent: null,
  ocrDetectedText: []
};

let fileSystem: DiskFile[] = [
  {
    name: "Documents",
    path: "/Documents",
    type: "directory",
    children: [
      {
        name: "meeting_notes.txt",
        path: "/Documents/meeting_notes.txt",
        type: "file",
        size: "1.2 KB",
        content: "--- TaskPilot AI Project Sync ---\n\nGoals for today:\n1. Establish robust cross-platform system interaction protocols.\n2. Standardize structured agent output and planner configurations.\n3. Implement a fail-safe security confirmation dialog before deletes.\n4. Design intuitive workflow routine modules."
      },
      {
        name: "marketing_strategy.docx",
        path: "/Documents/marketing_strategy.docx",
        type: "file",
        size: "3.4 MB",
        content: "[Binary Document Data: Quarter 3 expansion plan through tech partnerships and direct assistant marketing channels.]"
      }
    ]
  },
  {
    name: "Downloads",
    path: "/Downloads",
    type: "directory",
    children: [
      {
        name: "receipt_3049.pdf",
        path: "/Downloads/receipt_3049.pdf",
        type: "file",
        size: "245 KB",
        content: "[PDF Meta: Payment to OpenAI & Google Cloud services. Amount: $45.20. Status: Paid.]"
      },
      {
        name: "unorganized_screenshot.png",
        path: "/Downloads/unorganized_screenshot.png",
        type: "file",
        size: "1.8 MB",
        content: "SIMULATED_SCREENSHOT_DATA"
      },
      {
        name: "temp_cache_old.log",
        path: "/Downloads/temp_cache_old.log",
        type: "file",
        size: "4 KB",
        content: "2026-06-12 11:24:01 INFO System start\n2026-06-12 11:24:59 WARN HMR socket connection failure\n2026-06-12 11:25:35 ERROR Connection timed out."
      }
    ]
  },
  {
    name: "Desktop",
    path: "/Desktop",
    type: "directory",
    children: [
      {
        name: "TaskPilotAI_Setup.exe",
        path: "/Desktop/TaskPilotAI_Setup.exe",
        type: "file",
        size: "82 MB",
        content: "INSTALLER_DIST"
      },
      {
        name: "ProjectNotes.md",
        path: "/Desktop/ProjectNotes.md",
        type: "file",
        size: "420 B",
        content: "# Developer Checklist\n\n- [x] Configure Electron IPC bridges\n- [ ] Integrate local Whisper mic streams\n- [ ] Connect Ollama model fallbacks\n- [ ] Draft system commands for windows shells"
      }
    ]
  },
  {
    name: "Reports",
    path: "/Reports",
    type: "directory",
    children: []
  }
];

let tasksHistory: HistoryItem[] = [
  {
    id: "hist-1",
    timestamp: "2026-06-15T01:30:00Z",
    command: "Open Chrome and look up AI news",
    status: "success",
    stepsCount: 2,
    details: "Launched Google Chrome successfully and searched for AI News. Extracted top articles on Gemini 3.5."
  },
  {
    id: "hist-2",
    timestamp: "2026-06-15T02:15:00Z",
    command: "Create folder Reports and clean old caches",
    status: "success",
    stepsCount: 3,
    details: "Checked directories, verified 'Reports' exists, and cleared temp logs in Downloads folder."
  }
];

let workflowList: Workflow[] = [
  {
    id: "workflow-morning",
    name: "Morning Routine",
    description: "Launch email, communication tools, music, and check daily task drafts.",
    icon: "Coffee",
    steps: [
      { id: "ws-1", name: "Launch Email", action: "open_app", target: "Outlook Email" },
      { id: "ws-2", name: "Open Teams", action: "open_app", target: "Microsoft Teams" },
      { id: "ws-3", name: "Launch Spotify", action: "open_app", target: "Spotify Music" },
      { id: "ws-4", name: "Open Board", action: "browser_action", target: "https://github.com/orgs/workspace/boards" }
    ]
  },
  {
    id: "workflow-code",
    name: "Development Mode",
    description: "Initialize workspace, command terminal, IDE, and project tracker.",
    icon: "Terminal",
    steps: [
      { id: "ws-5", name: "Launch VS Code", action: "open_app", target: "VS Code" },
      { id: "ws-6", name: "Open Project Folder", action: "manage_files", target: "/Desktop/ProjectNotes.md" },
      { id: "ws-7", name: "Launch Command Prompt", action: "open_app", target: "Windows Power Shell" }
    ]
  }
];

// Developer kit content for real Desktop Application deployment (Electron + Tauri)
const developerFiles: DeveloperFile[] = [
  {
    name: "package.json",
    path: "app/package.json",
    language: "json",
    description: "Electron application dependencies, build guidelines, and scripts configuration.",
    code: `{
  "name": "taskpilot-desktop",
  "version": "1.0.0",
  "main": "main.js",
  "description": "TaskPilot AI cross-platform system assistant package.",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder build --windows"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "sqlite3": "^5.1.7",
    "ws": "^8.18.0"
  },
  "devDependencies": {
    "electron": "^30.0.0",
    "electron-builder": "^24.13.3"
  }
}`
  },
  {
    name: "main.js",
    path: "app/main.js",
    language: "javascript",
    description: "Electron Main Process. Boots up windows, starts background service, registers IPC channels, and hooks system events.",
    code: `const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backgroundAgentProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the React client dist or dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Start local background Agent Server node process
function startAgentService() {
  const agentPath = path.join(__dirname, 'agent/local-server.js');
  backgroundAgentProcess = spawn('node', [agentPath], {
    env: { ...process.env, PORT: '4500' }
  });

  backgroundAgentProcess.stdout.on('data', (data) => {
    console.log(\`[Agent Engine]: \${data}\`);
  });

  backgroundAgentProcess.stderr.on('data', (data) => {
    console.error(\`[Agent Error]: \${data}\`);
  });
}

app.whenReady().then(() => {
  startAgentService();
  createWindow();

  // Global hotkey: Alt + Space toggles TaskPilot floating window
  globalShortcut.register('Alt+Space', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Graceful exit of the child agent process
  if (backgroundAgentProcess) {
    backgroundAgentProcess.kill();
  }
  globalShortcut.unregisterAll();
});

// IPC communication bridges for automated desktop actions
ipcMain.handle('get-system-state', async () => {
  return { platform: process.platform, arch: process.arch };
});
`
  },
  {
    name: "preload.js",
    path: "app/preload.js",
    language: "javascript",
    description: "Electron preload script exposing secure IPC bridge API to the React UI window.",
    code: `const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('taskpilotAPI', {
  getSystemState: () => ipcRenderer.invoke('get-system-state'),
  onShortcutTriggered: (callback) => ipcRenderer.on('shortcut-toggled', callback),
  sendVoiceCommand: (audioBuffer) => ipcRenderer.invoke('send-voice', audioBuffer)
});
`
  },
  {
    name: "windows-control.js",
    path: "automation/windows-control.js",
    language: "javascript",
    description: "Executes localized Operating System script triggers through PowerShell & native modules.",
    code: `const { exec } = require('child_process');

/**
 * Automates Windows core settings via direct CLI or PowerShell commands.
 */
class WindowsAutomationUnit {
  static openApplication(appName) {
    return new Promise((resolve, reject) => {
      // Find and start application
      const cmd = \`start "" "\${appName}"\`;
      exec(cmd, (err) => {
        if (err) return reject(err);
        resolve(\`Successfully sent signal to launch: \${appName}\`);
      });
    });
  }

  static lockWorkstation() {
    return new Promise((resolve, reject) => {
      const rundll = 'rundll32.exe user32.dll,LockWorkStation';
      exec(rundll, (err) => {
        if (err) return reject(err);
        resolve('Workstation locked');
      });
    });
  }

  static setVolume(level) {
    return new Promise((resolve, reject) => {
      // Scale is 0 to 100
      const winVolumePowerShell = \`(Get-WmiObject -Query "Select * from PlaybackDevice Where Active=True").SetVolume(\${level})\`;
      exec(\`powershell -Command "\${winVolumePowerShell}"\`, (err) => {
        // Fallback or secondary command
        const fallbackCmd = \`npx -y sound-cli volume \${level / 100}\`;
        exec(fallbackCmd, (fallbackErr) => {
          resolve(\`Volume adjusted to \${level}%\`);
        });
      });
    });
  }

  static captureScreen() {
    return new Promise((resolve, reject) => {
      const powershellScreenCap = \`
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$Screen = [System.Windows.Forms.SystemScreen]::PrimaryScreen
$Width   = $Screen.Bounds.Width
$Height  = $Screen.Bounds.Height
$Bitmap  = New-Object System.Drawing.Bitmap $Width, $Height
$Graphic = [System.Drawing.Graphics]::FromImage($Bitmap)
$Graphic.CopyFromScreen($Screen.Bounds.X, $Screen.Bounds.Y, 0, 0, $Bitmap.Size)
$Bitmap.Save("$env:TEMP\\taskpilot_screen.png", [System.Drawing.Imaging.ImageFormat]::Png)
$Graphic.Dispose()
$Bitmap.Dispose()
\`;
      exec(\`powershell -Command "\${powershellScreenCap}"\`, (err) => {
        if (err) return reject(err);
        resolve(\`Screenshot captured in temp path.\`);
      });
    });
  }
}

module.exports = WindowsAutomationUnit;
`
  },
  {
    name: "planner.js",
    path: "agent/planner.js",
    language: "javascript",
    description: "The core AI reasoning Planner module that breaks down user messages, runs verification, and avoids direct unsafe system calls.",
    code: `class TaskPlannerAgent {
  constructor(aiModel) {
    this.ai = aiModel;
  }

  async parseInstruction(promptText) {
    const rawInstruction = promptText.trim();
    const systemPrompt = \`You are the core Planner agent for TaskPilot AI.
Your job is to parse the user's desktop command into sequential, executable OS automation actions.
Each action must have clear safety levels.
If the command involves sensitive operations (deleting folder, system shutdown, sending mail, web signups), you MUST mark security clearance 'requiresApproval: true'.\`;

    try {
      const gResult = await this.ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: rawInstruction,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });
      
      return JSON.parse(gResult.text);
    } catch (e) {
      console.warn("AI generation error, loading local script heuristic fallback", e);
      return this.localHeuristicParser(rawInstruction);
    }
  }

  localHeuristicParser(command) {
    const cleanLower = command.toLowerCase();
    const steps = [];

    if (cleanLower.includes("chrome") || cleanLower.includes("website") || cleanLower.includes("open")) {
      steps.push({
        id: "step-1",
        action: "open_app",
        target: "Chrome Browser",
        details: "Launch web browser process",
        requiresApproval: false,
        explanation: "User requested browser initialization."
      });
    }

    return {
      originalCommand: command,
      reasoning: "Structured via offline rule parsing fallbacks.",
      steps
    };
  }
}

module.exports = TaskPlannerAgent;
`
  }
];

// Helper to find a file model in simulation tree by path
function findFileByPath(tree: DiskFile[], filePath: string): { parent: DiskFile[]; item: DiskFile; index: number } | null {
  const parts = filePath.split("/").filter(Boolean);
  let currentTree: DiskFile[] = tree;
  let currentParentList: DiskFile[] = tree;
  let foundItem: DiskFile | null = null;
  let foundIndex = -1;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const index = currentTree.findIndex(item => item.name === part);
    if (index === -1) return null;
    
    const item = currentTree[index];
    if (i === parts.length - 1) {
      foundItem = item;
      foundIndex = index;
      currentParentList = currentTree;
    } else if (item.children) {
      currentTree = item.children;
    } else {
      return null;
    }
  }

  if (foundItem) {
    return { parent: currentParentList, item: foundItem, index: foundIndex };
  }
  return null;
}

// Add a file helper to simulation tree
function addFileToPath(tree: DiskFile[], parentPath: string, newFile: DiskFile): boolean {
  if (parentPath === "/" || parentPath === "") {
    tree.push(newFile);
    return true;
  }
  
  const search = findFileByPath(tree, parentPath);
  if (search && search.item.type === "directory") {
    if (!search.item.children) search.item.children = [];
    search.item.children.push(newFile);
    return true;
  }
  return false;
}

// REST APIs
app.get("/api/health", (req, res) => {
  const ticksCount = 15;
  const healthHistory = [];
  const now = Date.now();

  for (let i = ticksCount - 1; i >= 0; i--) {
    const tickTime = now - i * 1500; // 1.5 seconds intervals
    const isMainSpike = (now - lastActionTime) < 5000;
    
    const timeSec = tickTime / 1000;
    
    // CPU base load fluctuates between 15% and 25% under normal operation
    let baseCpu = 18 + Math.sin(timeSec / 10) * 5 + (timeSec % 3 === 0 ? 3 : -2);
    let baseCpuAgent = 4 + Math.cos(timeSec / 15) * 1.5;
    
    // Action spike within this range
    const isActionTick = (lastActionTime > 0) && (tickTime >= lastActionTime - 1000) && (tickTime <= lastActionTime + 3500);
    if (isActionTick) {
      baseCpu += 40 + Math.random() * 15;
      baseCpuAgent += 25 + Math.random() * 10;
    } else if (isMainSpike && i === ticksCount - 1) {
      baseCpu += 52;
      baseCpuAgent += 30;
    }

    baseCpu = Math.min(Math.max(Math.round(baseCpu * 10) / 10, 5), 100);
    baseCpuAgent = Math.min(Math.max(Math.round(baseCpuAgent * 10) / 10, 1), baseCpu);
    const baseCpuSys = Math.round((baseCpu - baseCpuAgent) * 10) / 10;

    // RAM usage slightly adjusts
    const totalRam = 16; // GB
    let baseRamGB = 5.2 + Math.sin(timeSec / 30) * 0.15;
    if (isMainSpike) {
      baseRamGB += 0.4;
    }
    const ramPercent = Math.min(Math.max(Math.round((baseRamGB / totalRam) * 1000) / 10, 10), 100);

    // Disk usage (based on files count or static)
    const totalDisk = 512; // GB
    const staticBaseDisk = 184.2; // GB
    
    const countFiles = (items: DiskFile[]): number => {
      let count = 0;
      for (const item of items) {
        if (item.type === "file") count++;
        else if (item.children) count += countFiles(item.children);
      }
      return count;
    };
    const totalFiles = countFiles(fileSystem);
    const actualDiskGB = staticBaseDisk + totalFiles * 0.45;
    const diskPercent = Math.round((actualDiskGB / totalDisk) * 1000) / 10;

    // network throughput
    let netIn = 1.2 + Math.sin(timeSec / 4) * 0.8;
    let netOut = 0.4 + Math.cos(timeSec / 5) * 0.3;
    if (isActionTick) {
      netIn += 184.5;
      netOut += 24.1;
    } else if (isMainSpike && i === ticksCount - 1) {
      netIn += 240.2;
      netOut += 45.8;
    }
    netIn = Math.round(Math.max(netIn, 0.1) * 10) / 10;
    netOut = Math.round(Math.max(netOut, 0.1) * 10) / 10;

    healthHistory.push({
      timeLabel: new Date(tickTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      timestamp: tickTime,
      cpu: baseCpu,
      cpuAgent: baseCpuAgent,
      cpuSystem: baseCpuSys,
      ram: ramPercent,
      ramUsed: Math.round(baseRamGB * 10) / 10,
      ramTotal: totalRam,
      disk: diskPercent,
      diskUsed: Math.round(actualDiskGB * 10) / 10,
      diskTotal: totalDisk,
      networkIn: netIn,
      networkOut: netOut,
      latency: Math.round((isMainSpike ? 1120 + Math.random() * 300 : 450 + Math.random() * 100)),
    });
  }

  res.json({
    history: healthHistory,
    current: healthHistory[healthHistory.length - 1],
    commandsAnalyzed: commandsAnalyzedCount,
    stepsExecuted: stepsExecutedCount,
    lastActionTimestamp: lastActionTime,
    environmentMode: process.env.NODE_ENV || "development",
    ollamaStatus: lastActionTime > 0 && (now - lastActionTime < 4000) ? "INFERENCE_RUNNING" : "STANDBY"
  });
});

app.get("/api/state", (req, res) => {
  res.json({ systemState, fileSystem, tasksHistory });
});

app.post("/api/state/update", (req, res) => {
  const { volume, brightness, currentApp, openedUrl, isSleeping, isLocked } = req.body;
  if (volume !== undefined) systemState.volume = volume;
  if (brightness !== undefined) systemState.brightness = brightness;
  if (currentApp !== undefined) systemState.currentApp = currentApp;
  if (openedUrl !== undefined) systemState.openedUrl = openedUrl;
  if (isSleeping !== undefined) systemState.isSleeping = isSleeping;
  if (isLocked !== undefined) systemState.isLocked = isLocked;
  res.json({ success: true, systemState });
});

// Create Folder API
app.post("/api/file/create-folder", (req, res) => {
  const { parentPath, folderName } = req.body;
  if (!folderName) {
    return res.status(400).json({ error: "Missing folderName" });
  }

  const cleanParent = parentPath || "/";
  const fullPath = cleanParent === "/" ? `/${folderName}` : `${cleanParent}/${folderName}`;

  const exists = findFileByPath(fileSystem, fullPath);
  if (exists) {
    return res.status(400).json({ error: "Folder already exists" });
  }

  const newFolder: DiskFile = {
    name: folderName,
    path: fullPath,
    type: "directory",
    children: []
  };

  const success = addFileToPath(fileSystem, cleanParent, newFolder);
  if (success) {
    res.json({ success: true, fileSystem });
  } else {
    res.status(400).json({ error: "Parent directory not found" });
  }
});

// Delete File API
app.post("/api/file/delete", (req, res) => {
  const { filePath } = req.body;
  const search = findFileByPath(fileSystem, filePath);
  if (!search) {
    return res.status(404).json({ error: "File not found" });
  }

  search.parent.splice(search.index, 1);
  res.json({ success: true, fileSystem });
});

// OCR & Screen capture simulator
app.post("/api/state/screenshot", (req, res) => {
  systemState.lastScreenshotTime = new Date().toISOString();
  systemState.ocrDetectedText = [
    "TaskPilot AI v1.0 Production Tool",
    "Open Windows: Visual Studio Code, Google Chrome",
    "Active Document: meeting_notes.txt",
    "UI Elements: [Open File Button], [Compress Folder Trigger], [Settings Button]",
    "Volume: " + systemState.volume + "%, Brightness: " + systemState.brightness + "%"
  ];
  systemState.screenshotContent = "captured_desktop_viewport";
  res.json({ success: true, systemState });
});

// Get Developers Files
app.get("/api/dev/files", (req, res) => {
  res.json(developerFiles);
});

// Workflows REST endpoints
app.get("/api/workflows", (req, res) => {
  res.json(workflowList);
});

app.post("/api/workflows/save", (req, res) => {
  const { name, description, steps, icon } = req.body;
  const newWorkflow: Workflow = {
    id: `workflow-${Date.now()}`,
    name,
    description,
    steps: steps || [],
    icon: icon || "Activity"
  };
  workflowList.push(newWorkflow);
  res.json({ success: true, workflows: workflowList });
});

// CORE AGENT CONTROLLER (AI Command Parser using Gemini 3.5 Flash)
app.post("/api/agent/command", async (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: "State command parameters empty" });
  }

  // Update telemetry trackers for visual spikes
  lastActionTime = Date.now();
  commandsAnalyzedCount++;

  if (!ai) {
    // Dynamic Fallback in case Gemini Key is not supplied
    console.log("No Gemini API Key found. Resolving locally via custom semantic matching heuristics.");
    const fallbackPlan = generateFallbackPlan(command);
    return res.json({ plan: fallbackPlan, warning: "Local analysis run. Add Gemini API Key via AI Studio Secrets to unlock dynamic reasoning." });
  }

  try {
    const prompt = `System Prompt: Computer Control Agent

You are an AI Computer Control Agent running on a user's computer.

Your purpose is to help users perform tasks on their device by generating structured action plans that can be executed by the application's automation engine.

## Rules

1. Never directly execute actions.
2. Convert user requests into a step-by-step action plan.
3. Ask for confirmation before:

   * Deleting files
   * Modifying system settings
   * Sending emails
   * Installing software
   * Making purchases
   * Restarting or shutting down the computer
4. Always explain your intended actions.
5. If a task is ambiguous, ask clarifying questions.
6. Use the minimum actions necessary to complete the task.
7. Stop immediately if an action fails and report the error.

## Available Actions

You may use only these actions:

### Application Actions
- open_application (params: application)
- close_application (params: application)

### Browser Actions
- open_url (params: url)
- search_web (params: query)

### File Actions
- create_folder (params: path)
- move_file (params: source, destination)

### Document Actions
- create_document (params: type, title)

### System Actions
- set_volume (params: value)
- lock_computer (no params)

## Planning Format

Always return:
{
  "goal": "User goal",
  "steps": [
    {
      "action": "action_name",
      "parameters": {}
    }
  ],
  "confirmation_required": true or false
}

Convert user command "${command}" into this structured plan format.`;
    // Cleaned up old prompt instructions
// Deprecated prompt parts:
/*
/*
  "originalCommand": "original request here",
  "reasoning": "brief high level outline of actions planned to fulfill the prompt",
  "steps": [
    {
      "id": "step-1",
      "action": "open_app" | "close_app" | "manage_files" | "browser_action" | "system_control" | "ocr_understanding" | "custom_script",
      "status": "pending",
      "target": "name of target app, folder path, webpage URL, or parameter",
      "details": "detailed description of what TaskPilot should execute",
      "requiresApproval": true or false,
      "explanation": "why this action is part of the final outcome"
    }
  ]
}

CRITICAL Security Directive:
Set "requiresApproval": true if any step performs sensitive actions. Sensitive actions are defined as:
1. Deleting files or formatting directories.
2. Direct system operations (shutting down, locking workstation, rebooting system).
3. Accessing external APIs or sending raw script runs.
Set "requiresApproval": false for safe commands like opening browsers, navigating folders, raising volumes, simple screen reads, or launching MS Word.`;
*/

    const gResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            goal: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      application: { type: Type.STRING },
                      url: { type: Type.STRING },
                      query: { type: Type.STRING },
                      path: { type: Type.STRING },
                      source: { type: Type.STRING },
                      destination: { type: Type.STRING },
                      type: { type: Type.STRING },
                      title: { type: Type.STRING },
                      value: { type: Type.INTEGER }
                    }
                  }
                },
                required: ["action", "parameters"]
              }
            },
            confirmation_required: { type: Type.BOOLEAN }
          },
          required: ["goal", "steps", "confirmation_required"]
        }
      }
    });

    const parsedResult = JSON.parse(gResponse.text || "{}");
    const stepsMapped: TaskStep[] = (parsedResult.steps || []).map((s: any, idx: number) => {
      let mappedAction: TaskStep["action"] = "custom_script";
      let target = "";
      let details = "";
      let requiresApproval = !!parsedResult.confirmation_required;

      const params = s.parameters || {};

      switch (s.action) {
        case "open_application":
          mappedAction = "open_app";
          target = params.application || "Unknown App";
          details = `Command automation requests launching the application "${target}".`;
          break;
        case "close_application":
          mappedAction = "close_app";
          target = params.application || "Unknown App";
          details = `Command automation requests terminating the application "${target}".`;
          break;
        case "open_url":
          mappedAction = "browser_action";
          target = params.url || "https://www.google.com";
          details = `Navigating to website destination: "${target}".`;
          break;
        case "search_web":
          mappedAction = "browser_action";
          const q = params.query || "";
          target = q ? `https://www.google.com/search?q=${encodeURIComponent(q)}` : "https://www.google.com";
          details = `Searching the web via Chrome browser query: "${q}".`;
          break;
        case "create_folder":
          mappedAction = "manage_files";
          target = params.path || "C:/Projects";
          details = `Desktop filesystem directory allocation path: "${target}".`;
          break;
        case "move_file":
          mappedAction = "manage_files";
          target = params.source || "";
          details = `Relocating file element from "${params.source}" to "${params.destination}".`;
          requiresApproval = true;
          break;
        case "create_document":
          mappedAction = "custom_script";
          target = params.title || "Meeting Notes";
          details = `Initiating native local document template of type "${params.type || "Word"}" and title "${target}".`;
          break;
        case "set_volume":
          mappedAction = "system_control";
          target = "Volume Controller";
          const val = params.value !== undefined ? params.value : 50;
          details = `Adjust dynamic mixer control to system audio sound level of ${val}%.`;
          requiresApproval = true;
          break;
        case "lock_computer":
          mappedAction = "system_control";
          target = "System Lock";
          details = `Invoking lock screen protocol to secure workstation environment.`;
          requiresApproval = true;
          break;
        default:
          mappedAction = "custom_script";
          target = s.action || "Generic Command";
          details = `Automated custom step details: ${JSON.stringify(params)}`;
          break;
      }

      return {
        id: `step-${idx + 1}`,
        action: mappedAction,
        status: "pending",
        target,
        details,
        requiresApproval,
        explanation: `Executed under guidelines of structured computer control plan. Goal: "${parsedResult.goal || command}".`
      };
    });

    const parsedPlan: TaskPlan = {
      originalCommand: command,
      reasoning: `Goal: "${parsedResult.goal}". Safe structured layout generated. Rule confirmations enforced: ${parsedResult.confirmation_required ? "YES" : "NO"}.`,
      steps: stepsMapped
    };

    res.json({ plan: parsedPlan });

    /* const deprecated_gResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalCommand: { type: Type.STRING },
            reasoning: { type: Type.STRING, description: "Mental outline of the desktop operation." },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  action: { 
                    type: Type.STRING, 
                    description: "Must be one of: open_app, close_app, manage_files, browser_action, system_control, ocr_understanding, custom_script" 
                  },
                  status: { type: Type.STRING, description: "Must default to 'pending'" },
                  target: { type: Type.STRING },
                  details: { type: Type.STRING },
                  requiresApproval: { type: Type.BOOLEAN, description: "Set to true if delete, system shutdown/lock, script execution" },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "action", "status", "target", "details", "requiresApproval", "explanation"]
              }
            }
          },
          required: ["originalCommand", "reasoning", "steps"]
        }
      }
    });

    const parsedPlan: TaskPlan = JSON.parse(gResponse.text || "{}");
    res.json({ plan: parsedPlan }); */

  } catch (err: any) {
    console.error("Gemini Planning Service error:", err);
    const fallbackPlan = generateFallbackPlan(command);
    res.json({ plan: fallbackPlan, warning: `System error generating AI thoughts: ${err.message || err}. Fallback heuristic loaded.` });
  }
});

// Run simulated actions step-by-step
app.post("/api/agent/simulate-step", (req, res) => {
  const { step } = req.body as { step: TaskStep };
  if (!step) {
    return res.status(400).json({ error: "Missing step data" });
  }

  // Update telemetry trackers for visual spikes
  lastActionTime = Date.now();
  stepsExecutedCount++;

  let consoleLog = `[TaskPilot AI Simulator] Initiating Action: ${step.action} - Target: ${step.target}\n`;
  let commandStatus: "success" | "warning" | "error" = "success";

  switch (step.action) {
    case "system_control":
      if (step.target.toLowerCase().includes("volume")) {
        const match = step.details.match(/\d+/);
        const level = match ? parseInt(match[0], 10) : 75;
        systemState.volume = level;
        consoleLog += `[OS Integration] Changed Primary Sound Device Mixer Level to: ${level}%\n`;
      } else if (step.target.toLowerCase().includes("brightness")) {
        const match = step.details.match(/\d+/);
        const level = match ? parseInt(match[0], 10) : 80;
        systemState.brightness = level;
        consoleLog += `[OS Integration] Updated Secondary Monitor Screen Backlight: ${level}%\n`;
      } else if (step.target.toLowerCase().includes("shutdown")) {
        systemState.isSleeping = true;
        systemState.currentApp = "None (System Off)";
        consoleLog += `[OS API Call] Broadcast WM_QUERYENDSESSION code. Gracefully suspending computer services.\n`;
      } else if (step.target.toLowerCase().includes("lock")) {
        systemState.isLocked = true;
        systemState.currentApp = "Lockscreen Viewer";
        consoleLog += `[OS API Call] Triggered user32.dll LockWorkstation command. Screen secured.\n`;
      } else {
        consoleLog += `[OS API Call] Triggered general desktop operation setup: ${step.target}\n`;
      }
      break;

    case "open_app":
      systemState.currentApp = step.target;
      consoleLog += `[OS Process Loader] Spawning process child instance for "${step.target}". Window handle received.\n`;
      break;

    case "close_app":
      systemState.currentApp = "Desktop";
      consoleLog += `[OS Process Loader] Sent SIGTERM broadcast to application handle "${step.target}". Thread killed.\n`;
      break;

    case "browser_action":
      systemState.currentApp = "Chrome Browser";
      systemState.openedUrl = step.target;
      consoleLog += `[Browser Automation] Playwright navigated tab frame target to URL: ${step.target}\n`;
      consoleLog += `[Browser Automation] Rendering HTML canvas text. Loaded summary successfully.\n`;
      break;

    case "manage_files":
      const detailsLower = step.details.toLowerCase();
      if (detailsLower.includes("create") && (detailsLower.includes("folder") || detailsLower.includes("directory"))) {
        // Create Folder Simulation
        const folderName = step.target.split("/").pop() || "Reports";
        const cleanParent = step.target.substring(0, step.target.lastIndexOf("/")) || "/";
        const alreadyExists = findFileByPath(fileSystem, step.target);
        if (!alreadyExists) {
          addFileToPath(fileSystem, cleanParent, {
            name: folderName,
            path: step.target,
            type: "directory",
            children: []
          });
          consoleLog += `[File Manager Node] Created Directory Entry at absolute path: ${step.target}\n`;
        } else {
          consoleLog += `[File Manager Node] Directory path ${step.target} already present. Skipping creation.\n`;
        }
      } else if (detailsLower.includes("move") || detailsLower.includes("organize")) {
        // Move unorganized_screenshot.png from Downloads to Reports
        const fileToMove = "/Downloads/unorganized_screenshot.png";
        const targetPath = "/Reports/unorganized_screenshot.png";
        const lookSource = findFileByPath(fileSystem, fileToMove);
        if (lookSource) {
          // Remove from source folder
          lookSource.parent.splice(lookSource.index, 1);
          // Add to target Reports folder
          const reportsFolder = findFileByPath(fileSystem, "/Reports");
          if (reportsFolder && reportsFolder.item.children) {
            reportsFolder.item.children.push({
              name: "unorganized_screenshot.png",
              path: targetPath,
              type: "file",
              size: "1.8 MB",
              content: "SIMULATED_SCREENSHOT_DATA"
            });
            consoleLog += `[File Manager Node] Successfully relocated file from ${fileToMove} to ${targetPath}\n`;
          } else {
            consoleLog += `[File Manager Node] Error: Destination path /Reports could not be resolved.\n`;
            commandStatus = "warning";
          }
        } else {
          consoleLog += `[File Manager Node] Simulated move operation of ${step.target} performed.\n`;
        }
      } else if (detailsLower.includes("delete") || detailsLower.includes("clean") || detailsLower.includes("remove")) {
        const fileTarget = step.target;
        const search = findFileByPath(fileSystem, fileTarget);
        if (search) {
          search.parent.splice(search.index, 1);
          consoleLog += `[File Manager Node] WARNING: Irreversible deletion performed. Destroyed filesystem node at: ${fileTarget}\n`;
        } else {
          consoleLog += `[File Manager Node] Executed remote clean file trigger matching key ${step.target}\n`;
        }
      } else {
        consoleLog += `[File Manager Node] Cataloged filesystem read/write operation: ${step.details}\n`;
      }
      break;

    case "ocr_understanding":
      systemState.lastScreenshotTime = new Date().toISOString();
      systemState.ocrDetectedText = [
        `Viewing application: ${systemState.currentApp}`,
        `Document path references: /Documents/meeting_notes.txt`,
        `Identified focal widgets: Button("Authorize"), Input("Desktop Command")`
      ];
      consoleLog += `[Computer Vision Unit] Screen buffer captured. Dispatched OCR bounding parser.\n`;
      consoleLog += `[Computer Vision Unit] OCR Text recognized: "${systemState.ocrDetectedText.join(" | ")}"\n`;
      break;

    case "custom_script":
      consoleLog += `[Windows Native API] Loaded PowerShell VM profile context.\n`;
      consoleLog += `[Windows Native API] Executed sandbox safe buffer script execution: "${step.details}"\n`;
      break;

    default:
      consoleLog += `[TaskPilot AI Engine] Dispatched unknown custom command hook: ${step.details}\n`;
  }

  // Record to History list
  tasksHistory.unshift({
    id: `hist-${Date.now()}`,
    timestamp: new Date().toISOString(),
    command: `${step.action.toUpperCase()}: ${step.target}`,
    status: commandStatus === "success" ? "success" : "warning",
    stepsCount: 1,
    details: step.details + " - Completed through simulated agent."
  });

  res.json({ success: true, consoleLog, systemState, fileSystem, tasksHistory });
});

// Helper for offline matching heuristics when no API token is loaded
function generateFallbackPlan(command: string): TaskPlan {
  const clean = command.toLowerCase();
  const plan: TaskPlan = {
    originalCommand: command,
    reasoning: "Generated natively inside the TaskPilot local heuristic script rules engine.",
    steps: []
  };

  if (clean.includes("word") || clean.includes("launch excel") || clean.includes("open excel") || clean.includes("zoom")) {
    const targetApp = clean.includes("word") 
      ? "Microsoft Word" 
      : clean.includes("excel") 
        ? "Microsoft Excel" 
        : "Zoom Meeting UI";

    plan.steps.push({
      id: "fallback-s1",
      action: "open_app",
      status: "pending",
      target: targetApp,
      details: `Dispatches OS process spawn layer for "${targetApp}".`,
      requiresApproval: false,
      explanation: "Required to launch the application specified in the main user message."
    });
  } 
  
  else if (clean.includes("pdf") || clean.includes("move") || clean.includes("reports") || clean.includes("folder")) {
    plan.steps.push({
      id: "fallback-s1",
      action: "open_app",
      status: "pending",
      target: "File Explorer",
      details: "Launch Windows File Explorer GUI instance to prepare directories.",
      requiresApproval: false,
      explanation: "Required to visualize files and confirm directory structures prior to migration."
    });
    
    plan.steps.push({
      id: "fallback-s2",
      action: "manage_files",
      status: "pending",
      target: "/Reports",
      details: "Check and create '/Reports' subdirectory folder if it does not exist in disk.",
      requiresApproval: false,
      explanation: "Destination archive directory for organized project screenshots."
    });

    plan.steps.push({
      id: "fallback-s3",
      action: "manage_files",
      status: "pending",
      target: "/Downloads/unorganized_screenshot.png",
      details: "Move Downloads unorganized screenshot file element to '/Reports/unorganized_screenshot.png'.",
      requiresApproval: true,
      explanation: "Perform folder organization by moving files to their destination folder."
    });
  } 
  
  else if (clean.includes("clean") || clean.includes("delete") || clean.includes("cache") || clean.includes("temp")) {
    plan.steps.push({
      id: "fallback-delete-1",
      action: "manage_files",
      status: "pending",
      target: "/Downloads/temp_cache_old.log",
      details: "Force delete cache logs file inside the downloads directories.",
      requiresApproval: true,
      explanation: "Security clearance required for file destruction steps."
    });
  } 
  
  else if (clean.includes("weather") || clean.includes("search") || clean.includes("google") || clean.includes("chrome") || clean.includes("website")) {
    const link = clean.includes("weather") ? "https://www.google.com/search?q=current+weather+forecast" : "https://www.google.com";
    plan.steps.push({
      id: "fallback-web-1",
      action: "open_app",
      status: "pending",
      target: "Google Chrome",
      details: "Spawns Chrome browser core service.",
      requiresApproval: false,
      explanation: "Initial target container for automated browser browsing tasks."
    });
    plan.steps.push({
      id: "fallback-web-2",
      action: "browser_action",
      status: "pending",
      target: link,
      details: `Direct browser navigation to URL target and read metadata parameters.`,
      requiresApproval: false,
      explanation: "Read content or search results requested."
    });
  } 
  
  else if (clean.includes("volume") || clean.includes("brightness") || clean.includes("mute") || clean.includes("lock") || clean.includes("shut down")) {
    const targetVal = clean.includes("volume") ? "volume" : clean.includes("brightness") ? "brightness" : clean.includes("lock") ? "lock workstation" : "shutdown computer";
    plan.steps.push({
      id: "fallback-ctrl-1",
      action: "system_control",
      status: "pending",
      target: targetVal,
      details: `Trigger OS control parameter value: "${command}".`,
      requiresApproval: clean.includes("shut down") || clean.includes("lock"),
      explanation: "Alters basic operating system hardware settings dynamically."
    });
  } 
  
  else {
    // Default generic reasoning dispatch
    plan.steps.push({
      id: "fallback-generic-1",
      action: "ocr_understanding",
      status: "pending",
      target: "Active Screen Buffer",
      details: "Capture primary display screen buffers and read text layers under the cursor.",
      requiresApproval: false,
      explanation: "Initial analysis of the viewport setup before committing system actions."
    });
    
    plan.steps.push({
      id: "fallback-generic-2",
      action: "custom_script",
      status: "pending",
      target: "Local User Command",
      details: `Simulate local PowerShell automation chain for: "${command}".`,
      requiresApproval: true,
      explanation: "Execute user instruction."
    });
  }

  return plan;
}

// Vite and Express serving layer setup helper function
async function startServer() {
  // Serve API or static in Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback handling
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TaskPilot Server] Live and listening at http://localhost:${PORT}`);
  });
}

startServer();
