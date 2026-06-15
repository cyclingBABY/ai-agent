export interface DiskFile {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: string;
  content?: string;
  children?: DiskFile[];
}

export interface TaskStep {
  id: string;
  action: "open_app" | "close_app" | "manage_files" | "browser_action" | "system_control" | "ocr_understanding" | "custom_script";
  status: "pending" | "approved" | "unapproved" | "executing" | "completed" | "failed";
  target: string;
  details: string;
  requiresApproval: boolean;
  explanation: string;
}

export interface TaskPlan {
  originalCommand: string;
  reasoning: string;
  steps: TaskStep[];
}

export interface SystemState {
  volume: number;
  brightness: number;
  currentApp: string;
  openedUrl: string;
  isSleeping: boolean;
  isLocked: boolean;
  lastScreenshotTime: string | null;
  screenshotContent: string | null;
  ocrDetectedText: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  action: string;
  target: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  icon: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  command: string;
  status: "success" | "warning" | "error" | "running";
  stepsCount: number;
  details: string;
}

export interface DeveloperFile {
  name: string;
  path: string;
  language: string;
  description: string;
  code: string;
}
