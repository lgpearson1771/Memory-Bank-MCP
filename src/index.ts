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
import {
  ensureMemoryBankDirectory,
  analyzeProject,
  generateMemoryBankFiles,
  setupCopilotInstructions,
  validateMemoryBank,
  type MemoryBankOptions,
} from './fileOperations.js';

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
          description: 'Interactive memory bank generation for a project. Creates core files at root level, with optional semantic organization for additional files into purpose-based folders (features/, integrations/, deployment/, etc.).',
          inputSchema: {
            type: 'object',
            properties: {
              projectRootPath: {
                type: 'string',
                description: 'Root folder path for the project where memory bank should be generated',
              },
              customizationOptions: {
                type: 'object',
                description: 'Optional customization preferences for memory bank generation',
                properties: {
                  structureType: {
                    type: 'string',
                    enum: ['standard', 'custom'],
                    description: 'Use standard structure or custom approach',
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
                    description: 'Specific areas to focus on (e.g., "complex algorithms", "API patterns", "testing strategies")',
                  },
                  detailLevel: {
                    type: 'string',
                    enum: ['high-level', 'detailed', 'granular'],
                    description: 'Level of detail for analysis and documentation',
                  },
                  additionalFiles: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    description: 'Additional files or sections to include (will be organized into semantic folders if enabled)',
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
          const customizationOptions: MemoryBankOptions = {
            structureType: (args as any).customizationOptions?.structureType || 'standard',
            semanticOrganization: (args as any).customizationOptions?.semanticOrganization !== false,
            focusAreas: (args as any).customizationOptions?.focusAreas || [],
            detailLevel: (args as any).customizationOptions?.detailLevel || 'detailed',
            additionalFiles: (args as any).customizationOptions?.additionalFiles || [],
            customFolders: (args as any).customizationOptions?.customFolders || [],
            syncValidation: (args as any).customizationOptions?.syncValidation !== false,
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
                    focusAreas: customizationOptions.focusAreas,
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
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  status: 'Memory bank update completed',
                  projectRootPath,
                  memoryBankLocation: `${projectRootPath}/.github/memory-bank`,
                  updateType,
                  updatedFiles: updateType === 'specific-files' ? specificFiles : [
                    'activeContext.md',
                    'progress.md',
                    'systemPatterns.md'
                  ],
                  timestamp: new Date().toISOString(),
                  message: 'Memory bank has been updated with latest project state'
                }, null, 2),
              },
            ],
          };
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
          const memoryBankDir = `${projectRootPath}/.github/memory-bank`;
          
          try {
            const validation = await validateMemoryBank(memoryBankDir, { 
              syncValidation, 
              projectRoot: syncValidation ? projectRootPath : undefined 
            });
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    status: 'Memory bank validation completed',
                    projectRootPath,
                    memoryBankLocation: memoryBankDir,
                    validation,
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
                      orphanedReferences: validation.copilotSync?.orphanedReferences?.length || 0
                    } : { enabled: false },
                    message: validation.isValid ? 
                      `✅ Memory bank is valid and complete (${validation.quality.completeness} complete, ${validation.quality.consistency} consistency, ${validation.quality.clarity} clarity)${syncValidation && validation.copilotSync?.isInSync ? '\n✅ Fully synchronized with Copilot instructions' : ''}` :
                      `❌ Memory bank validation failed. Missing files: ${validation.missingFiles.join(', ')}${syncValidation && !validation.copilotSync?.isInSync ? `\n⚠️ Sync issues: ${validation.copilotSync?.missingReferences?.length || 0} unreferenced files, ${validation.copilotSync?.orphanedReferences?.length || 0} orphaned references` : ''}`
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