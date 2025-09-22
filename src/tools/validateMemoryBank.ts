/**
 * Validate Memory Bank Tool - Simplified Response Format
 * Validate existing memory bank structure, completeness, and optionally sync with Copilot instructions
 */

import { join } from 'path';
import { validateMemoryBank, ValidationResult } from '../core/validation.js';

interface SimpleValidationIssue {
  type: 'missing_file' | 'missing_copilot_integration';
  file: string;
  message: string;
}

interface SimpleValidationResult {
  status: 'valid' | 'invalid';
  issues: SimpleValidationIssue[];
  summary: string;
  fileCount: number;
  copilotIntegration: boolean;
}

/**
 * Transform complex validation data to simple issue list
 */
function transformToSimpleIssues(validation: ValidationResult): SimpleValidationIssue[] {
  const issues: SimpleValidationIssue[] = [];

  // Add missing file issues
  validation.missingFiles.forEach(fileName => {
    issues.push({
      type: 'missing_file',
      file: fileName,
      message: `Required memory bank file '${fileName}' is missing`
    });
  });

  // Note: We don't check for empty files - files will be updated anyway

  // Add copilot integration issues
  if (validation.copilotSync && !validation.copilotSync.isInSync) {
    issues.push({
      type: 'missing_copilot_integration',
      file: 'copilot-instructions.md',
      message: 'Memory bank is not properly integrated with copilot-instructions.md'
    });
  }

  return issues;
}

/**
 * Create clear, actionable summary message
 */
function generateHumanReadableSummary(validation: ValidationResult): string {
  if (!validation.isValid) {
    const missingCount = validation.missingFiles.length;
    if (missingCount === 6) {
      return '❌ No memory bank files found. Use generate_memory_bank to create initial memory bank.';
    } else if (missingCount > 0) {
      return `⚠️ Memory bank incomplete: ${missingCount} of 6 required files missing.`;
    } else {
      return '⚠️ Memory bank files exist but have validation issues.';
    }
  }

  if (validation.copilotSync?.isInSync === false) {
    return '⚠️ Memory bank is complete but not synced with copilot-instructions.md. Run setup_copilot_instructions to fix.';
  }

  return '✅ Memory bank is complete and properly integrated.';
}

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
      }
    },
    required: ['projectRootPath']
  }
};

export async function handleValidateMemoryBank(args: any) {
  const projectRootPath = args.projectRootPath;
  // Always enable copilot sync validation
  const syncValidation = true;
  
  try {
    // Construct the correct memory bank path
    const memoryBankPath = join(projectRootPath, '.github', 'memory-bank');
    
    const validation = await validateMemoryBank(memoryBankPath, {
      syncValidation,
      projectRoot: projectRootPath
    });

    // Transform complex validation result into simple, actionable format
    const simpleResult: SimpleValidationResult = {
      status: validation.isValid ? 'valid' : 'invalid',
      issues: transformToSimpleIssues(validation),
      summary: generateHumanReadableSummary(validation),
      fileCount: validation.coreFilesPresent.length,
      copilotIntegration: validation.copilotSync?.isInSync || false
    };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(simpleResult, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorResult: SimpleValidationResult = {
      status: 'invalid',
      issues: [{
        type: 'missing_file',
        file: 'memory-bank',
        message: error instanceof Error ? error.message : 'Failed to access memory bank directory'
      }],
      summary: '❌ Unable to validate memory bank. Check if project path exists and contains .github/memory-bank directory.',
      fileCount: 0,
      copilotIntegration: false
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(errorResult, null, 2),
        },
      ],
    };
  }
}