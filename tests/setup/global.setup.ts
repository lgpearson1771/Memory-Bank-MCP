import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global setup for all tests
 * Creates temporary directories and test fixtures
 */
export default async function globalSetup() {
  const testTempDir = path.join(__dirname, '..', '..', 'temp', 'test');
  
  // Ensure test temp directory exists
  await fs.mkdir(testTempDir, { recursive: true });
  
  // Set global test directories
  (globalThis as any).__TEST_TEMP_DIR__ = testTempDir;
  (globalThis as any).__TEST_FIXTURES_DIR__ = path.join(__dirname, '..', 'fixtures');
  
  console.log('🧪 Test environment initialized');
  console.log(`📁 Test temp directory: ${testTempDir}`);
}