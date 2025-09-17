#!/usr/bin/env node

/**
 * Test the file operations directly
 */

import {
  analyzeProject,
  ensureMemoryBankDirectory,
  generateMemoryBankFiles,
  setupCopilotInstructions,
  validateMemoryBank
} from '../dist/fileOperations.js';

async function testFileOperations() {
  const projectPath = 'C:\\MCPs\\Memory-Bank-MCP\\demo-project';
  
  try {
    console.log('🔍 Testing project analysis...');
    const analysis = await analyzeProject(projectPath, 'medium');
    console.log('✅ Project analysis completed:', analysis.projectType);
    
    console.log('📁 Creating memory bank directory...');
    const memoryBankDir = await ensureMemoryBankDirectory(projectPath);
    console.log('✅ Memory bank directory created:', memoryBankDir);
    
    console.log('📝 Generating memory bank files...');
    const options = {
      structureType: 'standard',
      focusAreas: ['React patterns', 'TypeScript integration'],
      detailLevel: 'detailed',
      additionalFiles: []
    };
    const createdFiles = await generateMemoryBankFiles(memoryBankDir, analysis, options);
    console.log('✅ Memory bank files created:', createdFiles);
    
    console.log('⚙️ Setting up copilot instructions...');
    await setupCopilotInstructions(projectPath);
    console.log('✅ Copilot instructions setup completed');
    
    console.log('🔍 Validating memory bank...');
    const validation = await validateMemoryBank(memoryBankDir);
    console.log('✅ Validation completed. Valid:', validation.isValid);
    
    console.log('🎉 All file operations completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testFileOperations();