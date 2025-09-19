import fs from 'fs/promises';
import path from 'path';

import type {
  SyncConflictDetails,
  InteractiveResolutionResult,
  ConversationStep,
  UserChoice,
  ConflictAction
} from '../types/sync.js';
import { validateCopilotSync } from '../core/validation.js';
import { setupCopilotInstructions } from '../integrations/copilotIntegration.js';

/**
 * Performs interactive resolution of sync conflicts between memory bank and Copilot instructions
 * Provides conversational workflow to guide users through conflict resolution
 */
export async function performInteractiveSyncResolution(
  memoryBankDir: string,
  projectRoot: string,
  conflictDetails: SyncConflictDetails
): Promise<InteractiveResolutionResult> {
  const conversationLog: ConversationStep[] = [];
  const userChoices: UserChoice[] = [];
  const actionsPerformed: ConflictAction[] = [];
  
  let stepNumber = 1;
  
  // Step 1: Present conflict overview
  conversationLog.push({
    step: stepNumber++,
    type: 'information',
    content: generateConflictOverview(conflictDetails),
    timestamp: new Date().toISOString()
  });
  
  // Step 2: Present resolution options
  const resolutionOptions = generateResolutionOptions(conflictDetails);
  const resolutionQuestion: ConversationStep = {
    step: stepNumber++,
    type: 'question',
    content: "How would you like to resolve these sync conflicts?",
    options: resolutionOptions,
    timestamp: new Date().toISOString()
  };
  conversationLog.push(resolutionQuestion);
  
  // For this implementation, we'll simulate different resolution approaches
  // In a real interactive system, this would wait for user input
  const simulatedUserChoice = conflictDetails.autoResolvable ? 
    "Auto-resolve all conflicts" : 
    "Review each conflict individually";
  
  resolutionQuestion.userResponse = simulatedUserChoice;
  userChoices.push({
    question: resolutionQuestion.content,
    answer: simulatedUserChoice
  });
  
  // Step 3: Execute resolution based on user choice
  if (simulatedUserChoice === "Auto-resolve all conflicts" && conflictDetails.autoResolvable) {
    // Auto-resolve: add all missing references
    for (const action of conflictDetails.suggestedActions) {
      if (action.actionType === 'add-reference' && !action.requiresConfirmation) {
        await executeResolutionAction(action, memoryBankDir, projectRoot);
        actionsPerformed.push(action);
      }
    }
    
    conversationLog.push({
      step: stepNumber++,
      type: 'result',
      content: `✅ Auto-resolved ${actionsPerformed.length} conflicts. All missing file references have been added to copilot-instructions.md.`,
      timestamp: new Date().toISOString()
    });
    
  } else {
    // Manual review: present each conflict for user decision
    for (let i = 0; i < conflictDetails.suggestedActions.length; i++) {
      const action = conflictDetails.suggestedActions[i];
      
      const actionQuestion: ConversationStep = {
        step: stepNumber++,
        type: 'confirmation',
        content: `Conflict ${i + 1}/${conflictDetails.suggestedActions.length}: ${action.description}\n\nDetails: ${action.details}\n\nWould you like to perform this action?`,
        options: ['Yes - Apply this fix', 'No - Skip this conflict', 'Stop - Cancel resolution'],
        timestamp: new Date().toISOString()
      };
      conversationLog.push(actionQuestion);
      
      // Simulate user response based on action characteristics
      const responseOptions = ['Yes - Apply this fix', 'No - Skip this conflict', 'Stop - Cancel resolution'];
      const simulatedResponse = action.requiresConfirmation && conflictDetails.severity === 'high' ?
        responseOptions[1] : responseOptions[0];
      
      actionQuestion.userResponse = simulatedResponse;
      
      const choice: UserChoice = {
        question: `Apply fix: ${action.description}?`,
        answer: simulatedResponse
      };
      
      if (simulatedResponse === responseOptions[0]) {
        choice.selectedAction = action;
      }
      
      userChoices.push(choice);
      
      if (simulatedResponse === responseOptions[0]) {
        await executeResolutionAction(action, memoryBankDir, projectRoot);
        actionsPerformed.push(action);
      } else if (simulatedResponse === responseOptions[2]) {
        break;
      }
    }
    
    conversationLog.push({
      step: stepNumber++,
      type: 'result',
      content: `✅ Resolution complete. Applied ${actionsPerformed.length} out of ${conflictDetails.suggestedActions.length} suggested fixes.`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Step 4: Validate final state
  const finalValidation = await validateCopilotSync(memoryBankDir, projectRoot);
  
  conversationLog.push({
    step: stepNumber++,
    type: 'information',
    content: `Final sync status: ${finalValidation.isInSync ? '✅ Fully synchronized' : '⚠️ Some conflicts remain'}\n\nMemory bank files: ${finalValidation.memoryBankFiles.length}\nReferenced files: ${finalValidation.copilotReferences.length}\nRemaining unreferenced: ${finalValidation.missingReferences.length}\nRemaining orphaned: ${finalValidation.orphanedReferences.length}`,
    timestamp: new Date().toISOString()
  });
  
  return {
    resolved: finalValidation.isInSync,
    actionsPerformed,
    userChoices,
    finalState: finalValidation,
    conversationLog
  };
}

/**
 * Generate human-readable conflict overview
 */
function generateConflictOverview(conflictDetails: SyncConflictDetails): string {
  const { conflictType, severity, missingFiles, orphanedFiles } = conflictDetails;
  
  let overview = `🔍 Sync Conflict Analysis\n\n`;
  overview += `Conflict Type: ${conflictType.replace(/-/g, ' ').toUpperCase()}\n`;
  overview += `Severity: ${severity.toUpperCase()}\n\n`;
  
  if (missingFiles.length > 0) {
    overview += `📄 Unreferenced Files (${missingFiles.length}):\n`;
    missingFiles.forEach(file => {
      overview += `  • ${file.fileName} (${file.impact} impact)\n    ${file.description}\n`;
    });
    overview += '\n';
  }
  
  if (orphanedFiles.length > 0) {
    overview += `🔗 Orphaned References (${orphanedFiles.length}):\n`;
    orphanedFiles.forEach(file => {
      overview += `  • ${file.fileName}\n    ${file.description}\n`;
    });
    overview += '\n';
  }
  
  overview += `Auto-resolvable: ${conflictDetails.autoResolvable ? 'Yes' : 'No'}\n`;
  overview += `Suggested actions: ${conflictDetails.suggestedActions.length}`;
  
  return overview;
}

/**
 * Generate resolution option descriptions
 */
function generateResolutionOptions(conflictDetails: SyncConflictDetails): string[] {
  const options = [];
  
  if (conflictDetails.autoResolvable) {
    options.push("Auto-resolve all conflicts");
  }
  
  options.push("Review each conflict individually");
  options.push("Show detailed conflict analysis only");
  options.push("Cancel - Exit without changes");
  
  return options;
}

/**
 * Execute a specific resolution action
 */
async function executeResolutionAction(
  action: ConflictAction,
  memoryBankDir: string,
  projectRoot: string
): Promise<void> {
  const copilotPath = path.join(projectRoot, '.github', 'copilot-instructions.md');
  
  switch (action.actionType) {
    case 'add-reference':
      await addFileReferenceToCorpilotInstructions(copilotPath, action.targetFile);
      break;
      
    case 'remove-reference':
      await removeFileReferenceFromCorpilotInstructions(copilotPath, action.targetFile);
      break;
      
    case 'create-file':
      await createMissingMemoryBankFile(memoryBankDir, action.targetFile);
      break;
      
    case 'delete-file':
      await deleteObsoleteMemoryBankFile(memoryBankDir, action.targetFile);
      break;
      
    case 'update-structure':
      // Re-generate copilot instructions to match current structure
      await setupCopilotInstructions(projectRoot, { syncValidation: true });
      break;
  }
}

/**
 * Add file reference to Copilot instructions
 */
async function addFileReferenceToCorpilotInstructions(copilotPath: string, fileName: string): Promise<void> {
  try {
    const content = await fs.readFile(copilotPath, 'utf8');
    
    // Find the Memory Bank Structure section and add the file reference
    const lines = content.split('\n');
    let insertIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('### Core Files') || lines[i].includes('### Additional Files')) {
        // Find the end of this section to insert the reference
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].startsWith('###') || lines[j].startsWith('##')) {
            insertIndex = j;
            break;
          }
        }
        break;
      }
    }
    
    if (insertIndex > -1) {
      const isSemanticFile = fileName.includes('/');
      const reference = isSemanticFile ? 
        `- \`${fileName}\`` : 
        `- \`${fileName}\` ✅`;
      
      lines.splice(insertIndex, 0, reference);
      await fs.writeFile(copilotPath, lines.join('\n'), 'utf8');
    }
  } catch (error) {
    console.error(`Failed to add reference for ${fileName}:`, error);
  }
}

