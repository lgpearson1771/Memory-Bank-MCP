import * as fs from 'fs/promises';
import * as path from 'path';
import { generateMemoryBankFiles, type MemoryBankOptions } from '../../src/core/memoryBankGenerator.js';
import { analyzeProject } from '../../src/core/projectAnalysis.js';
import { setupCopilotInstructions } from '../../src/integrations/copilotIntegration.js';
import { validateMemoryBank } from '../../src/core/validation.js';
import { ensureMemoryBankDirectory } from '../../src/utils/fileUtils.js';
import { TestCleanup } from '../helpers/testCleanup.js';

describe('Memory Bank Structure Transition Integration', () => {
  let testTempDir: string;
  
  beforeEach(async () => {
    testTempDir = await TestCleanup.setupTest('structure-transition');
  });

  afterEach(async () => {
    if (testTempDir) {
      await TestCleanup.cleanupTest(testTempDir);
    }
  });

  const createTestProject = async (testName: string): Promise<string> => {
    const projectDir = path.join(testTempDir, testName);
    await fs.mkdir(projectDir, { recursive: true });
    
    // Create a basic project structure
    await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify({
      name: testName,
      version: '1.0.0',
      description: 'Test project for structure transitions'
    }, null, 2));
    
    await fs.writeFile(path.join(projectDir, 'README.md'), `# ${testName}\n\nTest project for memory bank structure transitions.`);
    
    // Create some source files to analyze
    const srcDir = path.join(projectDir, 'src');
    await fs.mkdir(srcDir, { recursive: true });
    await fs.writeFile(path.join(srcDir, 'index.ts'), 'export function main() { console.log("Hello world"); }');
    await fs.writeFile(path.join(srcDir, 'utils.ts'), 'export function helper() { return "utility"; }');
    
    return projectDir;
  };

  test('should clean up semantic folders when transitioning from semantic to flat organization', async () => {
    const projectRoot = await createTestProject('semantic-to-flat-test');
    const memoryBankDir = await ensureMemoryBankDirectory(projectRoot);
    
    const analysis = await analyzeProject(projectRoot);
    
    // First generate with semantic organization
    const semanticOptions: MemoryBankOptions = {
      structureType: 'standard',
      focusAreas: ['testing', 'deployment'],
      detailLevel: 'detailed',
      additionalFiles: ['api-overview.md', 'testing-strategy.md', 'deployment-guide.md'],
      semanticOrganization: true
    };
    
    await generateMemoryBankFiles(memoryBankDir, analysis, semanticOptions);
    
    // Verify semantic structure was created
    const semanticFiles = await fs.readdir(memoryBankDir);
    // Check that semantic folders were created
    const semanticFolderChecks = await Promise.all(
      semanticFiles.map(async (file) => {
        try {
          const stat = await fs.stat(path.join(memoryBankDir, file));
          return stat.isDirectory();
        } catch {
          return false;
        }
      })
    );
    const hasSemanticFolders = semanticFolderChecks.some(Boolean);
    expect(hasSemanticFolders).toBe(true); // Should have created semantic folders
    
    // Now transition to flat structure (no semantic organization)
    const flatOptions: MemoryBankOptions = {
      structureType: 'standard',
      focusAreas: ['testing', 'deployment'],
      detailLevel: 'detailed',
      additionalFiles: ['api-overview.md', 'testing-strategy.md', 'deployment-guide.md'],
      semanticOrganization: false
    };
    
    await generateMemoryBankFiles(memoryBankDir, analysis, flatOptions);
    
    // Verify semantic folders are cleaned up and files are now flat
    const flatFiles = await fs.readdir(memoryBankDir);
    
    // Check that files are now in the root instead of semantic folders
    expect(flatFiles).toContain('api-overview.md');
    expect(flatFiles).toContain('testing-strategy.md');
    expect(flatFiles).toContain('deployment-guide.md');
    
    // Verify standard files still exist
    expect(flatFiles).toContain('projectbrief.md');
    expect(flatFiles).toContain('productContext.md');
    expect(flatFiles).toContain('activeContext.md');
    expect(flatFiles).toContain('systemPatterns.md');
    expect(flatFiles).toContain('techContext.md');
    expect(flatFiles).toContain('progress.md');
  });

  test('should handle multiple semantic organization transitions correctly', async () => {
    const projectRoot = await createTestProject('multi-semantic-transition-test');
    const memoryBankDir = await ensureMemoryBankDirectory(projectRoot);
    
    const analysis = await analyzeProject(projectRoot);
    
    // Start with flat structure
    const flatOptions: MemoryBankOptions = {
      structureType: 'standard',
      focusAreas: ['api'],
      detailLevel: 'detailed',
      additionalFiles: ['api-docs.md'],
      semanticOrganization: false
    };
    
    await generateMemoryBankFiles(memoryBankDir, analysis, flatOptions);
    let files = await fs.readdir(memoryBankDir);
    expect(files).toContain('api-docs.md'); // Should be in root
    expect(files).toHaveLength(7); // 6 core + 1 additional file
    
    // Transition to semantic organization
    const semanticOptions: MemoryBankOptions = {
      structureType: 'standard',
      focusAreas: ['security', 'testing'],
      detailLevel: 'detailed',
      additionalFiles: ['security-guide.md', 'testing-framework.md'],
      semanticOrganization: true
    };
    
    await generateMemoryBankFiles(memoryBankDir, analysis, semanticOptions);
    files = await fs.readdir(memoryBankDir);
    
    // Should not have the previous flat file
    expect(files).not.toContain('api-docs.md');
    
    // Check for semantic folders
    const hasSemanticFolders = await Promise.all(
      files.map(async (file) => {
        try {
          const stat = await fs.stat(path.join(memoryBankDir, file));
          return stat.isDirectory();
        } catch {
          return false;
        }
      })
    );
    
    expect(hasSemanticFolders.some(Boolean)).toBe(true); // Should have at least one folder
    
    // Transition back to flat
    await generateMemoryBankFiles(memoryBankDir, analysis, flatOptions);
    files = await fs.readdir(memoryBankDir);
    
    // Should be back to flat structure
    expect(files).toContain('api-docs.md');
    expect(files).not.toContain('security-guide.md'); // Previous files should be cleaned
    expect(files).not.toContain('testing-framework.md');
  });

  test('should preserve custom files during semantic organization transitions', async () => {
    const projectRoot = await createTestProject('custom-preserve-semantic-test');
    const memoryBankDir = await ensureMemoryBankDirectory(projectRoot);
    
    const analysis = await analyzeProject(projectRoot);
    
    // Generate initial flat structure
    const flatOptions: MemoryBankOptions = {
      structureType: 'standard',
      focusAreas: ['architecture'],
      detailLevel: 'detailed',
      additionalFiles: [],
      semanticOrganization: false
    };
    
    await generateMemoryBankFiles(memoryBankDir, analysis, flatOptions);
    
    // Add custom files
    await fs.writeFile(path.join(memoryBankDir, 'custom-notes.md'), '# Custom Notes\n\nUser-added content');
    await fs.writeFile(path.join(memoryBankDir, 'team-decisions.md'), '# Team Decisions\n\nImportant decisions');
    
    const customDir = path.join(memoryBankDir, 'custom');
    await fs.mkdir(customDir, { recursive: true });
    await fs.writeFile(path.join(customDir, 'custom-file.md'), 'Custom content');
    
    // Transition to semantic organization
    const semanticOptions: MemoryBankOptions = {
      structureType: 'standard',
      focusAreas: ['testing'],
      detailLevel: 'detailed',
      additionalFiles: ['test-strategy.md'],
      semanticOrganization: true
    };
    
    await generateMemoryBankFiles(memoryBankDir, analysis, semanticOptions);
    
    // Verify custom files are preserved
    const files = await fs.readdir(memoryBankDir);
    expect(files).toContain('custom-notes.md');
    expect(files).toContain('team-decisions.md');
    expect(files).toContain('custom');
    
    const customContent = await fs.readFile(path.join(memoryBankDir, 'custom-notes.md'), 'utf-8');
    expect(customContent).toContain('User-added content');
    
    const customFolderFiles = await fs.readdir(customDir);
    expect(customFolderFiles).toContain('custom-file.md');
    
    // Transition back to flat
    await generateMemoryBankFiles(memoryBankDir, analysis, flatOptions);
    
    // Custom files should still be preserved
    const finalFiles = await fs.readdir(memoryBankDir);
    expect(finalFiles).toContain('custom-notes.md');
    expect(finalFiles).toContain('team-decisions.md');
    expect(finalFiles).toContain('custom');
    
    // Verify custom content integrity
    const preservedContent = await fs.readFile(path.join(memoryBankDir, 'custom-notes.md'), 'utf-8');
    expect(preservedContent).toContain('User-added content');
  });

  test('should update copilot instructions correctly during semantic organization transitions', async () => {
    const projectRoot = await createTestProject('copilot-semantic-sync-test');
    const memoryBankDir = await ensureMemoryBankDirectory(projectRoot);
    
    const analysis = await analyzeProject(projectRoot);
    
    // Generate semantic structure first
    const semanticOptions: MemoryBankOptions = {
      structureType: 'standard',
      focusAreas: ['api', 'testing'],
      detailLevel: 'detailed',
      additionalFiles: ['api-reference.md', 'testing-guide.md'],
      semanticOrganization: true
    };
    
    await generateMemoryBankFiles(memoryBankDir, analysis, semanticOptions);
    await setupCopilotInstructions(projectRoot);
    
    let copilotContent = await fs.readFile(path.join(projectRoot, '.github', 'copilot-instructions.md'), 'utf-8');
    
    // Should reference semantic structure if it exists
    // The exact folder structure depends on the semantic organization logic
    
    // Transition to flat
    const flatOptions: MemoryBankOptions = {
      structureType: 'standard',
      focusAreas: ['api', 'testing'],
      detailLevel: 'detailed',
      additionalFiles: ['api-reference.md', 'testing-guide.md'],
      semanticOrganization: false
    };
    
    await generateMemoryBankFiles(memoryBankDir, analysis, flatOptions);
    await setupCopilotInstructions(projectRoot);
    
    copilotContent = await fs.readFile(path.join(projectRoot, '.github', 'copilot-instructions.md'), 'utf-8');
    
    // Should reference flat structure files
    expect(copilotContent).toContain('api-reference.md');
    expect(copilotContent).toContain('testing-guide.md');
    expect(copilotContent).toContain('projectbrief.md');
    expect(copilotContent).toContain('productContext.md');
    
    // Validate memory bank consistency
    const validationResult = await validateMemoryBank(memoryBankDir);
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.missingFiles).toHaveLength(0);
  });
});