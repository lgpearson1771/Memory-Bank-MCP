/**
 * Generate Memory Bank Tool
 * Guided memory bank generation with intelligent analysis and conversational workflow
 */

import { ensureMemoryBankDirectory } from '../utils/fileUtils.js';
import { analyzeProject } from '../core/projectAnalysis.js';
import { generateMemoryBankFiles, type MemoryBankOptions } from '../core/memoryBankGenerator.js';
import { validateMemoryBank } from '../core/validation.js';
import { setupCopilotInstructions } from '../integrations/copilotIntegration.js';
import { analyzeProjectForConversation } from '../interactions/conversational.js';

export const generateMemoryBankTool = {
  name: 'generate_memory_bank',
  description: 'Guided memory bank generation with intelligent analysis and conversational workflow. Supports multiple modes: analyze-first (project analysis with recommendations), guided (step-by-step), express (smart defaults), and custom (full control).',
  inputSchema: {
    type: 'object',
    properties: {
      projectRootPath: {
        type: 'string',
        description: 'Root folder path for the project where memory bank should be generated',
      },
      mode: {
        type: 'string',
        enum: ['analyze-first', 'guided', 'express', 'custom'],
        description: 'Generation mode: analyze-first (analyze then provide recommendations), guided (step-by-step with prompts), express (fast with smart defaults), custom (full customization)',
        default: 'analyze-first'
      },
      conversationalGuidance: {
        type: 'boolean',
        description: 'Enable conversational guidance responses for AI assistant interaction (default: true)',
        default: true
      },
      customizationOptions: {
        type: 'object',
        description: 'Optional customization preferences for memory bank generation',
        properties: {
          structureType: {
            type: 'string',
            enum: ['standard', 'enhanced', 'custom'],
            description: 'standard (6 core files), enhanced (core + semantic folders), custom (user-defined)',
          },
          semanticOrganization: {
            type: 'boolean',
            description: 'Enable semantic folder organization for additional files (default: true)',
            default: true,
          },
          focusAreas: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Specific areas to focus on (e.g., "architecture", "apis", "testing", "deployment")',
          },
          detailLevel: {
            type: 'string',
            enum: ['brief', 'standard', 'comprehensive'],
            description: 'Level of detail for analysis and documentation',
          },
          additionalFiles: {
            type: 'object',
            description: 'Request additional documentation files organized in semantic folders',
            properties: {
              features: { type: 'boolean', description: 'Generate feature-specific documentation' },
              integrations: { type: 'boolean', description: 'Generate integration documentation' },
              deployment: { type: 'boolean', description: 'Generate deployment documentation' },
              api: { type: 'boolean', description: 'Generate API documentation' },
              testing: { type: 'boolean', description: 'Generate testing documentation' },
              security: { type: 'boolean', description: 'Generate security documentation' }
            }
          },
          customFolders: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Folder name' },
                description: { type: 'string', description: 'Purpose description for this folder' },
                filePatterns: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'File name patterns that should go in this folder'
                }
              },
              required: ['name', 'description', 'filePatterns']
            },
            description: 'Custom semantic folders for project-specific organization'
          },
          autoConfirm: {
            type: 'boolean',
            description: 'Skip confirmation prompts and proceed with recommendations (default: false)',
            default: false,
          },
          syncValidation: {
            type: 'boolean',
            description: 'Enable sync validation between memory bank and Copilot instructions (default: true)',
            default: true,
          }
        }
      }
    },
    required: ['projectRootPath']
  }
};

