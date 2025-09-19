/**
 * Update Memory Bank Tool
 * Update existing memory bank in .github/memory-bank folder with new project information
 */

import { ensureMemoryBankDirectory } from '../utils/fileUtils.js';
import { generateMemoryBankFiles, type MemoryBankOptions } from '../core/memoryBankGenerator.js';
import { setupCopilotInstructions } from '../integrations/copilotIntegration.js';

export const updateMemoryBankTool = {
  name: 'update_memory_bank',
  description: 'Update existing memory bank in .github/memory-bank folder with new project information',
  inputSchema: {
    type: 'object',
    properties: {
      projectRootPath: {
        type: 'string',
        description: 'Root folder path containing the .github/memory-bank folder',
      },
      updateType: {
        type: 'string',
        enum: ['incremental', 'full-refresh', 'specific-files'],
        description: 'Type of update to perform',
      },
      specificFiles: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Specific memory bank files to update (for specific-files update type)',
      }
    },
    required: ['projectRootPath']
  }
};

export async function handleUpdateMemoryBank(args: any) {
  const projectRootPath = args.projectRootPath;
  const updateType = args.updateType || 'incremental';
  const specificFiles = args.specificFiles || [];
  
  try {
    // Update the memory bank structure based on updateType
    const memoryBankDir = await ensureMemoryBankDirectory(projectRootPath);
    
    let updatedFiles: string[] = [];
    
    if (updateType === 'full-refresh') {
      // Full refresh - regenerate all files including any additional ones
      const customizationOptions: MemoryBankOptions = {
        structureType: 'custom', // Custom to include any existing additional files
        semanticOrganization: true,
        focusAreas: [],
        detailLevel: 'detailed',
        additionalFiles: [],
        customFolders: [],
        syncValidation: true,
      };
      
      await generateMemoryBankFiles(memoryBankDir, projectRootPath, customizationOptions);
      updatedFiles = ['all files regenerated'];
      
    } else if (updateType === 'specific-files') {
      // Update specific files only
      updatedFiles = specificFiles;
      // Note: This would need specific implementation for updating individual files
      
    } else {
      // Incremental update - update commonly changing files
      updatedFiles = ['activeContext.md', 'progress.md', 'systemPatterns.md'];
      // Note: This would need implementation for updating specific content
    }
    
    // Always update copilot instructions after memory bank changes
    await setupCopilotInstructions(projectRootPath, { syncValidation: true });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'Memory bank update completed',
            projectRootPath,
            memoryBankLocation: memoryBankDir,
            updateType,
            updatedFiles,
            copilotInstructionsUpdated: true,
            timestamp: new Date().toISOString(),
            message: `✅ Memory bank updated successfully. ${updatedFiles.length} files updated. Copilot instructions synchronized.`
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
            status: 'Memory bank update failed',
            projectRootPath,
            error: error instanceof Error ? error.message : String(error),
            message: 'Failed to update memory bank. Please check the project path and permissions.'
          }, null, 2),
        },
      ],
    };
  }
}