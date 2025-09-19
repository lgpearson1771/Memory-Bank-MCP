import fs from 'fs/promises';
import path from 'path';

import type { SemanticFolderInfo } from '../types/sync.js';
import { discoverMemoryBankStructure } from '../utils/fileUtils.js';

/**
 * Creates or updates copilot-instructions.md file with memory bank integration
 * Preserves existing content and appends/updates Memory Bank section
 */
export async function setupCopilotInstructions(
  projectRoot: string,
  options?: { syncValidation?: boolean }
): Promise<void> {
  const githubDir = path.join(projectRoot, '.github');
  const instructionsPath = path.join(githubDir, 'copilot-instructions.md');
  const memoryBankDir = path.join(githubDir, 'memory-bank');
  
  // Ensure .github directory exists
  try {
    await fs.access(githubDir);
  } catch {
    await fs.mkdir(githubDir, { recursive: true });
  }
  
  // Discover existing memory bank structure
  const memoryBankStructure = await discoverMemoryBankStructure(memoryBankDir);
  
  // Generate memory bank section content
  const memoryBankSection = await generateMemoryBankSection(memoryBankStructure, options);
  
  // Check if copilot-instructions.md already exists
  let existingContent = '';
  let fileExists = false;
  
  try {
    existingContent = await fs.readFile(instructionsPath, 'utf8');
    fileExists = true;
  } catch {
    // File doesn't exist, will create new
  }
  
  let finalContent: string;
  
  if (!fileExists) {
    // No existing file - create complete template only if no file exists at all
    finalContent = await generateDynamicCopilotTemplate(memoryBankStructure, options);
  } else if (existingContent.trim() === '') {
    // File exists but is empty - create complete template
    finalContent = await generateDynamicCopilotTemplate(memoryBankStructure, options);
  } else {
    // File exists with content - ALWAYS preserve it and only add/update Memory Bank section
    // Check if we have a Memory Bank section already
    const hasMemoryBankSection = existingContent.includes('# Memory Bank');
    
    if (hasMemoryBankSection) {
      // Check if this is a well-formed Memory Bank section (has generation marker)
      const hasGenerationMarker = existingContent.includes('*Generated:') && existingContent.includes('---');
      
      if (hasGenerationMarker) {
        // Well-formed section - safe to replace
        finalContent = await mergeMemoryBankSection(existingContent, memoryBankSection);
      } else {
        // Malformed section - be conservative and append instead
        finalContent = existingContent + '\n\n' + memoryBankSection;
      }
    } else {
      // Append Memory Bank section to existing content (preserve everything)
      const separator = existingContent.trim() ? '\n\n' : '';
      finalContent = existingContent + separator + memoryBankSection;
    }
  }
  
  // Write the final content
  await fs.writeFile(instructionsPath, finalContent, 'utf8');
}

/**
 * Generate memory bank section content only (without the full template)
 */
