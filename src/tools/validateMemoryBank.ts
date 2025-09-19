/**
 * Validate Memory Bank Tool
 * Validate existing memory bank structure, completeness, and optionally sync with Copilot instructions
 */

import { join } from 'path';
import { validateMemoryBank } from '../core/validation.js';

export const validateMemoryBankTool = {
  name: 'validate_memory_bank',
  description: 'Validate existing memory bank structure, completeness, and optionally sync with Copilot instructions',
  inputSchema: {
    type: 'object',
    properties: {
      projectRootPath: {
        type: 'string',
        description: 'Root folder path containing .github/memory-bank',
      },
      syncValidation: {
        type: 'boolean',
        description: 'Enable comprehensive sync validation with Copilot instructions (default: false)',
        default: false,
      },
      interactiveMode: {
        type: 'boolean',
        description: 'Enable interactive conflict resolution for sync issues (default: false)',
        default: false,
      }
    },
    required: ['projectRootPath']
  }
};

export async function handleValidateMemoryBank(args: any) {
  const projectRootPath = args.projectRootPath;
  const syncValidation = args.syncValidation || false;
  const interactiveMode = args.interactiveMode || false;
  
  try {
    // Construct the correct memory bank path
    const memoryBankPath = join(projectRootPath, '.github', 'memory-bank');
    
    const validation = await validateMemoryBank(memoryBankPath, {
      syncValidation,
      interactiveMode,
      projectRoot: projectRootPath
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'Memory bank validation completed',
            projectRootPath,
            validation,
            syncValidation: {
              enabled: syncValidation,
              isInSync: validation.copilotSync?.isInSync,
              conflictDetails: validation.copilotSync?.conflictDetails || null
            },
            structureCompliance: validation.structureCompliance,
            quality: validation.quality,
            message: validation.isValid ? 
              '✅ Memory bank is valid and complete' : 
              '⚠️ Memory bank has validation issues that need attention'
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
            status: 'Memory bank validation failed',
            projectRootPath,
            error: error instanceof Error ? error.message : String(error),
            message: 'Failed to validate memory bank. Please check if the memory bank exists and is accessible.'
          }, null, 2),
        },
      ],
    };
  }
}