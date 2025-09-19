/**
 * Update Memory Bank Tool - Simplified Instructions
 * Provides analysis and clear instructions for AI assistant to update existing memory bank files
 */

import { analyzeProject } from '../core/projectAnalysis.js';

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
    // Analyze the project to provide context for updates
    const analysis = await analyzeProject(projectRootPath);

    return {
      content: [{
        type: 'text',
        text: `# Memory Bank Update Instructions 🔄

## Task: Update Existing Memory Bank Files

Please update the memory bank files in the \`.github/memory-bank/\` directory based on current project state:

**Project Analysis Summary:**
- **Name**: ${analysis.projectName}
- **Type**: ${analysis.projectType}
- **Technologies**: ${analysis.frameworks.join(', ')}
- **Files**: ${analysis.structure.estimatedFiles} files
- **Complexity**: ${analysis.structure.complexity}
- **Location**: \`${projectRootPath}\`
- **Update Type**: ${updateType}

## Update Instructions:

### ${updateType === 'full-refresh' ? 'Full Refresh' : updateType === 'specific-files' ? 'Specific Files' : 'Incremental Update'}

${updateType === 'full-refresh' ? `
**Task**: Completely regenerate all 6 memory bank files with current project state.

1. **Read current project files** to understand latest changes
2. **Update all files**: projectbrief.md, productContext.md, techContext.md, systemPatterns.md, activeContext.md, progress.md
3. **Focus on**: Recent changes, new features, updated architecture
` : updateType === 'specific-files' ? `
**Task**: Update only these specific files: ${specificFiles.join(', ')}

1. **Read current project files** to understand latest changes
2. **Update only**: ${specificFiles.join(', ')}
3. **Preserve**: Content in other files unchanged
` : `
**Task**: Update commonly changing files with recent project activity.

1. **Read current project files** to understand latest changes
2. **Update these files**: activeContext.md, progress.md, systemPatterns.md
3. **Focus on**: Recent development activity, current work, new patterns
`}

## Files to Update:

### Files that commonly need updates:
- **activeContext.md**: Current work focus and recent changes
- **progress.md**: Development status and next steps
- **systemPatterns.md**: New patterns and architectural decisions

### Files that rarely change:
- **projectbrief.md**: Core project purpose (update if major changes)
- **productContext.md**: Business context (update if requirements changed)
- **techContext.md**: Technology stack (update if dependencies changed)

## Quality Standards:
- **Maintain consistency** with existing content style
- **Focus on changes** since last update
- **Be project-specific** with real examples from current codebase
- **Professional tone** suitable for enterprise documentation

## Instructions:

1. **Read the current memory bank files** to understand existing content
2. **Read recent project changes** to identify what needs updating
3. **Update the specified files** with current, accurate information
4. **Maintain file quality** and professional tone

After updating the files, run the \`setup_copilot_instructions\` tool to ensure AI assistant integration is current.

---

**Next Step**: Please read the current memory bank and project files, then update the specified files with current project information.`
      }]
    };

  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `# Memory Bank Update Error\n\n**Error**: ${error.message}\n\nPlease check the project path and memory bank existence, then try again.`
      }],
      isError: true
    };
  }
}