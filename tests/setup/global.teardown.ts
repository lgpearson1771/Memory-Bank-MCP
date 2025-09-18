import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Global teardown for all tests
 * Cleans up temporary test files and directories
 */
export default async function globalTeardown() {
  const testTempDir = (globalThis as any).__TEST_TEMP_DIR__;
  
  if (testTempDir) {
    try {
      await fs.rm(testTempDir, { recursive: true, force: true });
      console.log('🧹 Test cleanup completed');
    } catch (error) {
      console.warn('⚠️ Test cleanup warning:', error);
    }
  }
}