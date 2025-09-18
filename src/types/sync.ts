/**
 * Sync and conflict resolution interfaces for Memory Bank Generator
 */

export interface SemanticFolderInfo {
  folderName: string;                     // e.g., "features", "integrations", "deployment"
  purpose: string;                        // Description of folder's purpose
  fileCount: number;                      // Number of files in folder
  files: string[];                        // List of files in folder
}

export interface CopilotSyncValidation {
  memoryBankFiles: string[];              // Files found in .github/memory-bank/ (including nested)
  copilotReferences: string[];            // Files referenced in copilot-instructions.md
  missingReferences: string[];            // Memory bank files not in Copilot instructions
  orphanedReferences: string[];           // Copilot references not in memory bank
  isInSync: boolean;                      // True if all files properly referenced
  lastValidated: string;                  // ISO timestamp of last validation
  conflictDetails?: SyncConflictDetails;  // Detailed conflict information for interactive resolution
}

export interface SyncConflictDetails {
  conflictType: 'missing-references' | 'orphaned-references' | 'both' | 'structure-mismatch';
  severity: 'low' | 'medium' | 'high';
  missingFiles: FileConflictInfo[];
  orphanedFiles: FileConflictInfo[];
  suggestedActions: ConflictAction[];
  autoResolvable: boolean;
}

export interface FileConflictInfo {
  fileName: string;
  filePath: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  suggestedAction: string;
}

export interface ConflictAction {
  actionType: 'add-reference' | 'remove-reference' | 'delete-file' | 'create-file' | 'update-structure';
  description: string;
  targetFile: string;
  details: string;
  requiresConfirmation: boolean;
}

export interface InteractiveResolutionResult {
  resolved: boolean;
  actionsPerformed: ConflictAction[];
  userChoices: UserChoice[];
  finalState: CopilotSyncValidation;
  conversationLog: ConversationStep[];
}

export interface UserChoice {
  question: string;
  answer: string;
  selectedAction?: ConflictAction;
}

export interface ConversationStep {
  step: number;
  type: 'question' | 'information' | 'confirmation' | 'warning' | 'result';
  content: string;
  options?: string[];
  userResponse?: string;
  timestamp: string;
}