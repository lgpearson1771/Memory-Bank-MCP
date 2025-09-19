/**
 * Resolve Sync Conflicts Tool
 * Interactively resolve sync conflicts between memory bank and Copilot instructions
 */

import { performInteractiveSyncResolution } from '../interactions/syncResolution.js';
import { validateMemoryBank } from '../core/validation.js';

export const resolveSyncConflictsTool = {
  name: 'resolve_sync_conflicts',
  description: 'Interactively resolve sync conflicts between memory bank and Copilot instructions',
  inputSchema: {
    type: 'object',
    properties: {
      projectRootPath: {
        type: 'string',
        description: 'Root folder path containing .github/memory-bank',
      },
      autoResolve: {
        type: 'boolean',
        description: 'Automatically resolve conflicts when possible (default: false)',
        default: false,
      }
    },
    required: ['projectRootPath']
  }
};

export async function handleResolveSyncConflicts(args: any) {
  const projectRootPath = args.projectRootPath;
  const memoryBankDir = `${projectRootPath}/.github/memory-bank`;
  
  try {
    // First, validate to get conflict details
    const validation = await validateMemoryBank(memoryBankDir, { 
      syncValidation: true, 
      projectRoot: projectRootPath,
      interactiveMode: true
    });
    
    if (validation.copilotSync?.isInSync) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'No conflicts to resolve',
              projectRootPath,
              message: '✅ Memory bank and Copilot instructions are already synchronized',
              syncValidation: {
                isInSync: true,
                memoryBankFiles: validation.copilotSync.memoryBankFiles.length,
                copilotReferences: validation.copilotSync.copilotReferences.length
              }
            }, null, 2),
          },
        ],
      };
    }
    
    if (!validation.copilotSync?.conflictDetails) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'Unable to resolve conflicts',
              projectRootPath,
              error: 'No detailed conflict information available',
              message: 'Run validation with interactive mode first to analyze conflicts'
            }, null, 2),
          },
        ],
      };
    }
    
    // Perform interactive resolution
    const resolutionResult = await performInteractiveSyncResolution(
      memoryBankDir,
      projectRootPath,
      validation.copilotSync.conflictDetails
    );
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'Interactive sync conflict resolution completed',
            projectRootPath,
            memoryBankLocation: memoryBankDir,
            resolutionResult: {
              resolved: resolutionResult.resolved,
              actionsPerformed: resolutionResult.actionsPerformed.length,
              totalUserChoices: resolutionResult.userChoices.length,
              conversationSteps: resolutionResult.conversationLog.length,
              finalSyncStatus: {
                isInSync: resolutionResult.finalState.isInSync,
                memoryBankFiles: resolutionResult.finalState.memoryBankFiles.length,
                remainingConflicts: resolutionResult.finalState.missingReferences.length + resolutionResult.finalState.orphanedReferences.length
              }
            },
            conversationLog: resolutionResult.conversationLog,
            userChoices: resolutionResult.userChoices,
            actionsPerformed: resolutionResult.actionsPerformed.map(action => ({
              type: action.actionType,
              description: action.description,
              target: action.targetFile
            })),
            message: resolutionResult.resolved ? 
              `✅ Sync conflicts successfully resolved! Applied ${resolutionResult.actionsPerformed.length} fixes through interactive workflow.` :
              `⚠️ Partial resolution completed. Applied ${resolutionResult.actionsPerformed.length} fixes, but some conflicts remain. Review the conversation log for details.`
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'Sync conflict resolution failed',
            projectRootPath,
            error: error instanceof Error ? error.message : String(error),
            message: 'Failed to resolve sync conflicts. Please check the memory bank structure.'
          }, null, 2),
        },
      ],
    };
  }
}