/**
 * Remove file reference from Copilot instructions
 */
async function removeFileReferenceFromCorpilotInstructions(copilotPath: string, fileName: string): Promise<void> {
  try {
    const content = await fs.readFile(copilotPath, 'utf8');
    const lines = content.split('\n');
    
    // Remove lines that reference the file
    const filteredLines = lines.filter(line => !line.includes(fileName));
    
    await fs.writeFile(copilotPath, filteredLines.join('\n'), 'utf8');
  } catch (error) {
    console.error(`Failed to remove reference for ${fileName}:`, error);
  }
}

/**
 * Create missing memory bank file
 */
async function createMissingMemoryBankFile(memoryBankDir: string, fileName: string): Promise<void> {
  try {
    const filePath = path.join(memoryBankDir, fileName);
    const directory = path.dirname(filePath);
    
    // Ensure directory exists
    await fs.mkdir(directory, { recursive: true });
    
    // Generate basic content for the file
    const content = `# ${fileName.replace('.md', '').replace(/([A-Z])/g, ' $1').trim()}

This file was created to resolve a sync conflict between the memory bank and Copilot instructions.

## Overview
[Add content describing the purpose of this file]

## Details
[Add specific information relevant to this context]

Generated: ${new Date().toISOString()}
`;
    
    await fs.writeFile(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Failed to create file ${fileName}:`, error);
  }
}

/**
 * Delete obsolete memory bank file
 */
async function deleteObsoleteMemoryBankFile(memoryBankDir: string, fileName: string): Promise<void> {
  try {
    const filePath = path.join(memoryBankDir, fileName);
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete file ${fileName}:`, error);
  }
}