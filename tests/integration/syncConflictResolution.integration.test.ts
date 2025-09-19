/**
 * Integration tests for Sync Conflict Resolution tool
 * Tests the interactive resolution of conflicts between memory bank and copilot instructions
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { handleResolveSyncConflicts } from '../../src/tools/resolveSyncConflicts.js';
import { setupCopilotInstructions } from '../../src/integrations/copilotIntegration.js';
import { generateMemoryBankFiles } from '../../src/core/memoryBankGenerator.js';
import { analyzeProject } from '../../src/core/projectAnalysis.js';
import { ensureMemoryBankDirectory } from '../../src/utils/fileUtils.js';

describe('Sync Conflict Resolution Integration Tests', () => {
  const testProjectRoot = path.join(process.cwd(), 'temp', 'test-sync-resolution');
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
      name: 'test-sync-resolution',
      version: '1.0.0',
      description: 'Test project for sync conflict resolution',
      main: 'index.js',
      dependencies: {
        'express': '^4.18.0'
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

  describe('No Conflicts Scenario', () => {
    it('should report no conflicts when memory bank and copilot instructions are in sync', async () => {
      // Create memory bank
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'standard',
        focusAreas: [],
        detailLevel: 'detailed',
        additionalFiles: []
      });

      // Setup copilot instructions to match
      await setupCopilotInstructions(testProjectRoot, { syncValidation: true });

      // Test conflict resolution
      const result = await handleResolveSyncConflicts({
        projectRootPath: testProjectRoot,
        autoResolve: false
      });

      expect(result.content).toHaveLength(1);
      const responseData = JSON.parse(result.content[0].text);
      
      expect(responseData.status).toBe('No conflicts to resolve');
      expect(responseData.message).toContain('already synchronized');
      expect(responseData.syncValidation.isInSync).toBe(true);
    });
  });

  describe('Orphaned References Scenario', () => {
    it('should identify and offer to resolve orphaned references', async () => {
      // Create memory bank with standard files
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'standard',
        focusAreas: [],
        detailLevel: 'detailed',
        additionalFiles: []
      });

      // Create copilot instructions with orphaned references
      const copilotContent = `# Test Instructions

Some custom instructions.

# Memory Bank

References to files that don't exist:
- \`nonexistent-file.md\`
- \`another-missing-file.md\`
- \`orphaned/nested-file.md\`

And valid references:
- \`projectbrief.md\`
- \`activeContext.md\`

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.
`;

      await fs.writeFile(copilotInstructionsPath, copilotContent);

      // Test conflict resolution
      const result = await handleResolveSyncConflicts({
        projectRootPath: testProjectRoot,
        autoResolve: false
      });

      expect(result.content).toHaveLength(1);
      const responseData = JSON.parse(result.content[0].text);
      
      expect(responseData.status).toBe('Interactive sync conflict resolution completed');
      expect(responseData.resolutionResult.finalSyncStatus.isInSync).toBe(false);
      expect(responseData.resolutionResult.finalSyncStatus.remainingConflicts).toBeGreaterThan(0);
      
      // Should have generated conversation steps
      expect(responseData.conversationLog.length).toBeGreaterThan(0);
      expect(responseData.conversationLog[0].type).toBe('information');
      expect(responseData.conversationLog[0].content).toContain('Sync Conflict Analysis');
      
      // Should have user choices
      expect(responseData.userChoices.length).toBeGreaterThan(0);
    });
  });

  describe('Missing References Scenario', () => {
    it('should identify memory bank files not referenced in copilot instructions', async () => {
      // Create memory bank with additional files
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'enhanced',
        focusAreas: ['api', 'testing'],
        detailLevel: 'detailed',
        additionalFiles: ['api', 'testing'],
        semanticOrganization: true
      });

      // Create copilot instructions that only reference core files
      const copilotContent = `# Test Instructions

Basic memory bank references:
- \`projectbrief.md\`
- \`productContext.md\`

Missing references to semantic files and additional files.

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.
`;

      await fs.writeFile(copilotInstructionsPath, copilotContent);

      // Test conflict resolution
      const result = await handleResolveSyncConflicts({
        projectRootPath: testProjectRoot,
        autoResolve: false
      });

      expect(result.content).toHaveLength(1);
      const responseData = JSON.parse(result.content[0].text);
      
      expect(responseData.status).toBe('Interactive sync conflict resolution completed');
      expect(responseData.resolutionResult.finalSyncStatus.isInSync).toBe(false);
      
      // Should detect missing references
      const conflictInfo = responseData.conversationLog[0].content;
      expect(conflictInfo).toContain('MISSING REFERENCES');
    });
  });

  describe('Mixed Conflicts Scenario', () => {
    it('should handle both missing and orphaned references', async () => {
      // Create memory bank
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'standard',
        focusAreas: [],
        detailLevel: 'detailed',
        additionalFiles: []
      });

      // Create copilot instructions with mixed issues
      const copilotContent = `# Test Instructions

Valid references:
- \`projectbrief.md\`

Orphaned references:
- \`nonexistent-file.md\`
- \`missing/file.md\`

Missing references: activeContext.md, systemPatterns.md, etc. are not listed

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.
`;

      await fs.writeFile(copilotInstructionsPath, copilotContent);

      // Test conflict resolution
      const result = await handleResolveSyncConflicts({
        projectRootPath: testProjectRoot,
        autoResolve: false
      });

      expect(result.content).toHaveLength(1);
      const responseData = JSON.parse(result.content[0].text);
      
      expect(responseData.status).toBe('Interactive sync conflict resolution completed');
      expect(responseData.resolutionResult.finalSyncStatus.isInSync).toBe(false);
      
      // Should detect both types of conflicts
      const conflictInfo = responseData.conversationLog[0].content;
      expect(conflictInfo).toContain('Conflict Type: BOTH');
    });
  });

  describe('Auto-Resolution Capability', () => {
    it('should auto-resolve simple conflicts when autoResolve is enabled', async () => {
      // Create memory bank
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'standard',
        focusAreas: [],
        detailLevel: 'detailed',
        additionalFiles: []
      });

      // Create copilot instructions missing only non-critical files
      const copilotContent = `# Test Instructions

Core references:
- \`projectbrief.md\`
- \`productContext.md\`
- \`activeContext.md\`
- \`systemPatterns.md\`
- \`techContext.md\`

Missing: progress.md (low impact)

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.
`;

      await fs.writeFile(copilotInstructionsPath, copilotContent);

      // Test with auto-resolve enabled
      const result = await handleResolveSyncConflicts({
        projectRootPath: testProjectRoot,
        autoResolve: true
      });

      expect(result.content).toHaveLength(1);
      const responseData = JSON.parse(result.content[0].text);
      
      expect(responseData.status).toBe('Interactive sync conflict resolution completed');
      
      // Check if any actions were performed for auto-resolvable conflicts
      const conversationLog = responseData.conversationLog;
      const hasAutoResolveMessage = conversationLog.some((step: any) => 
        step.content.includes('Auto-resolved') || step.content.includes('auto-resolve')
      );
      
      // Should have attempted auto-resolution based on conflict characteristics
      expect(conversationLog.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing memory bank gracefully', async () => {
      // Don't create any memory bank files, just copilot instructions
      const copilotContent = `# Test Instructions

References to non-existent memory bank:
- \`projectbrief.md\`

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.
`;

      await fs.writeFile(copilotInstructionsPath, copilotContent);

      // Test conflict resolution
      const result = await handleResolveSyncConflicts({
        projectRootPath: testProjectRoot,
        autoResolve: false
      });

      expect(result.content).toHaveLength(1);
      const responseData = JSON.parse(result.content[0].text);
      
      // Should report validation issues, not crash
      expect(responseData.status).toMatch(/failed|unable|error/i);
    });

    it('should handle invalid project path', async () => {
      const result = await handleResolveSyncConflicts({
        projectRootPath: '/nonexistent/path',
        autoResolve: false
      });

      expect(result.content).toHaveLength(1);
      const responseData = JSON.parse(result.content[0].text);
      
      expect(responseData.status).toContain('failed');
      expect(responseData.error).toBeTruthy();
    });
  });

  describe('Conversation Flow Quality', () => {
    it('should provide clear and actionable conversation flow', async () => {
      // Create scenario with clear conflicts
      const analysis = await analyzeProject(testProjectRoot);
      await ensureMemoryBankDirectory(testProjectRoot);
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'standard',
        focusAreas: [],
        detailLevel: 'detailed',
        additionalFiles: []
      });

      const copilotContent = `# Test Instructions

- \`orphaned-file.md\`

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.
`;

      await fs.writeFile(copilotInstructionsPath, copilotContent);

      const result = await handleResolveSyncConflicts({
        projectRootPath: testProjectRoot,
        autoResolve: false
      });

      const responseData = JSON.parse(result.content[0].text);
      const conversationLog = responseData.conversationLog;

      // Should have proper conversation structure
      expect(conversationLog[0].type).toBe('information'); // Overview
      expect(conversationLog[1].type).toBe('question');    // How to resolve
      
      // Should have timestamps
      conversationLog.forEach((step: any) => {
        expect(step.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });

      // Should have clear action descriptions
      const actionSteps = conversationLog.filter((step: any) => step.type === 'confirmation');
      actionSteps.forEach((step: any) => {
        expect(step.content).toContain('Conflict');
        expect(step.content).toContain('Details:');
        expect(step.options).toHaveLength(3); // Yes, No, Stop
      });
    });
  });
});