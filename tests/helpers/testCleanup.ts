import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Windows-compatible test cleanup utility
 * Handles file locking and directory cleanup issues
 */
export class TestCleanup {
  private static maxAttempts = 5;
  private static retryDelay = 100;

  /**
   * Create unique test directory for each test
   */
  static createUniqueTestDir(baseName: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return path.join(process.cwd(), 'temp', 'test', 'unit', `${baseName}-${timestamp}-${random}`);
  }

  /**
   * Force remove directory with retries for Windows
   */
  static async forceRemoveDir(dirPath: string): Promise<void> {
    if (!await this.pathExists(dirPath)) {
      return;
    }

    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      try {
        await fs.rm(dirPath, { recursive: true, force: true });
        return;
      } catch (error: any) {
        if (attempt === this.maxAttempts - 1) {
          console.warn(`Failed to remove directory after ${this.maxAttempts} attempts: ${dirPath}`, error.message);
          return; // Don't fail tests due to cleanup issues
        }
        
        // Wait before retry, with exponential backoff
        await this.sleep(this.retryDelay * Math.pow(2, attempt));
      }
    }
  }

  /**
   * Safely create directory
   */
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Check if path exists
   */
  static async pathExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Close all file handles in a directory (Windows-specific)
   */
  static async closeFileHandles(_dirPath: string): Promise<void> {
    try {
      // Force garbage collection to close file handles
      if (global.gc) {
        global.gc();
      }
      
      // Small delay to allow Windows to release handles
      await this.sleep(50);
    } catch {
      // Ignore errors
    }
  }

  /**
   * Setup test environment with unique directory
   */
  static async setupTest(testName: string): Promise<string> {
    const testDir = this.createUniqueTestDir(testName);
    await this.ensureDir(testDir);
    return testDir;
  }

  /**
   * Cleanup test environment
   */
  static async cleanupTest(testDir: string): Promise<void> {
    await this.closeFileHandles(testDir);
    await this.forceRemoveDir(testDir);
  }
}