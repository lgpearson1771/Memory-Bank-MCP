import { validateMemoryBank } from '../../dist/core/validation.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Simple Validation Test', () => {
  test('should run basic validation', async () => {
    // Create a temporary directory structure
    const testDir = path.join(process.cwd(), 'temp-test-simple');
    const memoryBankDir = path.join(testDir, '.github', 'memory-bank');
    
    try {
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      // Create a basic file
      await fs.writeFile(path.join(memoryBankDir, 'projectbrief.md'), '# Test Project');
      
      // Run validation
      const result = await validateMemoryBank(testDir);
      
      console.log('Validation result:', result);
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('coreFilesPresent');
      // For now, just check that it runs without throwing
      
    } finally {
      // Cleanup
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });
});