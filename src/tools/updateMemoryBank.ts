/**
 * Update Memory Bank Tool - Full Project Analysis and Update
 * Works identically to generate_memory_bank but for existing memory bank files
 */

import { analyzeProject } from '../core/projectAnalysis.js';

export const updateMemoryBankTool = {
  name: 'update_memory_bank',
  description: 'Update existing memory bank files with current project information. Performs full project analysis and provides instructions for AI assistant to update all 6 memory bank files.',
  inputSchema: {
    type: 'object',
    properties: {
      projectRootPath: {
        type: 'string',
        description: 'Root folder path containing the .github/memory-bank folder',
      }
    },
    required: ['projectRootPath']
  }
};

export async function handleUpdateMemoryBank(args: any) {
  const projectRootPath = args.projectRootPath;
  
  try {
    // Perform full project analysis (identical to generate_memory_bank)
    const analysis = await analyzeProject(projectRootPath);

    return {
      content: [{
        type: 'text',
        text: `# Memory Bank Update Instructions 🔄

## Task: Update Existing Memory Bank Files

Please update all 6 memory bank files in the \`.github/memory-bank/\` directory with current project information:

**Project Analysis Summary:**
- **Name**: ${analysis.projectName}
- **Type**: ${analysis.projectType}
- **Technologies**: ${analysis.frameworks.join(', ')}
- **Files**: ${analysis.structure.estimatedFiles} files
- **Complexity**: ${analysis.structure.complexity}
- **Location**: \`${projectRootPath}\`

## Files to Update:

### 1. \`projectbrief.md\`
**Purpose**: Foundation document that shapes all other files
**Content**: 
- Project's core purpose and business value (be specific to THIS project)
- Main features and capabilities (reference actual implementations)
- Architecture overview with key design decisions
- Technology rationale and development approach
- **Requirements**: Reference actual files, functions, and implementations from the codebase

### 2. \`productContext.md\`
**Purpose**: Why this project exists and its business value
**Content**:
- Specific business problems this system solves
- Primary users and stakeholders
- Business processes it enables or improves
- Key business benefits and competitive advantages
- **Requirements**: Focus on business impact and stakeholder value

### 3. \`techContext.md\`
**Purpose**: Technologies used and technical implementation
**Content**:
- Development setup and technical constraints
- Dependencies and tool usage patterns
- Build & deployment processes
- Integration points and external systems
- **Requirements**: Include specific configuration details and technical decisions

### 4. \`systemPatterns.md\`
**Purpose**: System architecture and design patterns
**Content**:
- Key technical decisions and design patterns in use
- Component relationships and critical implementation paths
- Code organization and architectural patterns
- Development practices and conventions
- **Requirements**: Reference specific files and code examples

### 5. \`activeContext.md\`
**Purpose**: Current work focus and development state
**Content**:
- Current work focus and recent changes
- Next steps and active decisions
- Important patterns and preferences
- Learnings and project insights
- **Requirements**: Base on observable evidence from codebase

### 6. \`progress.md\`
**Purpose**: Project status and development tracking
**Content**:
- What works and what's left to build
- Current status and known issues
- Evolution of project decisions
- Development milestones and future roadmap
- **Requirements**: Focus on current state and next priorities

## Instructions:

1. **Read the existing memory bank files** to understand current content
2. **Read the project files** to understand the codebase structure and implementation
3. **Update each file** with current, accurate project information
4. **Be project-specific**: Reference actual files, functions, and technical details
5. **Replace placeholder content**: Update any sections with "TODO", "not implemented", "not sure", "[TBD]", or similar placeholder text with actual project information
6. **Maintain professional quality**: Use enterprise-grade language and structure

## Quality Standards:
- **Professional tone** suitable for enterprise documentation
- **Specific references** to actual code files and implementations
- **Technical accuracy** based on actual project structure
- **Business context** relevant to this specific project
- **Current information**: Reflect the latest state of the project
- **Complete content**: Replace any placeholder text like "TODO", "not implemented", "TBD", or "not sure" with actual project details

After updating the files, also run the \`setup_copilot_instructions\` tool to configure AI assistant integration.

---

**Next Step**: Please read the existing memory bank files and current project files, then update all 6 memory bank files with comprehensive, current project information.`
      }]
    };

  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `# Memory Bank Update Error\n\n**Error**: ${error.message}\n\nPlease check the project path and try again.`
      }],
      isError: true
    };
  }
}