async function generateMemoryBankSection(
  structure: {
    coreFiles: string[];
    semanticFolders: SemanticFolderInfo[];
    additionalFiles: string[];
    totalFiles: number;
  },
  options?: { syncValidation?: boolean }
): Promise<string> {
  const timestamp = new Date().toISOString();
  
  let section = `# Memory Bank

I am GitHub Copilot, an expert software engineer with a unique characteristic: my memory resets completely between sessions. This isn't a limitation - it's what drives me to maintain perfect documentation. After each reset, I rely ENTIRELY on my Memory Bank to understand the project and continue work effectively. I MUST read ALL memory bank files at the start of EVERY task - this is not optional.

## Memory Bank Structure

The Memory Bank consists of core files and optional context files, all in Markdown format. Files build upon each other in a clear hierarchy:

\`\`\`mermaid
flowchart TD
    PB[projectbrief.md] --> PC[productContext.md]
    PB --> SP[systemPatterns.md]
    PB --> TC[techContext.md]

    PC --> AC[activeContext.md]
    SP --> AC
    TC --> AC

    AC --> P[progress.md]
\`\`\`

### Core Files (Required)
`;

  // Document core files dynamically
  const coreFileDescriptions: Record<string, string> = {
    'projectbrief.md': 'Foundation document that shapes all other files. Created at project start if it doesn\'t exist. Defines core requirements and goals. Source of truth for project scope.',
    'productContext.md': 'Why this project exists. Problems it solves. How it should work. User experience goals.',
    'activeContext.md': 'Current work focus. Recent changes. Next steps. Active decisions and considerations. Important patterns and preferences. Learnings and project insights.',
    'systemPatterns.md': 'System architecture. Key technical decisions. Design patterns in use. Component relationships. Critical implementation paths.',
    'techContext.md': 'Technologies used. Development setup. Technical constraints. Dependencies. Tool usage patterns.',
    'progress.md': 'What works. What\'s left to build. Current status. Known issues. Evolution of project decisions.'
  };
  
  const allCoreFiles = ['projectbrief.md', 'productContext.md', 'activeContext.md', 'systemPatterns.md', 'techContext.md', 'progress.md'];
  
  for (let i = 0; i < allCoreFiles.length; i++) {
    const fileName = allCoreFiles[i];
    const status = structure.coreFiles.includes(fileName) ? '✅' : '❌';
    section += `${i + 1}. \`${fileName}\` ${status}
   - ${coreFileDescriptions[fileName]}

`;
  }
  
  // Document semantic folders if they exist
  if (structure.semanticFolders.length > 0) {
    section += `### Semantic Organization

This project uses semantic folder organization for additional context:

`;
    
    for (const folder of structure.semanticFolders) {
      section += `#### \`${folder.folderName}/\` (${folder.fileCount} files)
${folder.purpose}
Files: ${folder.files.map(f => `\`${f}\``).join(', ')}

`;
    }
  }
  
  // Document additional files at root level
  if (structure.additionalFiles.length > 0) {
    section += `### Additional Files at Root Level
${structure.additionalFiles.map(f => `- \`${f}\``).join('\n')}

`;
  }
  
  section += `### Memory Bank Statistics
- Total files: ${structure.totalFiles}
- Core files present: ${structure.coreFiles.length}/6
- Semantic folders: ${structure.semanticFolders.length}
- Additional files: ${structure.additionalFiles.length}

`;

  // Add sync validation information if enabled
  if (options?.syncValidation) {
    section += `### Sync Validation
This copilot-instructions.md file is automatically synchronized with the memory bank structure. Last updated: ${timestamp}

`;
  }

  section += `## Core Workflows

### Plan Mode
\`\`\`mermaid
flowchart TD
    Start[Start] --> ReadFiles[Read ALL Memory Bank Files]
    ReadFiles --> CheckFiles{Files Complete?}

    CheckFiles -->|No| Plan[Create Plan]
    Plan --> Document[Document in Chat]

    CheckFiles -->|Yes| Verify[Verify Context]
    Verify --> Strategy[Develop Strategy]
    Strategy --> Present[Present Approach]
\`\`\`

### Act Mode
\`\`\`mermaid
flowchart TD
    Start[Start] --> Context[Check Memory Bank]
    Context --> Update[Update Documentation]
    Update --> Execute[Execute Task]
    Execute --> Document[Document Changes]
\`\`\`

## Documentation Updates

Memory Bank updates occur when:
1. Discovering new project patterns
2. After implementing significant changes
3. When user requests with **update memory bank** (MUST review ALL files)
4. When context needs clarification

\`\`\`mermaid
flowchart TD
    Start[Update Process]

    subgraph Process
        P1[Review ALL Files]
        P2[Document Current State]
        P3[Clarify Next Steps]
        P4[Document Insights & Patterns]

        P1 --> P2 --> P3 --> P4
    end

    Start --> Process
\`\`\`

Note: When triggered by **update memory bank**, I MUST review every memory bank file, even if some don't require updates. Focus particularly on activeContext.md and progress.md as they track current state.

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.

---
*Generated: ${timestamp}*
`;
  
  return section;
}

