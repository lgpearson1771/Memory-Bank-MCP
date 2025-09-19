/**
 * Tools Index
 * Exports all MCP tools and their handlers
 */

// Tool definitions and handlers
import { generateMemoryBankTool } from './generateMemoryBank.js';
import { updateMemoryBankTool, handleUpdateMemoryBank } from './updateMemoryBank.js';
import { analyzeProjectStructureTool, handleAnalyzeProjectStructure } from './analyzeProjectStructure.js';
import { validateMemoryBankTool, handleValidateMemoryBank } from './validateMemoryBank.js';
import { setupCopilotInstructionsTool, handleSetupCopilotInstructions } from './setupCopilotInstructions.js';

// Re-export everything
export { generateMemoryBankTool } from './generateMemoryBank.js';
export { updateMemoryBankTool, handleUpdateMemoryBank } from './updateMemoryBank.js';
export { analyzeProjectStructureTool, handleAnalyzeProjectStructure } from './analyzeProjectStructure.js';
export { validateMemoryBankTool, handleValidateMemoryBank } from './validateMemoryBank.js';
export { setupCopilotInstructionsTool, handleSetupCopilotInstructions } from './setupCopilotInstructions.js';

// Collect all tools for easy export
export const allTools = [
  generateMemoryBankTool,
  updateMemoryBankTool,
  analyzeProjectStructureTool,
  validateMemoryBankTool,
  setupCopilotInstructionsTool
];

// Collect all handlers for easy export
export const toolHandlers = {
  'generate_memory_bank': generateMemoryBankTool.handler,
  'update_memory_bank': handleUpdateMemoryBank,
  'analyze_project_structure': handleAnalyzeProjectStructure,
  'validate_memory_bank': handleValidateMemoryBank,
  'setup_copilot_instructions': handleSetupCopilotInstructions
};