/**
 * End-to-End Integration Tests
 * Tests the complete workflow: Generate -> Validate -> Update -> Validate
 * Simulates real-world usage scenarios
 */

import { generateMemoryBankTool } from '../../src/tools/generateMemoryBank.js';
import { handleUpdateMemoryBank } from '../../src/tools/updateMemoryBank.js';
import { handleValidateMemoryBank } from '../../src/tools/validateMemoryBank.js';
import { handleSetupCopilotInstructions } from '../../src/tools/setupCopilotInstructions.js';
import { handleAnalyzeProjectStructure } from '../../src/tools/analyzeProjectStructure.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('End-to-End Integration Tests', () => {
  const testProjectPath = path.join(process.cwd(), 'temp-integration-e2e-test');

  beforeAll(async () => {
    await setupTestProject();
  });

  afterAll(async () => {
    // Clean up test project
    try {
      await fs.rm(testProjectPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  async function setupTestProject() {
    // Clean up any existing test project
    try {
      await fs.rm(testProjectPath, { recursive: true, force: true });
    } catch {}
    
    await fs.mkdir(testProjectPath, { recursive: true });
    
    // Create a realistic project structure
    const srcDir = path.join(testProjectPath, 'src');
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
      path.join(testProjectPath, 'package.json'),
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

    // Create additional realistic files
    await fs.mkdir(path.join(srcDir, 'models'), { recursive: true });
    await fs.writeFile(
      path.join(srcDir, 'models', 'Task.js'),
      `const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);`
    );

    // Create README
    await fs.writeFile(
      path.join(testProjectPath, 'README.md'),
      `# Integration Test Project

A comprehensive task management and team collaboration web application built with Node.js and Express.

## Features

- User authentication and authorization
- Real-time collaboration with Socket.IO
- Task management with priorities
- Team management
- RESTful API
- Modern web interface

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`

## API Endpoints

- GET /api/health - Health check
- GET /api/tasks - List all tasks
- POST /api/tasks - Create new task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

## Architecture

This application follows a layered architecture:
- Controllers handle HTTP requests
- Services contain business logic
- Models define data structures
- Routes define API endpoints`
    );
  }

  describe('Project Structure Analysis', () => {
    test('should analyze project structure correctly', async () => {
      const result = await handleAnalyzeProjectStructure({
        projectRootPath: testProjectPath
      });

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      
      const analysisResult = JSON.parse(result.content[0].text);
      expect(analysisResult).toHaveProperty('status', 'Project analysis completed');
      expect(analysisResult).toHaveProperty('projectRootPath', testProjectPath);
      expect(analysisResult.analysis).toHaveProperty('projectName');
      expect(analysisResult.analysis.projectName).toContain('integration-test-project');
    }, 15000);
  });

  describe('Memory Bank Generation', () => {
    test('should generate comprehensive memory bank', async () => {
      const result = await generateMemoryBankTool.handler({
        projectRootPath: testProjectPath
      });

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      
      const instructions = result.content[0].text;
      expect(instructions).toContain('Memory Bank Generation Instructions');
      expect(instructions).toContain('integration-test-project');
      expect(instructions).toContain('projectbrief.md');
      expect(instructions).toContain('productContext.md');
      expect(instructions).toContain('activeContext.md');
      expect(instructions).toContain('systemPatterns.md');
      expect(instructions).toContain('techContext.md');
      expect(instructions).toContain('progress.md');
    }, 15000);
  });

  describe('Initial Validation (No Memory Bank)', () => {
    test('should detect missing memory bank files', async () => {
      const result = await handleValidateMemoryBank({
        projectRootPath: testProjectPath
      });

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      
      const validationResult = JSON.parse(result.content[0].text);
      expect(validationResult).toHaveProperty('status', 'invalid');
      expect(validationResult).toHaveProperty('issues');
      expect(validationResult.issues.length).toBeGreaterThan(0);
      expect(validationResult).toHaveProperty('fileCount', 0);
      expect(validationResult).toHaveProperty('copilotIntegration', false);
    }, 10000);
  });

  describe('Memory Bank File Creation Simulation', () => {
    test('should create realistic memory bank files', async () => {
      const memoryBankDir = path.join(testProjectPath, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      const coreFiles = [
        {
          name: 'projectbrief.md',
          content: `# Integration Test Project

## Project Overview
A comprehensive task management and team collaboration web application built with Node.js, Express, and MongoDB.

## Core Purpose
Enable teams to efficiently manage tasks, collaborate in real-time, and track project progress through an intuitive web interface.

## Key Features
- User authentication and authorization
- Real-time collaboration with Socket.IO
- Task management with priorities and assignments
- Team management and user roles
- RESTful API for frontend integration
- Modern responsive web interface

## Target Users
- Development teams
- Project managers
- Small to medium businesses
- Remote teams requiring collaboration tools

## Technical Stack
- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for live updates
- **Authentication**: JWT tokens with bcrypt hashing
- **Security**: Helmet middleware for security headers
- **Build Tools**: Webpack for asset bundling
- **Testing**: Jest for unit and integration testing`
        },
        {
          name: 'productContext.md', 
          content: `# Product Context

## Problem Statement
Teams struggle with scattered task management across multiple tools, leading to:
- Lost productivity due to context switching
- Lack of real-time collaboration
- Difficulty tracking project progress
- Poor visibility into team workload

## Solution Approach
A unified web application that combines:
- Centralized task management
- Real-time collaboration features
- Intuitive user interface
- Robust API for extensibility

## User Experience Goals
- **Simplicity**: Intuitive interface requiring minimal training
- **Speed**: Fast response times and real-time updates
- **Reliability**: Robust error handling and data persistence
- **Scalability**: Support for growing teams and projects

## Success Metrics
- User adoption rate > 80%
- Task completion time reduction > 30%
- User satisfaction score > 4.5/5
- System uptime > 99.5%`
        },
        {
          name: 'activeContext.md',
          content: `# Active Context

## Current Development Phase
**Phase**: Core API Development and Testing
**Sprint**: 3 of 8
**Timeline**: Week 6 of 16-week project

## Recent Accomplishments
- ✅ Basic Express.js server setup completed
- ✅ MongoDB connection and Task model implemented
- ✅ Authentication middleware configured
- ✅ Health check endpoint operational
- ✅ Project structure and build tools configured

## Active Work Items
- 🔄 Implementing CRUD operations for tasks
- 🔄 Setting up Socket.IO for real-time updates
- 🔄 Creating user management system
- 🔄 Writing comprehensive test suite

## Next Steps
1. Complete task CRUD operations
2. Implement user authentication endpoints
3. Add real-time collaboration features
4. Create frontend React components
5. Set up CI/CD pipeline

## Current Challenges
- **Database Performance**: Optimizing MongoDB queries for large datasets
- **Real-time Sync**: Ensuring data consistency across concurrent users
- **Security**: Implementing proper JWT token management
- **Testing**: Achieving >90% code coverage

## Architecture Decisions
- Using MongoDB for flexible document storage
- JWT tokens for stateless authentication
- Socket.IO rooms for team-based real-time updates
- Microservice-ready architecture for future scaling`
        },
        {
          name: 'systemPatterns.md',
          content: `# System Patterns

## Architecture Overview
**Pattern**: Layered Architecture with MVC principles
**Type**: Monolithic application with microservice-ready design

## Core Components

### 1. API Layer (Controllers)
- **Pattern**: RESTful API design
- **Responsibility**: HTTP request/response handling
- **Location**: \`src/controllers/\`
- **Key Files**: TaskController.js, UserController.js, AuthController.js

### 2. Business Logic Layer (Services)  
- **Pattern**: Service layer pattern
- **Responsibility**: Business rules and logic
- **Location**: \`src/services/\`
- **Key Files**: TaskService.js, UserService.js, AuthService.js

### 3. Data Access Layer (Models)
- **Pattern**: Active Record with Mongoose ODM
- **Responsibility**: Data persistence and validation
- **Location**: \`src/models/\`
- **Key Files**: Task.js, User.js, Team.js

### 4. Real-time Communication
- **Pattern**: Observer pattern with Socket.IO
- **Responsibility**: Live updates and collaboration
- **Location**: \`src/socketHandlers/\`

## Design Patterns

### Authentication Flow
\`\`\`
Client → AuthController → AuthService → JWT Token → Protected Routes
\`\`\`

### Task Management Flow
\`\`\`  
Client → TaskController → TaskService → TaskModel → MongoDB
                    ↓
               Socket.IO → Real-time Updates
\`\`\`

### Error Handling Pattern
- **Global Error Middleware**: Centralized error processing
- **Custom Error Classes**: Typed error handling
- **Logging Strategy**: Structured logging with Winston

## Integration Patterns
- **Database**: Connection pooling with Mongoose
- **Security**: Helmet middleware for security headers
- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: Express rate limiter for API protection`
        },
        {
          name: 'techContext.md',
          content: `# Technical Context

## Technology Stack

### Backend Technologies
- **Runtime**: Node.js 18+ (JavaScript runtime)
- **Framework**: Express.js 4.18.2 (Web application framework)
- **Database**: MongoDB 7.0+ with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) with bcryptjs hashing
- **Real-time**: Socket.IO 4.7.2 for WebSocket communication
- **Security**: Helmet.js for security headers, CORS enabled

### Development Tools
- **Testing**: Jest 29.6.4 (Unit and integration testing)
- **Build Tool**: Webpack 5.88.2 (Asset bundling)
- **Development**: Nodemon 3.0.1 (Auto-restart server)
- **Transpilation**: Babel for modern JavaScript features
- **Package Manager**: npm (Node Package Manager)

### Dependencies
\`\`\`json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0", 
  "socket.io": "^4.7.2",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "helmet": "^7.0.0"
}
\`\`\`

## Development Environment
- **Node Version**: >=18.0.0
- **MongoDB**: Local instance or MongoDB Atlas
- **Port**: 3000 (default), configurable via PORT env var
- **Environment Variables**:
  - \`PORT\`: Server port
  - \`MONGODB_URI\`: Database connection string
  - \`JWT_SECRET\`: JWT signing secret
  - \`NODE_ENV\`: Environment (development/production)

## API Design
- **Style**: RESTful API principles
- **Data Format**: JSON request/response
- **Status Codes**: Standard HTTP status codes
- **Error Format**: Consistent error response structure
- **Versioning**: URL path versioning (/api/v1/)

## Performance Considerations
- **Database**: Indexed queries, connection pooling
- **Caching**: Redis integration planned for Session storage
- **Compression**: gzip compression for responses
- **Security**: Rate limiting and input validation

## Deployment Architecture
- **Containerization**: Docker support planned
- **Process Management**: PM2 for production
- **Monitoring**: Application health checks
- **Logging**: Structured logging with log levels`
        },
        {
          name: 'progress.md',
          content: `# Progress Tracking

## Project Status: IN DEVELOPMENT
**Overall Completion**: 35% (Phase 1 of 3)

## Completed Milestones ✅

### Phase 0: Project Setup (COMPLETE)
- ✅ Project structure and build configuration
- ✅ Package.json with all required dependencies
- ✅ Express.js server setup and basic middleware
- ✅ MongoDB connection and basic Task model
- ✅ Authentication middleware structure
- ✅ Health check endpoint implementation

### Development Infrastructure (COMPLETE)
- ✅ Jest testing framework configured
- ✅ Webpack build process established
- ✅ Nodemon for development auto-restart
- ✅ ESLint and Prettier for code quality
- ✅ Git repository with proper .gitignore

## Current Work (Phase 1: Core API) 🔄

### In Progress
- 🔄 **Task CRUD Operations** (70% complete)
  - GET /api/tasks (complete)
  - POST /api/tasks (in progress)
  - PUT /api/tasks/:id (planned)
  - DELETE /api/tasks/:id (planned)

- 🔄 **User Authentication System** (40% complete)
  - User model design (complete)
  - JWT token generation (complete)
  - Login endpoint (in progress)
  - Registration endpoint (planned)

- 🔄 **Database Integration** (60% complete)
  - Basic Mongoose setup (complete)
  - Task model with validation (complete)
  - User model (in progress)
  - Relationship modeling (planned)

## Upcoming Work (Phase 2: Real-time & Frontend) 📋

### Next Sprint Priorities
1. **Socket.IO Integration**
   - Real-time task updates
   - User presence indicators
   - Team collaboration features

2. **Frontend Development**
   - React.js client application
   - Task management interface
   - User authentication UI

3. **Advanced Features**
   - File attachments for tasks
   - Task comments and discussions
   - Team management interface

## Backlog (Phase 3: Production Readiness) 📅

### Production Features
- Comprehensive error handling and logging
- Performance optimization and caching
- Security hardening and audit
- CI/CD pipeline implementation
- Docker containerization
- Production deployment configuration

### Quality Assurance
- Unit test coverage >90%
- Integration test suite
- Load testing and performance benchmarks
- Security vulnerability scanning
- User acceptance testing

## Technical Debt & Issues

### Known Issues
- **Database**: No connection retry logic implemented
- **Security**: JWT refresh token system needed
- **Logging**: Basic console logging, structured logging required
- **Testing**: Limited test coverage (current: ~45%)

### Performance Optimizations Needed
- Database query optimization
- Response caching strategy
- Asset bundling optimization
- Memory usage optimization

## Success Metrics

### Development Metrics
- **Code Coverage**: 45% (target: >90%)
- **Build Time**: <30 seconds (current: 15s)
- **Test Suite Runtime**: <10 seconds (current: 3s)

### Application Metrics
- **API Response Time**: <100ms average
- **Database Query Performance**: <50ms average
- **Memory Usage**: <512MB under normal load
- **Uptime Target**: >99.5%

## Next Review: End of Sprint 3
**Date**: [Current date + 2 weeks]
**Focus**: Phase 1 completion assessment and Phase 2 planning`
        }
      ];
      
      // Create all core files
      for (const file of coreFiles) {
        await fs.writeFile(
          path.join(memoryBankDir, file.name),
          file.content
        );
      }
      
      // Verify files were created
      const createdFiles = await fs.readdir(memoryBankDir);
      expect(createdFiles).toHaveLength(6);
      expect(createdFiles).toContain('projectbrief.md');
      expect(createdFiles).toContain('productContext.md');
      expect(createdFiles).toContain('activeContext.md');
      expect(createdFiles).toContain('systemPatterns.md');
      expect(createdFiles).toContain('techContext.md');
      expect(createdFiles).toContain('progress.md');
    }, 10000);
  });

  describe('Post-Creation Validation', () => {
    test('should validate complete memory bank successfully', async () => {
      const result = await handleValidateMemoryBank({
        projectRootPath: testProjectPath
      });

      expect(result).toHaveProperty('content');
      const validationResult = JSON.parse(result.content[0].text);
      
      expect(validationResult).toHaveProperty('status', 'valid');
      expect(validationResult).toHaveProperty('fileCount', 6);
      // Note: May have copilot integration issues, but files are present
    }, 10000);
  });

  describe('Copilot Instructions Setup', () => {
    test('should setup copilot instructions correctly', async () => {
      const result = await handleSetupCopilotInstructions({
        projectRootPath: testProjectPath
      });

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      
      const setupResult = result.content[0].text;
      expect(setupResult).toContain('Copilot instructions setup completed');
      
      // Verify the file was created
      const copilotPath = path.join(testProjectPath, '.github', 'copilot-instructions.md');
      const copilotContent = await fs.readFile(copilotPath, 'utf8');
      expect(copilotContent).toContain('Memory Bank');
      expect(copilotContent).toContain('projectbrief.md');
    }, 10000);
  });

  describe('Full Validation After Setup', () => {
    test('should validate everything including copilot integration', async () => {
      const result = await handleValidateMemoryBank({
        projectRootPath: testProjectPath
      });

      expect(result).toHaveProperty('content');
      const validationResult = JSON.parse(result.content[0].text);
      
      expect(validationResult).toHaveProperty('status', 'valid');
      expect(validationResult).toHaveProperty('fileCount', 6);
      expect(validationResult).toHaveProperty('copilotIntegration', true);
      expect(validationResult.issues).toHaveLength(0);
    }, 10000);
  });

  describe('Memory Bank Update Instructions', () => {
    test('should generate update instructions for existing memory bank', async () => {
      const result = await handleUpdateMemoryBank({
        projectRootPath: testProjectPath
      });

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      
      const updateInstructions = result.content[0].text;
      expect(updateInstructions).toContain('Memory Bank Update Instructions');
      expect(updateInstructions).toContain('integration-test-project');
      expect(updateInstructions).toContain('activeContext.md');
      expect(updateInstructions).toContain('progress.md');
    }, 10000);
  });
});