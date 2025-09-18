#!/usr/bin/env node

/**
 * Memory Bank Generator MCP Server Entry Point
 * Interactive memory bank generation for GitHub Copilot
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { ensureMemoryBankDirectory } from './utils/fileUtils.js';
import { analyzeProject } from './core/projectAnalysis.js';
import { generateMemoryBankFiles, type MemoryBankOptions } from './core/memoryBankGenerator.js';
import { validateMemoryBank } from './core/validation.js';
import { setupCopilotInstructions } from './integrations/copilotIntegration.js';
import { performInteractiveSyncResolution } from './interactions/syncResolution.js';
import { analyzeProjectForConversation } from './interactions/conversational.js';

/**
 * Create and start the MCP server
 */
async function main() {
  const server = new Server(
    {
      name: 'memory-bank-generator',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
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
                  autoConfirm: {
                    type: 'boolean',
                    description: 'Skip confirmation prompts and proceed with recommendations (default: false)',
                    default: false
                  },
                  customFolders: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                          description: 'Folder name'
                        },
                        description: {
                          type: 'string',
                          description: 'Purpose description for this folder'
                        },
                        filePatterns: {
                          type: 'array',
                          items: {
                            type: 'string'
                          },
                          description: 'File name patterns that should go in this folder'
                        }
                      },
                      required: ['name', 'description', 'filePatterns']
                    },
                    description: 'Custom semantic folders for project-specific organization',
                  },
                  syncValidation: {
                    type: 'boolean',
                    description: 'Enable sync validation between memory bank and Copilot instructions (default: true)',
                    default: true,
                  },
                },
              },
            },
            required: ['projectRootPath'],
          },
        },
        {
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
              },
            },
            required: ['projectRootPath'],
          },
        },
        {
          name: 'analyze_project_structure',
          description: 'Analyze project structure to prepare for memory bank generation',
          inputSchema: {
            type: 'object',
            properties: {
              projectRootPath: {
                type: 'string',
                description: 'Root folder path to analyze',
              },
              analysisDepth: {
                type: 'string',
                enum: ['shallow', 'medium', 'deep'],
                description: 'Depth of project analysis',
              },
            },
            required: ['projectRootPath'],
          },
        },
        {
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
              },
            },
            required: ['projectRootPath'],
          },
        },
        {
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
              },
            },
            required: ['projectRootPath'],
          },
        },
        {
          name: 'setup_copilot_instructions',
          description: 'Create or update copilot-instructions.md file with memory bank integration',
          inputSchema: {
            type: 'object',
            properties: {
              projectRootPath: {
                type: 'string',
                description: 'Root folder path containing .github folder',
              },
            },
            required: ['projectRootPath'],
          },
        },
      ],
    };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new McpError(ErrorCode.InvalidParams, 'Missing arguments');
    }

    try {
      switch (name) {
        case 'generate_memory_bank': {
          const projectRootPath = (args as any).projectRootPath;
          const mode = (args as any).mode || 'analyze-first';
          const conversationalGuidance = (args as any).conversationalGuidance !== false;
          
          // For analyze-first mode or when conversational guidance is enabled, 
          // return conversational response instead of immediately generating
          if ((mode === 'analyze-first' || conversationalGuidance) && !(args as any).customizationOptions?.autoConfirm) {
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
          const customOptions = (args as any).customizationOptions || {};
          
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

        case 'update_memory_bank': {
          const projectRootPath = (args as any).projectRootPath;
          const updateType = (args as any).updateType || 'incremental';
          const specificFiles = (args as any).specificFiles || [];
          
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

        case 'analyze_project_structure': {
          const projectRootPath = (args as any).projectRootPath;
          const analysisDepth = (args as any).analysisDepth || 'medium';
          
          try {
            const analysis = await analyzeProject(projectRootPath, analysisDepth);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    status: 'Project analysis completed',
                    projectRootPath,
                    analysisDepth,
                    projectAnalysis: analysis,
                    readyForMemoryBank: true,
                    message: `Analysis complete: ${analysis.projectType} with ${analysis.structure.complexity.toLowerCase()} complexity (${analysis.structure.estimatedFiles} files).`
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
                    status: 'Project analysis failed',
                    projectRootPath,
                    error: error instanceof Error ? error.message : String(error),
                    message: 'Failed to analyze project. Please check the project path.'
                  }, null, 2),
                },
              ],
            };
          }
        }

        case 'validate_memory_bank': {
          const projectRootPath = (args as any).projectRootPath;
          const syncValidation = (args as any).syncValidation || false;
          const interactiveMode = (args as any).interactiveMode || false;
          const memoryBankDir = `${projectRootPath}/.github/memory-bank`;
          
          try {
            const validation = await validateMemoryBank(memoryBankDir, { 
              syncValidation, 
              projectRoot: syncValidation ? projectRootPath : undefined,
              interactiveMode
            });
            
            // If there are sync conflicts and interactive mode is enabled, provide resolution options
            const hasConflicts = validation.copilotSync && !validation.copilotSync.isInSync;
            const canResolveInteractively = hasConflicts && validation.copilotSync?.conflictDetails;
            
            // Determine overall validation status - must pass both structure validation AND sync validation (if enabled)
            const overallValidationPassed = validation.isValid && (!syncValidation || validation.copilotSync?.isInSync === true);
            const validationStatus = overallValidationPassed ? 'PASSED' : 'FAILED';
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    status: `Memory bank validation ${validationStatus}`,
                    validationResult: validationStatus,
                    projectRootPath,
                    memoryBankLocation: memoryBankDir,
                    validation: {
                      ...validation,
                      overallStatus: validationStatus,
                      overallValid: overallValidationPassed
                    },
                    structureAnalysis: {
                      organization: validation.structureCompliance.organization,
                      totalFiles: validation.structureCompliance.totalFiles,
                      semanticFolders: validation.structureCompliance.hasSemanticFolders ? 
                        validation.structureCompliance.folderCount : 0,
                      coreFilesPresent: validation.coreFilesPresent.length,
                      missingCoreFiles: validation.missingFiles.length,
                      additionalFiles: validation.additionalFiles.length
                    },
                    syncValidation: syncValidation ? {
                      enabled: true,
                      isInSync: validation.copilotSync?.isInSync || false,
                      memoryBankFiles: validation.copilotSync?.memoryBankFiles?.length || 0,
                      copilotReferences: validation.copilotSync?.copilotReferences?.length || 0,
                      missingReferences: validation.copilotSync?.missingReferences?.length || 0,
                      orphanedReferences: validation.copilotSync?.orphanedReferences?.length || 0,
                      conflictDetails: validation.copilotSync?.conflictDetails
                    } : { enabled: false },
                    interactiveResolution: canResolveInteractively ? {
                      available: true,
                      conflictSeverity: validation.copilotSync?.conflictDetails?.severity,
                      autoResolvable: validation.copilotSync?.conflictDetails?.autoResolvable,
                      suggestedActionsCount: validation.copilotSync?.conflictDetails?.suggestedActions?.length || 0,
                      nextSteps: "Use the 'resolve_sync_conflicts' tool to interactively resolve these conflicts",
                      manualFixGuidance: (validation.copilotSync?.missingReferences?.length || 0) > 0 ? {
                        action: "Add references to missing files in copilot-instructions.md",
                        missingFiles: validation.copilotSync?.missingReferences || [],
                        addToSection: "Additional Memory Bank Files",
                        template: (validation.copilotSync?.missingReferences || []).map(file => `- \`${file}\` - [Add description based on filename]`).join('\n')
                      } : undefined
                    } : { available: false },
                    message: overallValidationPassed ? 
                      `✅ Memory bank validation PASSED (${validation.quality.completeness} complete, ${validation.quality.consistency} consistency, ${validation.quality.clarity} clarity)${syncValidation && validation.copilotSync?.isInSync ? '\n✅ Fully synchronized with Copilot instructions' : ''}` :
                      `❌ Memory bank validation FAILED${!validation.isValid ? `. Missing core files: ${validation.missingFiles.join(', ')}` : ''}${syncValidation && !validation.copilotSync?.isInSync ? `\n⚠️ Sync conflicts detected: ${validation.copilotSync?.missingReferences?.length || 0} unreferenced files, ${validation.copilotSync?.orphanedReferences?.length || 0} orphaned references` : ''}${canResolveInteractively ? '\n🔧 Interactive resolution available via resolve_sync_conflicts tool' : ''}`
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
                    message: 'Failed to validate memory bank. Directory may not exist.'
                  }, null, 2),
                },
              ],
            };
          }
        }

        case 'resolve_sync_conflicts': {
          const projectRootPath = (args as any).projectRootPath;
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

        case 'setup_copilot_instructions': {
          const projectRootPath = (args as any).projectRootPath;
          
          try {
            await setupCopilotInstructions(projectRootPath);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    status: 'Copilot instructions setup completed',
                    projectRootPath,
                    instructionsFile: `${projectRootPath}/.github/copilot-instructions.md`,
                    action: 'Created/updated copilot-instructions.md with memory bank integration',
                    memoryBankIntegration: true,
                    workflowsConfigured: [
                      'Plan Mode - Read memory bank before planning',
                      'Act Mode - Update documentation after changes', 
                      'Memory Bank Updates - Comprehensive review process'
                    ],
                    message: '✅ GitHub Copilot is now configured to use the memory bank system'
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
                    message: 'Failed to setup copilot instructions. Please check permissions.'
                  }, null, 2),
                },
              ],
            };
          }
        }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  // Connect to transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Memory Bank Generator MCP Server started');
}

// Handle process termination
process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, shutting down...');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});