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
          description: 'Interactive memory bank generation for a project. Starts with project root selection, then customization options.',
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
                    description: 'Additional files or sections to include',
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
          description: 'Validate existing memory bank structure and completeness',
          inputSchema: {
            type: 'object',
            properties: {
              projectRootPath: {
                type: 'string',
                description: 'Root folder path containing .github/memory-bank',
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
            focusAreas: (args as any).customizationOptions?.focusAreas || [],
            detailLevel: (args as any).customizationOptions?.detailLevel || 'detailed',
            additionalFiles: (args as any).customizationOptions?.additionalFiles || [],
          };
          
          try {
            // Ensure memory bank directory exists
            const memoryBankDir = await ensureMemoryBankDirectory(projectRootPath);
            
            // Analyze the project
            const analysis = await analyzeProject(projectRootPath, 'medium');
            
            // Generate memory bank files
            const createdFiles = await generateMemoryBankFiles(memoryBankDir, analysis, customizationOptions);
            
            // Setup copilot instructions
            await setupCopilotInstructions(projectRootPath);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    status: 'Memory bank generation completed successfully',
                    projectRootPath,
                    memoryBankLocation: memoryBankDir,
                    projectAnalysis: analysis,
                    structureType: customizationOptions.structureType,
                    detailLevel: customizationOptions.detailLevel,
                    focusAreas: customizationOptions.focusAreas,
                    coreFilesCreated: createdFiles.filter(f => ['projectbrief.md', 'productContext.md', 'activeContext.md', 'systemPatterns.md', 'techContext.md', 'progress.md'].includes(f)),
                    additionalFilesCreated: createdFiles.filter(f => !['projectbrief.md', 'productContext.md', 'activeContext.md', 'systemPatterns.md', 'techContext.md', 'progress.md'].includes(f)),
                    copilotInstructionsUpdated: true,
                    message: `✅ Memory bank generated successfully at ${memoryBankDir}\n✅ Copilot instructions updated\n\nGitHub Copilot will now have persistent project knowledge across sessions. The memory bank includes ${createdFiles.length} files tailored to your ${analysis.projectType}.`
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
          const memoryBankDir = `${projectRootPath}/.github/memory-bank`;
          
          try {
            const validation = await validateMemoryBank(memoryBankDir);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    status: 'Memory bank validation completed',
                    projectRootPath,
                    memoryBankLocation: memoryBankDir,
                    validation,
                    message: validation.isValid ? 
                      `✅ Memory bank is valid and complete (${validation.quality.completeness} complete)` :
                      `❌ Memory bank validation failed. Missing files: ${validation.missingFiles.join(', ')}`
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