export async function handleGenerateMemoryBank(args: any) {
  const projectRootPath = args.projectRootPath;
  const mode = args.mode || 'analyze-first';
  const conversationalGuidance = args.conversationalGuidance !== false;
  
  // For analyze-first mode or when conversational guidance is enabled, 
  // return conversational response instead of immediately generating
  if ((mode === 'analyze-first' || conversationalGuidance) && !args.customizationOptions?.autoConfirm) {
    const conversationalResponse = await analyzeProjectForConversation(projectRootPath, mode);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            conversationalMode: true,
            mode,
            projectRootPath,
            analysis: conversationalResponse,
            instructions: 'This tool is providing conversational guidance. The AI assistant should present the conversation.message to the user with the provided options, then call this tool again with the user\'s choice and appropriate parameters.',
            nextAction: conversationalResponse.toolToCallNext || 'generate_memory_bank',
            userGuidance: {
              message: conversationalResponse.conversation.message,
              options: conversationalResponse.conversation.options,
              reasoning: conversationalResponse.conversation.reasoning,
              consequences: conversationalResponse.conversation.consequences,
              recommendations: conversationalResponse.recommendations
            }
          }, null, 2),
        },
      ],
    };
  }
  
  // Traditional generation mode or when auto-confirm is enabled
  // Process customization options with additionalFiles conversion
  const customOptions = args.customizationOptions || {};
  
  // Convert additionalFiles object format to array format
  let additionalFiles: string[] = [];
  if (customOptions.additionalFiles) {
    if (Array.isArray(customOptions.additionalFiles)) {
      additionalFiles = customOptions.additionalFiles;
    } else {
      // Convert object format {api: true, deployment: true} to array format
      const fileTypes = customOptions.additionalFiles;
      Object.keys(fileTypes).forEach(key => {
        if (fileTypes[key] === true) {
          additionalFiles.push(key);
        }
      });
    }
  }
  
  const customizationOptions: MemoryBankOptions = {
    structureType: customOptions.structureType || 'standard',
    semanticOrganization: customOptions.semanticOrganization !== false,
    focusAreas: customOptions.focusAreas || [],
    detailLevel: customOptions.detailLevel || 'detailed',
    additionalFiles: additionalFiles,
    customFolders: customOptions.customFolders || [],
    syncValidation: customOptions.syncValidation !== false,
  };
  
  try {
    // Ensure memory bank directory exists
    const memoryBankDir = await ensureMemoryBankDirectory(projectRootPath);
    
    // Analyze the project
    const analysis = await analyzeProject(projectRootPath, 'medium');
    
    // Generate memory bank files with semantic organization
    const createdFiles = await generateMemoryBankFiles(memoryBankDir, analysis, customizationOptions);
    
    // Setup dynamic copilot instructions with sync validation
    await setupCopilotInstructions(projectRootPath, { 
      syncValidation: customizationOptions.syncValidation || false
    });
    
    // Validate the result if sync validation is enabled
    let validation = undefined;
    if (customizationOptions.syncValidation) {
      validation = await validateMemoryBank(memoryBankDir, { 
        syncValidation: true, 
        projectRoot: projectRootPath 
      });
    }
    
    const coreFiles = ['projectbrief.md', 'productContext.md', 'activeContext.md', 'systemPatterns.md', 'techContext.md', 'progress.md'];
    const coreFilesCreated = createdFiles.filter(f => coreFiles.includes(f));
    const additionalFilesCreated = createdFiles.filter(f => !coreFiles.includes(f));
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'Memory bank generation completed successfully',
            projectRootPath,
            memoryBankLocation: memoryBankDir,
            projectAnalysis: analysis,
            organizationStructure: {
              type: customizationOptions.semanticOrganization ? 'semantic' : 'flat',
              coreFilesAtRoot: coreFilesCreated.length,
              additionalFiles: additionalFilesCreated.length,
              semanticFolders: customizationOptions.semanticOrganization ? 
                additionalFilesCreated.filter(f => f.includes('/')).map(f => f.split('/')[0]).filter((v, i, a) => a.indexOf(v) === i) : 
                []
            },
            structureType: customizationOptions.structureType,
            detailLevel: customizationOptions.detailLevel,
            focusAreas: additionalFilesCreated.length > 0 ? customizationOptions.focusAreas : [],
            focusAreasInContent: additionalFilesCreated.length === 0 && customizationOptions.focusAreas.length > 0 ? 
              customizationOptions.focusAreas : 
              [],
            coreFilesCreated,
            additionalFilesCreated,
            copilotInstructionsUpdated: true,
            syncValidation: validation ? {
              enabled: true,
              isInSync: validation.copilotSync?.isInSync,
              totalFiles: validation.structureCompliance.totalFiles,
              organization: validation.structureCompliance.organization
            } : { enabled: false },
            message: customizationOptions.semanticOrganization ?
              `✅ Memory bank generated with semantic organization at ${memoryBankDir}\n✅ Dynamic Copilot instructions updated\n\nCore files (${coreFilesCreated.length}) at root level, additional files (${additionalFilesCreated.length}) organized semantically. GitHub Copilot now has persistent project knowledge across sessions.` :
              customizationOptions.focusAreas.length > 0 ?
              `✅ Memory bank generated with flat structure at ${memoryBankDir}\n✅ Copilot instructions updated\n\nAll ${createdFiles.length} files created at root level with ${customizationOptions.focusAreas.join(', ')} focus areas integrated into content. GitHub Copilot now has persistent project knowledge across sessions.` :
              `✅ Memory bank generated with flat structure at ${memoryBankDir}\n✅ Copilot instructions updated\n\nAll ${createdFiles.length} files created at root level. GitHub Copilot now has persistent project knowledge across sessions.`
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
            status: 'Memory bank generation failed',
            projectRootPath,
            error: error instanceof Error ? error.message : String(error),
            message: 'Failed to generate memory bank. Please check the project path and permissions.'
          }, null, 2),
        },
      ],
    };
  }
}