#!/usr/bin/env node
/**
 * End-to-End Integration Tests
 * Tests the complete workflow: Generate -> Validate -> Update -> Validate
 * Simulates real-world usage scenarios
 */

import { generateMemoryBankTool } from '../../dist/tools/generateMemoryBank.js';
import { handleUpdateMemoryBank } from '../../dist/tools/updateMemoryBank.js';
import { handleValidateMemoryBank } from '../../dist/tools/validateMemoryBank.js';
import { handleSetupCopilotInstructions } from '../../dist/tools/setupCopilotInstructions.js';
import { handleAnalyzeProjectStructure } from '../../dist/tools/analyzeProjectStructure.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Test Suite Runner
 */
class IntegrationTestSuite {
  constructor() {
    this.testResults = [];
    this.testProjectPath = path.join(process.cwd(), 'temp-integration-test');
  }

  async log(message) {
    console.log(message);
  }

  async setupTestProject() {
    // Clean up any existing test project
    try {
      await fs.rm(this.testProjectPath, { recursive: true, force: true });
    } catch {}
    
    await fs.mkdir(this.testProjectPath, { recursive: true });
    
    // Create a realistic project structure
    const srcDir = path.join(this.testProjectPath, 'src');
    await fs.mkdir(srcDir, { recursive: true });
    
    // Create package.json with realistic content
    const packageJson = {
      name: 'integration-test-project',
      version: '2.1.0',
      description: 'A comprehensive web application for task management and team collaboration',
      main: 'src/index.js',
      scripts: {
        start: 'node src/index.js',
        test: 'jest',
        build: 'webpack --mode production',
        dev: 'nodemon src/index.js'
      },
      dependencies: {
        express: '^4.18.2',
        mongoose: '^7.5.0',
        'socket.io': '^4.7.2',
        jsonwebtoken: '^9.0.2',
        bcryptjs: '^2.4.3',
        cors: '^2.8.5',
        helmet: '^7.0.0'
      },
      devDependencies: {
        jest: '^29.6.4',
        nodemon: '^3.0.1',
        webpack: '^5.88.2',
        '@babel/core': '^7.22.9'
      },
      keywords: ['task-management', 'collaboration', 'web-app', 'nodejs', 'express'],
      author: 'Integration Test Team',
      license: 'MIT'
    };
    
    await fs.writeFile(
      path.join(this.testProjectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create some source files to make it realistic
    await fs.writeFile(
      path.join(srcDir, 'index.js'),
      `const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/tasks', (req, res) => {
  // TODO: Implement task retrieval
  res.json({ tasks: [] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
    );
    
    await fs.writeFile(
      path.join(srcDir, 'models.js'),
      `const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  assignedTo: String,
  dueDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = { Task: mongoose.model('Task', TaskSchema) };`
    );
    
    // Create README
    await fs.writeFile(
      path.join(this.testProjectPath, 'README.md'),
      `# Integration Test Project

A comprehensive task management and team collaboration platform built with Node.js and Express.

## Features

- Task creation and management
- Real-time collaboration with Socket.IO
- User authentication and authorization
- RESTful API design
- MongoDB data persistence

## Getting Started

1. Install dependencies: \`npm install\`
2. Start development server: \`npm run dev\`
3. Run tests: \`npm test\`

## Architecture

This application follows a modular architecture with clear separation of concerns.`
    );
  }

  async teardownTestProject() {
    try {
      await fs.rm(this.testProjectPath, { recursive: true, force: true });
    } catch {}
  }

  async runTest(testName, testFunction) {
    await this.log(`\n📋 Running: ${testName}`);
    try {
      const result = await testFunction();
      this.testResults.push({ name: testName, status: 'PASSED', result });
      await this.log(`✅ ${testName} - PASSED`);
      return result;
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
      await this.log(`❌ ${testName} - FAILED: ${error.message}`);
      throw error;
    }
  }

  async testProjectAnalysis() {
    return await this.runTest('Project Structure Analysis', async () => {
      const result = await handleAnalyzeProjectStructure({
        projectRootPath: this.testProjectPath,
        analysisDepth: 'medium'
      });

      // Verify analysis contains expected information
      const analysisText = result.content[0].text;
      
      if (!analysisText.includes('integration-test-project')) {
        throw new Error('Project name not detected correctly');
      }
      
      if (!analysisText.includes('Express')) {
        throw new Error('Express framework not detected');
      }
      
      if (!analysisText.includes('package.json')) {
        throw new Error('Package.json not analyzed');
      }

      return { analysisLength: analysisText.length, detected: 'Express, MongoDB, Socket.IO' };
    });
  }

  async testMemoryBankGeneration() {
    return await this.runTest('Memory Bank Generation', async () => {
      const result = await generateMemoryBankTool.handler({
        projectRootPath: this.testProjectPath
      });

      const instructions = result.content[0].text;
      
      // Verify generation instructions are comprehensive
      if (!instructions.includes('Memory Bank Generation Instructions')) {
        throw new Error('Missing generation instructions header');
      }
      
      if (!instructions.includes('integration-test-project')) {
        throw new Error('Project name not included in instructions');
      }
      
      if (!instructions.includes('projectbrief.md')) {
        throw new Error('Missing projectbrief.md in instructions');
      }
      
      if (!instructions.includes('Express')) {
        throw new Error('Framework information not included');
      }

      // Count number of files mentioned (should be 6 core files)
      const fileCount = (instructions.match(/\.md/g) || []).length;
      if (fileCount < 6) {
        throw new Error(`Only ${fileCount} memory bank files mentioned, expected at least 6`);
      }

      return { instructionLength: instructions.length, filesReferenced: fileCount };
    });
  }

  async testInitialValidation() {
    return await this.runTest('Initial Validation (No Memory Bank)', async () => {
      const result = await handleValidateMemoryBank({
        projectRootPath: this.testProjectPath
      });

      const validation = JSON.parse(result.content[0].text);
      
      if (validation.status !== 'invalid') {
        throw new Error(`Expected invalid status, got: ${validation.status}`);
      }
      
      if (validation.fileCount !== 0) {
        throw new Error(`Expected 0 files, got: ${validation.fileCount}`);
      }
      
      if (validation.issues.length !== 6) {
        throw new Error(`Expected 6 missing file issues, got: ${validation.issues.length}`);
      }

      return { status: validation.status, missingFiles: validation.issues.length };
    });
  }

  async testMemoryBankCreation() {
    return await this.runTest('Memory Bank File Creation', async () => {
      // Create the memory bank directory structure
      const memoryBankDir = path.join(this.testProjectPath, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      // Create all 6 core memory bank files with realistic content
      const files = {
        'projectbrief.md': `# Integration Test Project

## Purpose and Vision

The Integration Test Project is a comprehensive task management and team collaboration platform designed to streamline project workflows and enhance team productivity.

## Core Features

- **Task Management**: Create, assign, and track tasks with priority levels and due dates
- **Real-time Collaboration**: WebSocket-based real-time updates using Socket.IO
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **RESTful API**: Well-structured API endpoints for all operations
- **Data Persistence**: MongoDB integration with Mongoose ODM

## Technology Stack

- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for WebSocket communication
- **Security**: Helmet for security headers, CORS for cross-origin requests
- **Development**: Nodemon for development, Jest for testing, Webpack for building`,

        'productContext.md': `# Product Context

## Business Purpose

This task management platform addresses the growing need for efficient team collaboration and project tracking in modern development teams.

## Target Users

- **Development Teams**: Agile teams needing sprint and task management
- **Project Managers**: Leaders requiring oversight of project progress
- **Remote Teams**: Distributed teams needing real-time collaboration

## Business Value

- Increases team productivity by 40% through better task organization
- Reduces project management overhead with automated tracking
- Improves team communication through real-time updates
- Provides clear visibility into project progress and bottlenecks`,

        'activeContext.md': `# Active Development Context

## Current Focus

The project is actively implementing the core task management features and real-time collaboration capabilities.

## Recent Activity

- Implemented Express.js server with basic routing structure
- Added MongoDB models for task data persistence
- Integrated Socket.IO for real-time updates
- Set up authentication middleware with JWT tokens

## Next Steps

- Complete task CRUD operations
- Implement user management system
- Add real-time notifications
- Create comprehensive test suite
- Deploy to staging environment`,

        'systemPatterns.md': `# System Architecture and Patterns

## Architectural Patterns

### MVC Pattern
- **Models**: Mongoose schemas for data layer (models.js)
- **Views**: RESTful API responses (JSON)
- **Controllers**: Express route handlers

### Middleware Pattern
- Authentication middleware for protected routes
- Error handling middleware for consistent error responses
- Security middleware (Helmet, CORS)

## Design Decisions

- **RESTful API Design**: Following REST principles for predictable endpoints
- **Modular Structure**: Separation of concerns with dedicated files for models, routes, and middleware
- **Real-time Updates**: Socket.IO integration for immediate task updates
- **Security First**: JWT authentication with bcrypt password hashing`,

        'techContext.md': `# Technical Implementation Context

## Development Environment

- **Runtime**: Node.js 18+
- **Package Manager**: npm
- **Development Tools**: Nodemon for hot reloading
- **Build Tools**: Webpack for production builds

## Dependencies

### Production Dependencies
- **express**: Web framework for Node.js
- **mongoose**: MongoDB object modeling
- **socket.io**: Real-time bidirectional event-based communication
- **jsonwebtoken**: JWT implementation
- **bcryptjs**: Password hashing
- **cors**: Cross-Origin Resource Sharing
- **helmet**: Security middleware

### Development Dependencies
- **jest**: Testing framework
- **nodemon**: Development server with auto-restart
- **webpack**: Module bundler
- **babel**: JavaScript compiler`,

        'progress.md': `# Development Progress

## Current Status: Active Development

### Completed ✅
- Project structure and basic Express setup
- MongoDB connection and basic models
- JWT authentication foundation
- Socket.IO integration
- Security middleware configuration

### In Progress 🚧
- Task CRUD operations implementation
- User management system
- Real-time notification system
- API endpoint testing

### Planned 📋
- Frontend dashboard development
- Comprehensive test suite
- Performance optimization
- Production deployment setup
- Documentation completion

## Quality Metrics
- Code Coverage: Targeting 80%+
- Performance: Sub-200ms API response times
- Security: Regular dependency audits
- Reliability: 99.9% uptime target`
      };

      for (const [filename, content] of Object.entries(files)) {
        await fs.writeFile(path.join(memoryBankDir, filename), content);
      }

      return { filesCreated: Object.keys(files).length, memoryBankPath: memoryBankDir };
    });
  }

  async testPostCreationValidation() {
    return await this.runTest('Post-Creation Validation', async () => {
      const result = await handleValidateMemoryBank({
        projectRootPath: this.testProjectPath
      });

      const validation = JSON.parse(result.content[0].text);
      
      if (validation.status !== 'valid') {
        throw new Error(`Expected valid status, got: ${validation.status}`);
      }
      
      if (validation.fileCount !== 6) {
        throw new Error(`Expected 6 files, got: ${validation.fileCount}`);
      }
      
      // Note: copilotIntegration may be false without proper setup
      if (validation.copilotIntegration === true) {
        throw new Error('Copilot integration should be false without proper setup');
      }

      return { status: validation.status, fileCount: validation.fileCount };
    });
  }

  async testCopilotIntegration() {
    return await this.runTest('Copilot Instructions Setup', async () => {
      const result = await handleSetupCopilotInstructions({
        projectRootPath: this.testProjectPath
      });

      const instructions = result.content[0].text;
      
      if (!instructions.includes('Copilot Instructions') && !instructions.includes('updated') && !instructions.includes('setup')) {
        throw new Error('Missing copilot instructions confirmation');
      }

      // Verify the file was actually created
      const copilotPath = path.join(this.testProjectPath, '.github', 'copilot-instructions.md');
      const copilotContent = await fs.readFile(copilotPath, 'utf-8');
      
      if (!copilotContent.includes('Memory Bank')) {
        throw new Error('Copilot instructions missing memory bank integration');
      }
      
      if (!copilotContent.includes('projectbrief.md')) {
        throw new Error('Copilot instructions missing memory bank file references');
      }

      return { copilotFileSize: copilotContent.length, hasMemoryBankRefs: true };
    });
  }

  async testFullValidationAfterSetup() {
    return await this.runTest('Full Validation After Setup', async () => {
      const result = await handleValidateMemoryBank({
        projectRootPath: this.testProjectPath
      });

      const validation = JSON.parse(result.content[0].text);
      
      if (validation.status !== 'valid') {
        throw new Error(`Expected valid status, got: ${validation.status}`);
      }
      
      if (validation.fileCount !== 6) {
        throw new Error(`Expected 6 files, got: ${validation.fileCount}`);
      }
      
      if (validation.copilotIntegration !== true) {
        throw new Error('Copilot integration should be true after setup');
      }
      
      if (validation.issues.length !== 0) {
        throw new Error(`Expected no issues, got: ${validation.issues.length}`);
      }

      return { status: validation.status, fileCount: validation.fileCount, integrated: validation.copilotIntegration };
    });
  }

  async testMemoryBankUpdate() {
    return await this.runTest('Memory Bank Update Instructions', async () => {
      const result = await handleUpdateMemoryBank({
        projectRootPath: this.testProjectPath
      });

      const instructions = result.content[0].text;
      
      if (!instructions.includes('Memory Bank Update Instructions')) {
        throw new Error('Missing update instructions header');
      }
      
      if (!instructions.includes('Replace placeholder content')) {
        throw new Error('Missing placeholder content instructions');
      }
      
      if (!instructions.includes('TODO')) {
        throw new Error('Missing TODO replacement instructions');
      }
      
      if (!instructions.includes('integration-test-project')) {
        throw new Error('Project name not included in update instructions');
      }

      return { instructionLength: instructions.length, hasPlaceholderInstructions: true };
    });
  }

  async runAllTests() {
    await this.log('🚀 Starting End-to-End Integration Tests');
    await this.log('=' .repeat(50));

    try {
      // Setup
      await this.setupTestProject();
      
      // Run the complete workflow
      await this.testProjectAnalysis();
      await this.testMemoryBankGeneration();
      await this.testInitialValidation();
      await this.testMemoryBankCreation();
      await this.testPostCreationValidation();
      await this.testCopilotIntegration();
      await this.testFullValidationAfterSetup();
      await this.testMemoryBankUpdate();
      
    } finally {
      // Cleanup
      await this.teardownTestProject();
    }

    // Report results
    await this.log('\n' + '='.repeat(50));
    await this.log('🏁 Integration Test Results');
    await this.log('='.repeat(50));
    
    const passed = this.testResults.filter(t => t.status === 'PASSED').length;
    const failed = this.testResults.filter(t => t.status === 'FAILED').length;
    
    for (const test of this.testResults) {
      const icon = test.status === 'PASSED' ? '✅' : '❌';
      await this.log(`${icon} ${test.name}: ${test.status}`);
    }
    
    await this.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      await this.log('\n🎉 All integration tests passed! End-to-end workflow verified.');
      return true;
    } else {
      await this.log('\n⚠️ Some integration tests failed. Check the errors above.');
      return false;
    }
  }
}

// Run the test suite
async function runIntegrationTests() {
  const suite = new IntegrationTestSuite();
  const success = await suite.runAllTests();
  process.exit(success ? 0 : 1);
}

// Export for potential programmatic use
export { IntegrationTestSuite };

// Run if called directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  runIntegrationTests().catch(console.error);
}