/**
 * Integration tests for Copilot instructions append functionality
 * Tests that existing copilot-instructions.md content is preserved
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { setupCopilotInstructions } from '../../src/integrations/copilotIntegration.js';
import { ensureMemoryBankDirectory } from '../../src/utils/fileUtils.js';
import { generateMemoryBankFiles } from '../../src/core/memoryBankGenerator.js';
import { analyzeProject } from '../../src/core/projectAnalysis.js';

describe('Copilot Instructions Append Integration Tests', () => {
  const testProjectRoot = path.join(process.cwd(), 'temp', 'test-copilot-append');
  const githubDir = path.join(testProjectRoot, '.github');
  const copilotInstructionsPath = path.join(githubDir, 'copilot-instructions.md');
  const memoryBankDir = path.join(githubDir, 'memory-bank');

  beforeEach(async () => {
    // Clean up and create test directory
    try {
      await fs.rm(testProjectRoot, { recursive: true, force: true });
    } catch {
      // Directory might not exist
    }
    await fs.mkdir(testProjectRoot, { recursive: true });
    await fs.mkdir(githubDir, { recursive: true });
    
    // Create a basic package.json for project analysis
    const packageJson = {
      name: 'test-project',
      version: '1.0.0',
      description: 'Test project for copilot instructions append functionality',
      main: 'index.js',
      dependencies: {
        'express': '^4.18.0'
      },
      devDependencies: {
        'typescript': '^5.0.0',
        'jest': '^29.0.0'
      },
      scripts: {
        'start': 'node index.js',
        'test': 'jest',
        'build': 'tsc'
      }
    };
    
    await fs.writeFile(
      path.join(testProjectRoot, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testProjectRoot, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('New File Creation', () => {
    it('should create new copilot-instructions.md when none exists', async () => {
      // Create memory bank first
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'standard',
        focusAreas: [],
        detailLevel: 'detailed',
        additionalFiles: []
      });

      // Setup copilot instructions
      await setupCopilotInstructions(testProjectRoot);

      // Verify file was created
      const exists = await fs.access(copilotInstructionsPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      const content = await fs.readFile(copilotInstructionsPath, 'utf8');
      expect(content).toContain('# Memory Bank');
      expect(content).toContain('## Memory Bank Structure');
      expect(content).toContain('## Core Workflows');
      expect(content).toContain('projectbrief.md');
      expect(content).toContain('Generated:');
    });
  });

  describe('Existing Content Preservation', () => {
    it('should preserve existing content when appending Memory Bank section', async () => {
      const existingContent = `# My Custom Copilot Instructions

This is my custom configuration for GitHub Copilot.

## Custom Rules
1. Always use TypeScript
2. Follow ESLint configuration
3. Write comprehensive tests

## Project Specific Guidelines
- Use functional components in React
- Implement proper error handling
- Document all public APIs

Remember to follow our coding standards!
`;

      // Write existing copilot instructions
      await fs.writeFile(copilotInstructionsPath, existingContent);

      // Create memory bank
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'standard',
        focusAreas: [],
        detailLevel: 'detailed',
        additionalFiles: []
      });

      // Setup copilot instructions (should append, not override)
      await setupCopilotInstructions(testProjectRoot);

      const finalContent = await fs.readFile(copilotInstructionsPath, 'utf8');

      // Verify original content is preserved
      expect(finalContent).toContain('# My Custom Copilot Instructions');
      expect(finalContent).toContain('This is my custom configuration for GitHub Copilot.');
      expect(finalContent).toContain('## Custom Rules');
      expect(finalContent).toContain('Always use TypeScript');
      expect(finalContent).toContain('Follow ESLint configuration');
      expect(finalContent).toContain('## Project Specific Guidelines');
      expect(finalContent).toContain('Use functional components in React');
      expect(finalContent).toContain('Remember to follow our coding standards!');

      // Verify Memory Bank section was added
      expect(finalContent).toContain('# Memory Bank');
      expect(finalContent).toContain('## Memory Bank Structure');
      expect(finalContent).toContain('## Core Workflows');
      expect(finalContent).toContain('projectbrief.md');

      // Verify proper separation
      expect(finalContent.indexOf('# Memory Bank')).toBeGreaterThan(
        finalContent.indexOf('Remember to follow our coding standards!')
      );
    });

    it('should update existing Memory Bank section without affecting other content', async () => {
      const existingContent = `# Project Instructions

Custom project setup and guidelines.

# Memory Bank

Old memory bank content that should be replaced.

## Old Structure
This is outdated information.

---
*Generated: 2023-01-01T00:00:00.000Z*

# Additional Instructions

More custom content that should be preserved.
`;

      // Write existing copilot instructions with old Memory Bank section
      await fs.writeFile(copilotInstructionsPath, existingContent);

      // Create memory bank
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'enhanced',
        focusAreas: ['api', 'testing'],
        detailLevel: 'detailed',
        additionalFiles: ['api', 'testing']
      });

      // Setup copilot instructions (should update Memory Bank section)
      await setupCopilotInstructions(testProjectRoot, { syncValidation: true });

      const finalContent = await fs.readFile(copilotInstructionsPath, 'utf8');

      // Verify custom content before and after is preserved
      expect(finalContent).toContain('# Project Instructions');
      expect(finalContent).toContain('Custom project setup and guidelines.');
      expect(finalContent).toContain('# Additional Instructions');
      expect(finalContent).toContain('More custom content that should be preserved.');

      // Verify old Memory Bank content was replaced
      expect(finalContent).not.toContain('Old memory bank content');
      expect(finalContent).not.toContain('## Old Structure');
      expect(finalContent).not.toContain('This is outdated information.');
      expect(finalContent).not.toContain('2023-01-01T00:00:00.000Z');

      // Verify new Memory Bank content is present
      expect(finalContent).toContain('# Memory Bank');
      expect(finalContent).toContain('## Memory Bank Structure');
      expect(finalContent).toContain('## Core Workflows');
      expect(finalContent).toContain('projectbrief.md');
      expect(finalContent).toContain('Sync Validation');
      expect(finalContent).toMatch(/Generated: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // Verify content order is maintained
      const projectInstructionsIndex = finalContent.indexOf('# Project Instructions');
      const memoryBankIndex = finalContent.indexOf('# Memory Bank');
      const additionalInstructionsIndex = finalContent.indexOf('# Additional Instructions');

      expect(projectInstructionsIndex).toBeLessThan(memoryBankIndex);
      expect(memoryBankIndex).toBeLessThan(additionalInstructionsIndex);
    });
  });

  describe('Empty File Handling', () => {
    it('should handle empty existing file by creating complete template', async () => {
      // Create empty file
      await fs.writeFile(copilotInstructionsPath, '');

      // Create memory bank
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'standard',
        focusAreas: [],
        detailLevel: 'detailed',
        additionalFiles: []
      });

      // Setup copilot instructions
      await setupCopilotInstructions(testProjectRoot);

      const content = await fs.readFile(copilotInstructionsPath, 'utf8');
      expect(content.trim()).not.toBe('');
      expect(content).toContain('# Memory Bank');
      expect(content).toContain('## Memory Bank Structure');
    });

    it('should handle whitespace-only existing file', async () => {
      // Create file with only whitespace
      await fs.writeFile(copilotInstructionsPath, '   \n\t  \n  ');

      // Create memory bank
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'standard',
        focusAreas: [],
        detailLevel: 'detailed',
        additionalFiles: []
      });

      // Setup copilot instructions
      await setupCopilotInstructions(testProjectRoot);

      const content = await fs.readFile(copilotInstructionsPath, 'utf8');
      expect(content).toContain('# Memory Bank');
      expect(content).toContain('## Memory Bank Structure');
    });
  });

  describe('Semantic Organization Integration', () => {
    it('should properly document semantic folders in appended content', async () => {
      const existingContent = `# Custom Instructions

My existing project instructions.

## Important Notes
- Follow code standards
- Use proper error handling
`;

      await fs.writeFile(copilotInstructionsPath, existingContent);

      // Create memory bank with semantic organization
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'enhanced',
        focusAreas: ['api', 'testing', 'deployment'],
        detailLevel: 'detailed',
        additionalFiles: ['api', 'testing', 'deployment'],
        semanticOrganization: true
      });

      // Setup copilot instructions
      await setupCopilotInstructions(testProjectRoot, { syncValidation: true });

      const finalContent = await fs.readFile(copilotInstructionsPath, 'utf8');

      // Verify existing content preserved
      expect(finalContent).toContain('# Custom Instructions');
      expect(finalContent).toContain('My existing project instructions.');
      expect(finalContent).toContain('Follow code standards');

      // Verify Memory Bank section with semantic organization
      expect(finalContent).toContain('# Memory Bank');
      expect(finalContent).toContain('### Semantic Organization');
      expect(finalContent).toContain('Memory Bank Statistics');
      expect(finalContent).toContain('Semantic folders:');
      expect(finalContent).toContain('Sync Validation');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple existing Memory Bank sections gracefully', async () => {
      const existingContent = `# Instructions

First part.

# Memory Bank

First memory bank section.

---
*Generated: 2023-01-01T00:00:00.000Z*

# More Instructions

Middle content.

# Memory Bank

Second memory bank section (should not happen but handle gracefully).

---
*Generated: 2023-01-02T00:00:00.000Z*

# Final Instructions

End content.
`;

      await fs.writeFile(copilotInstructionsPath, existingContent);

      // Create memory bank
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'standard',
        focusAreas: [],
        detailLevel: 'detailed',
        additionalFiles: []
      });

      await setupCopilotInstructions(testProjectRoot);

      const finalContent = await fs.readFile(copilotInstructionsPath, 'utf8');

      // Should replace the first Memory Bank section and leave others
      expect(finalContent).toContain('# Instructions');
      expect(finalContent).toContain('First part.');
      expect(finalContent).toContain('# More Instructions');
      expect(finalContent).toContain('Middle content.');
      expect(finalContent).toContain('# Final Instructions');
      expect(finalContent).toContain('End content.');

      // Should have current Memory Bank content
      expect(finalContent).toContain('## Memory Bank Structure');
      expect(finalContent).toContain('## Core Workflows');

      // Should not have old content
      expect(finalContent).not.toContain('First memory bank section.');
      expect(finalContent).not.toContain('2023-01-01T00:00:00.000Z');
    });

    it('should handle malformed Memory Bank section markers', async () => {
      const existingContent = `# Instructions

Content before.

# Memory Bank

Incomplete memory bank section without proper end marker...

Some more content that should be preserved.
`;

      await fs.writeFile(copilotInstructionsPath, existingContent);

      // Create memory bank
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'standard',
        focusAreas: [],
        detailLevel: 'detailed',
        additionalFiles: []
      });

      await setupCopilotInstructions(testProjectRoot);

      const finalContent = await fs.readFile(copilotInstructionsPath, 'utf8');

      // Should preserve existing content and append new Memory Bank section
      expect(finalContent).toContain('# Instructions');
      expect(finalContent).toContain('Content before.');
      expect(finalContent).toContain('Some more content that should be preserved.');
      
      // Should contain proper Memory Bank section
      expect(finalContent).toContain('## Memory Bank Structure');
      expect(finalContent).toContain('## Core Workflows');
    });
  });
});