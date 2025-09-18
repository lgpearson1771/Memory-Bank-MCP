import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Integration test setup
 * Prepares environment for integration testing
 */
beforeAll(async () => {
  // Ensure temp directories exist for integration tests
  const tempDir = (globalThis as any).__TEST_TEMP_DIR__;
  if (tempDir) {
    await fs.mkdir(path.join(tempDir, 'integration'), { recursive: true });
  }
});

beforeEach(async () => {
  // Clean up any previous test files
  const tempDir = (globalThis as any).__TEST_TEMP_DIR__;
  if (tempDir) {
    const integrationDir = path.join(tempDir, 'integration');
    try {
      const files = await fs.readdir(integrationDir);
      await Promise.all(
        files.map(file => 
          fs.rm(path.join(integrationDir, file), { recursive: true, force: true })
        )
      );
    } catch {
      // Directory might not exist yet
    }
  }
});

afterEach(async () => {
  // Additional cleanup after each test if needed
});