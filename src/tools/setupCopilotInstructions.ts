/**
 * Setup Copilot Instructions Tool
 * Create or update copilot-instructions.md file with memory bank integration
 */

import { setupCopilotInstructions } from '../integrations/copilotIntegration.js';

export const setupCopilotInstructionsTool = {
  name: 'setup_copilot_instructions',
  description: 'Create or update copilot-instructions.md file with memory bank integration',
  inputSchema: {
    type: 'object',
    properties: {
      projectRootPath: {
        type: 'string',
        description: 'Root folder path containing .github folder',
      }
    },
    required: ['projectRootPath']
  }
};

export async function handleSetupCopilotInstructions(args: any) {
  const projectRootPath = args.projectRootPath;
  
  try {
    const result = await setupCopilotInstructions(projectRootPath, { 
      syncValidation: true 
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'Copilot instructions setup completed',
            projectRootPath,
            copilotInstructionsPath: `${projectRootPath}/.github/copilot-instructions.md`,
            result,
            message: '✅ Copilot instructions created/updated successfully with memory bank integration'
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
            status: 'Copilot instructions setup failed',
            projectRootPath,
            error: error instanceof Error ? error.message : String(error),
            message: 'Failed to setup Copilot instructions. Please check the project path and permissions.'
          }, null, 2),
        },
      ],
    };
  }
}