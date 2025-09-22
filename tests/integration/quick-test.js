#!/usr/bin/env node
/**
 * Quick Integration Test
 * Simplified test to verify the integration tests work
 */

import { generateMemoryBankTool } from '../../dist/tools/generateMemoryBank.js';
import { handleValidateMemoryBank } from '../../dist/tools/validateMemoryBank.js';
import * as fs from 'fs/promises';
import * as path from 'path';

async function quickTest() {
  console.log('🧪 Quick Integration Test');
  
  const testPath = path.join(process.cwd(), 'temp-quick-test');
  
  try {
    // Setup
    await fs.rm(testPath, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(testPath, { recursive: true });
    
    const packageJson = { name: 'quick-test', version: '1.0.0' };
    await fs.writeFile(
      path.join(testPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Test generate
    console.log('📝 Testing generate tool...');
    const generateResult = await generateMemoryBankTool.handler({
      projectRootPath: testPath
    });
    
    if (generateResult.isError) {
      throw new Error('Generate tool failed');
    }
    console.log('✅ Generate tool works');
    
    // Test validate
    console.log('📝 Testing validate tool...');
    const validateResult = await handleValidateMemoryBank({
      projectRootPath: testPath
    });
    
    const validation = JSON.parse(validateResult.content[0].text);
    if (validation.status !== 'invalid') {
      throw new Error('Validate should show invalid for empty project');
    }
    console.log('✅ Validate tool works');
    
    console.log('\n🎉 Quick integration test passed!');
    
  } finally {
    await fs.rm(testPath, { recursive: true, force: true }).catch(() => {});
  }
}

quickTest().catch(console.error);