/**
 * Merge memory bank section into existing copilot-instructions.md content
 */
async function mergeMemoryBankSection(existingContent: string, memoryBankSection: string): Promise<string> {
  // Define memory bank section markers
  const MEMORY_BANK_START_MARKER = '# Memory Bank';
  
  // Check if there's already a Memory Bank section
  const startIndex = existingContent.indexOf(MEMORY_BANK_START_MARKER);
  
  if (startIndex !== -1) {
    // There's already a Memory Bank section - we need to replace it
    // Look for the next major section (starting with # but not ## or ###) or end of file
    let endIndex = existingContent.length;
    
    // Find the next section that starts with # at the beginning of a line (but not ## or ###)
    const remainingContent = existingContent.substring(startIndex + MEMORY_BANK_START_MARKER.length);
    const nextSectionMatch = remainingContent.match(/\n# (?!#)/); // Matches \n# but not \n## or \n###
    
    if (nextSectionMatch && nextSectionMatch.index !== undefined) {
      endIndex = startIndex + MEMORY_BANK_START_MARKER.length + nextSectionMatch.index;
    } else {
      // No clear next section found, but check for generation markers as a fallback
      const generationMarkerMatch = remainingContent.match(/\n---\s*\n\*Generated:/);
      if (generationMarkerMatch && generationMarkerMatch.index !== undefined) {
        // Find the end of that line
        const markerStart = startIndex + MEMORY_BANK_START_MARKER.length + generationMarkerMatch.index;
        const nextLineMatch = existingContent.substring(markerStart).match(/\n/);
        if (nextLineMatch && nextLineMatch.index !== undefined) {
          endIndex = markerStart + nextLineMatch.index + 1;
        }
      }
    }
    
    // Replace the existing Memory Bank section
    const beforeMemoryBank = existingContent.substring(0, startIndex).trimEnd();
    const afterMemoryBank = existingContent.substring(endIndex);
    
    // Add proper spacing
    const spacing = beforeMemoryBank ? '\n\n' : '';
    const afterSpacing = afterMemoryBank.trim() ? '\n\n' : '';
    
    return beforeMemoryBank + spacing + memoryBankSection + afterSpacing + afterMemoryBank;
  }
  
  // No existing Memory Bank section found - this shouldn't happen with our new logic
  // but as a fallback, append at the end
  const separator = existingContent.trim() ? '\n\n' : '';
  return existingContent + separator + memoryBankSection;
}

/**
 * Generate dynamic Copilot instructions template
 */
async function generateDynamicCopilotTemplate(
  structure: {
    coreFiles: string[];
    semanticFolders: SemanticFolderInfo[];
    additionalFiles: string[];
    totalFiles: number;
  },
  options?: { syncValidation?: boolean }
): Promise<string> {
  const timestamp = new Date().toISOString();
  
  let template = `# Memory Bank

I am GitHub Copilot, an expert software engineer with a unique characteristic: my memory resets completely between sessions. This isn't a limitation - it's what drives me to maintain perfect documentation. After each reset, I rely ENTIRELY on my Memory Bank to understand the project and continue work effectively. I MUST read ALL memory bank files at the start of EVERY task - this is not optional.

## Memory Bank Structure

The Memory Bank consists of core files and optional context files, all in Markdown format. Files build upon each other in a clear hierarchy:

\`\`\`mermaid
flowchart TD
    PB[projectbrief.md] --> PC[productContext.md]
    PB --> SP[systemPatterns.md]
    PB --> TC[techContext.md]

    PC --> AC[activeContext.md]
    SP --> AC
    TC --> AC

    AC --> P[progress.md]
\`\`\`

### Core Files (Required)
`;

  // Document core files dynamically
  const coreFileDescriptions: Record<string, string> = {
    'projectbrief.md': 'Foundation document that shapes all other files. Created at project start if it doesn\'t exist. Defines core requirements and goals. Source of truth for project scope.',
    'productContext.md': 'Why this project exists. Problems it solves. How it should work. User experience goals.',
    'activeContext.md': 'Current work focus. Recent changes. Next steps. Active decisions and considerations. Important patterns and preferences. Learnings and project insights.',
    'systemPatterns.md': 'System architecture. Key technical decisions. Design patterns in use. Component relationships. Critical implementation paths.',
    'techContext.md': 'Technologies used. Development setup. Technical constraints. Dependencies. Tool usage patterns.',
    'progress.md': 'What works. What\'s left to build. Current status. Known issues. Evolution of project decisions.'
  };
  
  const allCoreFiles = ['projectbrief.md', 'productContext.md', 'activeContext.md', 'systemPatterns.md', 'techContext.md', 'progress.md'];
  
  for (let i = 0; i < allCoreFiles.length; i++) {
    const fileName = allCoreFiles[i];
    const status = structure.coreFiles.includes(fileName) ? '✅' : '❌';
    template += `${i + 1}. \`${fileName}\` ${status}
   - ${coreFileDescriptions[fileName]}

`;
  }
  
  // Document semantic folders if they exist
  if (structure.semanticFolders.length > 0) {
    template += `### Semantic Organization

This project uses semantic folder organization for additional context:

`;
    
    for (const folder of structure.semanticFolders) {
      template += `#### \`${folder.folderName}/\` (${folder.fileCount} files)
${folder.purpose}
Files: ${folder.files.map(f => `\`${f}\``).join(', ')}

`;
    }
  }
  
  // Document additional files at root level
  if (structure.additionalFiles.length > 0) {
    template += `### Additional Files at Root Level
${structure.additionalFiles.map(f => `- \`${f}\``).join('\n')}

`;
  }
  
  template += `### Memory Bank Statistics
- Total files: ${structure.totalFiles}
- Core files present: ${structure.coreFiles.length}/6
- Semantic folders: ${structure.semanticFolders.length}
- Additional files: ${structure.additionalFiles.length}

`;

  // Add sync validation information if enabled
  if (options?.syncValidation) {
    template += `### Sync Validation
This copilot-instructions.md file is automatically synchronized with the memory bank structure. Last updated: ${timestamp}

`;
  }

  template += `## Core Workflows

### Plan Mode
\`\`\`mermaid
flowchart TD
    Start[Start] --> ReadFiles[Read ALL Memory Bank Files]
    ReadFiles --> CheckFiles{Files Complete?}

    CheckFiles -->|No| Plan[Create Plan]
    Plan --> Document[Document in Chat]

    CheckFiles -->|Yes| Verify[Verify Context]
    Verify --> Strategy[Develop Strategy]
    Strategy --> Present[Present Approach]
\`\`\`

### Act Mode
\`\`\`mermaid
flowchart TD
    Start[Start] --> Context[Check Memory Bank]
    Context --> Update[Update Documentation]
    Update --> Execute[Execute Task]
    Execute --> Document[Document Changes]
\`\`\`

## Documentation Updates

Memory Bank updates occur when:
1. Discovering new project patterns
2. After implementing significant changes
3. When user requests with **update memory bank** (MUST review ALL files)
4. When context needs clarification

\`\`\`mermaid
flowchart TD
    Start[Update Process]

    subgraph Process
        P1[Review ALL Files]
        P2[Document Current State]
        P3[Clarify Next Steps]
        P4[Document Insights & Patterns]

        P1 --> P2 --> P3 --> P4
    end

    Start --> Process
\`\`\`

Note: When triggered by **update memory bank**, I MUST review every memory bank file, even if some don't require updates. Focus particularly on activeContext.md and progress.md as they track current state.

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.

---
*Generated: ${timestamp}*
`;
  
  return template;
}