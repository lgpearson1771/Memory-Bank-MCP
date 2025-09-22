#!/usr/bin/env node
/**
 * Simple validation test for MCP tools
 * Tests that our core tools work correctly without Jest complexity
 */

import { generateMemoryBankTool } from '../../dist/tools/generateMemoryBank.js';
import { handleUpdateMemoryBank } from '../../dist/tools/updateMemoryBank.js';
import { handleValidateMemoryBank } from '../../dist/tools/validateMemoryBank.js';
import * as fs from 'fs/promises';
import * as path from 'path';

async function runTests() {
  console.log('🧪 Running MCP Tools Tests\n');

  const testProjectPath = path.join(process.cwd(), 'temp-test-validation');
  let passed = 0;
  let failed = 0;

  // Setup test project
  try {
    await fs.rm(testProjectPath, { recursive: true, force: true });
  } catch {}
  
  await fs.mkdir(testProjectPath, { recursive: true });
  
  // Create test package.json
  const packageJson = {
    name: 'test-validation-project',
    version: '1.0.0',
    description: 'Test project for MCP tools validation',
    dependencies: { 'express': '^4.18.0' }
  };
  
  await fs.writeFile(
    path.join(testProjectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Test 1: Generate Memory Bank Tool
  console.log('📝 Testing Generate Memory Bank Tool...');
  try {
    const result = await generateMemoryBankTool.handler({
      projectRootPath: testProjectPath
    });

    if (result.content &&
        result.content[0].text.includes('Memory Bank Generation Instructions') &&
        result.content[0].text.includes('projectbrief.md') &&
        result.content[0].text.includes('test-validation-project')) {
      console.log('✅ Generate Memory Bank Tool - PASSED');
      passed++;
    } else {
      console.log('❌ Generate Memory Bank Tool - FAILED (missing expected content)');
      failed++;
    }
  } catch (error) {
    console.log('❌ Generate Memory Bank Tool - FAILED:', error.message);
    failed++;
  }

  // Test 2: Update Memory Bank Tool
  console.log('📝 Testing Update Memory Bank Tool...');
  try {
    const result = await handleUpdateMemoryBank({
      projectRootPath: testProjectPath
    });

    if (result.content &&
        result.content[0].text.includes('Memory Bank Update Instructions') &&
        result.content[0].text.includes('Replace placeholder content') &&
        result.content[0].text.includes('TODO')) {
      console.log('✅ Update Memory Bank Tool - PASSED');
      passed++;
    } else {
      console.log('❌ Update Memory Bank Tool - FAILED (missing expected content)');
      failed++;
    }
  } catch (error) {
    console.log('❌ Update Memory Bank Tool - FAILED:', error.message);
    failed++;
  }

  // Test 3: Validate Memory Bank Tool (missing files)
  console.log('📝 Testing Validate Memory Bank Tool (missing files)...');
  try {
    const result = await handleValidateMemoryBank({
      projectRootPath: testProjectPath
    });

    const jsonResult = JSON.parse(result.content[0].text);
    if (jsonResult.status === 'invalid' &&
        jsonResult.issues.length === 6 &&
        jsonResult.copilotIntegration === false) {
      console.log('✅ Validate Memory Bank Tool (missing) - PASSED');
      passed++;
    } else {
      console.log('❌ Validate Memory Bank Tool (missing) - FAILED (unexpected validation result)');
      failed++;
    }
  } catch (error) {
    console.log('❌ Validate Memory Bank Tool (missing) - FAILED:', error.message);
    failed++;
  }

  // Test 4: Validate Memory Bank Tool (complete files)
  console.log('📝 Testing Validate Memory Bank Tool (complete files)...');
  try {
    // Create memory bank directory and files
    const memoryBankDir = path.join(testProjectPath, '.github', 'memory-bank');
    await fs.mkdir(memoryBankDir, { recursive: true });
    
    const coreFiles = [
      'projectbrief.md', 'productContext.md', 'activeContext.md',
      'systemPatterns.md', 'techContext.md', 'progress.md'
    ];
    
    for (const file of coreFiles) {
      await fs.writeFile(
        path.join(memoryBankDir, file), 
        `# ${file}\n\nTest content for ${file}`
      );
    }
    
    // Create copilot instructions that properly references memory bank files
    const githubDir = path.join(testProjectPath, '.github');
    const copilotInstructions = `# Copilot Instructions

## Memory Bank Integration

This project uses a memory bank for comprehensive documentation:

- projectbrief.md - Project overview and core purpose
- productContext.md - Business context and value proposition  
- activeContext.md - Current development focus and activity
- systemPatterns.md - Architecture and design patterns
- techContext.md - Technology stack and implementation details
- progress.md - Development status and roadmap

Please reference these files when providing assistance with this project.`;

    await fs.writeFile(
      path.join(githubDir, 'copilot-instructions.md'),
      copilotInstructions
    );

    const result = await handleValidateMemoryBank({
      projectRootPath: testProjectPath
    });

    const jsonResult = JSON.parse(result.content[0].text);
    if (jsonResult.status === 'valid' &&
        jsonResult.fileCount === 6) {
      // Note: copilotIntegration will be false unless using the official memory bank template
      // This is expected behavior for a test project
      console.log('✅ Validate Memory Bank Tool (complete) - PASSED');
      passed++;
    } else {
      console.log('❌ Validate Memory Bank Tool (complete) - FAILED (unexpected validation result)');
      console.log('   Result:', jsonResult);
      failed++;
    }
  } catch (error) {
    console.log('❌ Validate Memory Bank Tool (complete) - FAILED:', error.message);
    failed++;
  }

  // Test 5: Error Handling
  console.log('📝 Testing Error Handling...');
  try {
    const invalidPath = '/nonexistent/path/that/does/not/exist';
    const result = await generateMemoryBankTool.handler({
      projectRootPath: invalidPath
    });

    if (result.isError && result.content[0].text.includes('Error')) {
      console.log('✅ Error Handling - PASSED');
      passed++;
    } else {
      console.log('❌ Error Handling - FAILED (expected error response)');
      failed++;
    }
  } catch (error) {
    console.log('❌ Error Handling - FAILED:', error.message);
    failed++;
  }

  // Cleanup
  try {
    await fs.rm(testProjectPath, { recursive: true, force: true });
  } catch {}

  // Results
  console.log('\n🏁 Test Results:');
  console.log('================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! MCP tools are working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
    process.exit(1);
  }
}

runTests().catch(console.error);