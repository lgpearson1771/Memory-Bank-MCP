import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  analyzeProject,
  analyzeOrganizationPatterns,
  analyzeArchitecturalHints,
  analyzeEnterprisePatterns,
  analyzeBusinessContext
} from '../../src/core/projectAnalysis.js';
import { TestCleanup } from '../helpers/testCleanup.js';

describe('Enhanced Project Analysis - Phase 1 Features', () => {
  let testTempDir: string;
  
  beforeEach(async () => {
    testTempDir = await TestCleanup.setupTest('enhanced-analysis');
  });

  afterEach(async () => {
    await TestCleanup.cleanupTest(testTempDir);
  });

  describe('Organization Pattern Analysis', () => {
    test('should detect MVC architecture pattern', () => {
      const directories = [
        'src/controllers/UserController.ts',
        'src/models/User.ts', 
        'src/views/UserView.tsx'
      ];
      
      const patterns = analyzeOrganizationPatterns(directories);
      
      const mvcPattern = patterns.find(p => p.type === 'MVC');
      expect(mvcPattern).toBeDefined();
      expect(mvcPattern?.confidence).toBeGreaterThan(0.7);
      expect(mvcPattern?.description).toContain('Model-View-Controller');
    });

    test('should detect layered architecture pattern', () => {
      const directories = [
        'src/controllers',
        'src/services',
        'src/repositories'
      ];
      
      const patterns = analyzeOrganizationPatterns(directories);
      
      const layeredPattern = patterns.find(p => p.type === 'Layered');
      expect(layeredPattern).toBeDefined();
      expect(layeredPattern?.confidence).toBeGreaterThan(0.8);
      expect(layeredPattern?.indicators).toContain('controllers/');
    });

    test('should detect domain-driven design pattern', () => {
      const directories = [
        'src/domain/User.ts',
        'src/domain/aggregates/UserAggregate.ts',
        'src/entities/UserEntity.ts'
      ];
      
      const patterns = analyzeOrganizationPatterns(directories);
      
      const domainPattern = patterns.find(p => p.type === 'Domain-Driven');
      expect(domainPattern).toBeDefined();
      expect(domainPattern?.confidence).toBeGreaterThan(0.6);
    });

    test('should detect modular architecture', () => {
      const directories = [
        'src/modules/user/UserModule.ts',
        'lib/shared/Utils.ts',
        'core/BaseService.ts'
      ];
      
      const patterns = analyzeOrganizationPatterns(directories);
      
      const modularPattern = patterns.find(p => p.type === 'Modular');
      expect(modularPattern).toBeDefined();
      expect(modularPattern?.indicators).toContain('modules/');
    });

    test('should detect feature-based organization', () => {
      const directories = [
        'features/authentication',
        'features/dashboard', 
        'features/reporting',
        'features/admin'
      ];
      
      const patterns = analyzeOrganizationPatterns(directories);
      
      const featurePattern = patterns.find(p => p.type === 'Feature-Based');
      expect(featurePattern).toBeDefined();
      expect(featurePattern?.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Architectural Hints Analysis', () => {
    test('should detect pipeline architecture hint', () => {
      const rootFiles = ['package.json', 'docker-compose.yml'];
      const sourceAnalysis = {
        directories: ['src/pipeline/stages', 'src/processors', 'src/pipeline/orchestrator']
      };
      
      const hints = analyzeArchitecturalHints(rootFiles, sourceAnalysis);
      
      const pipelineHint = hints.find(h => h.pattern === 'Pipeline Architecture');
      expect(pipelineHint).toBeDefined();
      expect(pipelineHint?.confidence).toBeGreaterThan(0.7);
      expect(pipelineHint?.implications).toContain('Multi-stage data processing');
    });

    test('should detect microservices architecture hint', () => {
      const rootFiles = ['docker-compose.yml', 'package.json'];
      const sourceAnalysis = {
        directories: ['src/services/user-service', 'src/services/payment-service', 'api/gateway']
      };
      
      const hints = analyzeArchitecturalHints(rootFiles, sourceAnalysis);
      
      const microservicesHint = hints.find(h => h.pattern === 'Microservices Architecture');
      expect(microservicesHint).toBeDefined();
      expect(microservicesHint?.evidence).toContain('docker-compose.yml');
      expect(microservicesHint?.implications).toContain('Service independence');
    });

    test('should detect event-driven architecture hint', () => {
      const rootFiles = ['package.json'];
      const sourceAnalysis = {
        directories: ['src/events/handlers', 'src/queues', 'src/event-store']
      };
      
      const hints = analyzeArchitecturalHints(rootFiles, sourceAnalysis);
      
      const eventHint = hints.find(h => h.pattern === 'Event-Driven Architecture');
      expect(eventHint).toBeDefined();
      expect(eventHint?.implications).toContain('Asynchronous processing');
    });

    test('should detect enterprise integration hint', () => {
      const rootFiles = ['package.json'];
      const sourceAnalysis = {
        directories: ['src/integrations/sap', 'src/connectors/salesforce', 'src/adapters']
      };
      
      const hints = analyzeArchitecturalHints(rootFiles, sourceAnalysis);
      
      const enterpriseHint = hints.find(h => h.pattern === 'Enterprise Integration');
      expect(enterpriseHint).toBeDefined();
      expect(enterpriseHint?.implications).toContain('External system integration');
    });
  });

  describe('Enterprise Pattern Analysis', () => {
    test('should detect Microsoft ecosystem pattern', () => {
      const dependencies = {
        '@azure/storage-blob': '^12.0.0',
        '@azure/cosmos': '^3.0.0',
        'msal-node': '^1.0.0'
      };
      const sourceAnalysis = { 
        directories: [],
        other: ['src/Services.cs', 'src/Controllers.cs'] 
      };
      
      const patterns = analyzeEnterprisePatterns([], dependencies, sourceAnalysis);
      
      const microsoftPattern = patterns.find(p => p.type === 'Microsoft-Ecosystem');
      expect(microsoftPattern?.detected).toBe(true);
      expect(microsoftPattern?.indicators).toContain('Azure dependencies');
    });

    test('should detect service-oriented architecture pattern', () => {
      const dependencies = { 'express': '^4.0.0' };
      const sourceAnalysis = {
        directories: ['src/services', 'src/api'],
        other: []
      };
      
      const patterns = analyzeEnterprisePatterns([], dependencies, sourceAnalysis);
      
      const soaPattern = patterns.find(p => p.type === 'Service-Oriented');
      expect(soaPattern?.detected).toBe(true);
      expect(soaPattern?.indicators).toContain('services/');
    });

    test('should detect pipeline architecture pattern', () => {
      const dependencies = {};
      const sourceAnalysis = {
        directories: ['src/pipeline', 'src/stages'],
        other: []
      };
      
      const patterns = analyzeEnterprisePatterns([], dependencies, sourceAnalysis);
      
      const pipelinePattern = patterns.find(p => p.type === 'Pipeline-Architecture');
      expect(pipelinePattern?.detected).toBe(true);
      expect(pipelinePattern?.description).toContain('Multi-stage pipeline');
    });

    test('should detect enterprise library pattern', () => {
      const dependencies = {
        'enterprise-commons': '^2.0.0',
        'shared-utilities': '^1.5.0',
        '@company/enterprise-sdk': '^3.0.0'
      };
      const sourceAnalysis = { directories: [], other: [] };
      
      const patterns = analyzeEnterprisePatterns([], dependencies, sourceAnalysis);
      
      const enterpriseLibPattern = patterns.find(p => p.type === 'Enterprise-Library');
      expect(enterpriseLibPattern?.detected).toBe(true);
      expect(enterpriseLibPattern?.indicators).toContain('Enterprise libraries');
    });

    test('should detect monitoring integration pattern', () => {
      const dependencies = {
        'winston': '^3.0.0',
        'prometheus-client': '^14.0.0',
        '@opentelemetry/api': '^1.0.0',
        'newrelic': '^9.0.0'
      };
      const sourceAnalysis = { directories: [], other: [] };
      
      const patterns = analyzeEnterprisePatterns([], dependencies, sourceAnalysis);
      
      const monitoringPattern = patterns.find(p => p.type === 'Monitoring-Integration');
      expect(monitoringPattern?.detected).toBe(true);
      expect(monitoringPattern?.indicators).toContain('Logging frameworks');
    });
  });

  describe('Business Context Analysis', () => {
    test('should identify enterprise domain type', () => {
      const dependencies = {
        '@azure/cosmos': '^3.0.0',
        'enterprise-auth': '^2.0.0'
      };
      
      const context = analyzeBusinessContext('Backend API', {}, [], dependencies);
      
      expect(context.domainType).toBe('Enterprise');
      expect(context.businessValue).toContain('Process automation');
      expect(context.userTypes).toContain('Enterprise developers');
    });

    test('should identify gaming domain type', () => {
      const dependencies = {
        'phaser': '^3.0.0',
        'game-engine': '^1.0.0'
      };
      
      const context = analyzeBusinessContext('Frontend Application', {}, [], dependencies);
      
      expect(context.domainType).toBe('Gaming');
      expect(context.problemDomain).toBe('Interactive entertainment and user engagement');
    });

    test('should identify developer tool domain type', () => {
      const context = analyzeBusinessContext('CLI Tool', {}, [], {});
      
      expect(context.domainType).toBe('Developer-Tool');
      expect(context.businessValue).toContain('Developer productivity');
      expect(context.userTypes).toContain('Software developers');
    });

    test('should identify MCP server problem domain', () => {
      const context = analyzeBusinessContext('MCP Server', {}, [], {});
      
      expect(context.problemDomain).toBe('AI assistant integration and tool protocol implementation');
    });

    test('should identify consumer domain for frontend apps', () => {
      const dependencies = {
        'react': '^18.0.0',
        'vue': '^3.0.0'
      };
      
      const context = analyzeBusinessContext('Frontend Application', {}, [], dependencies);
      
      expect(context.domainType).toBe('Consumer');
      expect(context.businessValue).toContain('User experience');
      expect(context.userTypes).toContain('End users');
    });

    test('should identify integration context', () => {
      const dependencies = {
        '@azure/storage': '^12.0.0',
        'aws-sdk': '^3.0.0',
        'mysql2': '^3.0.0',
        'axios': '^1.0.0'
      };
      
      const context = analyzeBusinessContext('Backend API', {}, [], dependencies);
      
      expect(context.integrationContext).toContain('Azure cloud services');
      expect(context.integrationContext).toContain('AWS cloud services');
      expect(context.integrationContext).toContain('Database systems');
      expect(context.integrationContext).toContain('REST API services');
    });
  });

  describe('Enhanced Project Analysis Integration', () => {
    test('should provide enhanced analysis for enterprise project', async () => {
      const projectDir = path.join(testTempDir, 'enterprise-project');
      await fs.mkdir(path.join(projectDir, 'src', 'controllers'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'src', 'services'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'src', 'repositories'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'src', 'integrations'), { recursive: true });
      
      const packageJson = {
        name: 'enterprise-service',
        version: '2.1.0',
        description: 'Enterprise service for business automation',
        dependencies: {
          'express': '^4.18.0',
          '@azure/cosmos': '^3.17.0',
          'winston': '^3.8.0'
        }
      };
      
      await fs.writeFile(
        path.join(projectDir, 'package.json'), 
        JSON.stringify(packageJson, null, 2)
      );
      await fs.writeFile(path.join(projectDir, 'docker-compose.yml'), 'version: "3.8"');
      
      const result = await analyzeProject(projectDir, 'deep');
      
      // Verify enhanced structure analysis
      expect(result.structure.organizationPatterns).toBeDefined();
      expect(result.structure.organizationPatterns.length).toBeGreaterThan(0);
      
      const layeredPattern = result.structure.organizationPatterns.find(p => p.type === 'Layered');
      expect(layeredPattern).toBeDefined();
      
      expect(result.structure.architecturalHints).toBeDefined();
      expect(result.structure.enterprisePatterns).toBeDefined();
      
      // Verify enhanced architecture analysis
      expect(result.architecture.systemType).toBeDefined();
      expect(result.architecture.systemType).not.toBe('Unknown');
      expect(result.architecture.serviceArchitecture).toBeDefined();
      expect(result.architecture.serviceArchitecture.hasControllers).toBe(true);
      expect(result.architecture.serviceArchitecture.hasServices).toBe(true);
      expect(result.architecture.enterpriseIntegration).toBeDefined();
      
      // Verify business context analysis
      expect(result.businessContext).toBeDefined();
      expect(result.businessContext.domainType).toBe('Enterprise');
      expect(result.businessContext.problemDomain).toBe('Enterprise business process automation and integration');
      expect(result.businessContext.businessValue).toContain('Process automation');
    });

    test('should detect pipeline architecture project correctly', async () => {
      const projectDir = path.join(testTempDir, 'pipeline-project');
      await fs.mkdir(path.join(projectDir, 'src', 'pipeline', 'stages'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'src', 'processors'), { recursive: true });
      
      const packageJson = {
        name: 'data-pipeline',
        description: 'Multi-stage data processing pipeline',
        dependencies: {
          'node-cron': '^3.0.0',
          'kafka-node': '^5.0.0'
        }
      };
      
      await fs.writeFile(
        path.join(projectDir, 'package.json'), 
        JSON.stringify(packageJson, null, 2)
      );
      
      const result = await analyzeProject(projectDir, 'deep');
      
      expect(result.architecture.systemType).toBe('Pipeline');
      
      const pipelinePattern = result.structure.enterprisePatterns.find(p => p.type === 'Pipeline-Architecture');
      expect(pipelinePattern?.detected).toBe(true);
      
      const pipelineHint = result.structure.architecturalHints.find(h => h.pattern === 'Pipeline Architecture');
      expect(pipelineHint).toBeDefined();
    });

    test('should maintain backward compatibility with existing tests', async () => {
      const projectDir = path.join(testTempDir, 'basic-project');
      await fs.mkdir(path.join(projectDir, 'src'), { recursive: true });
      
      const packageJson = {
        name: 'simple-app',
        version: '1.0.0',
        dependencies: { 'express': '^4.18.0' }
      };
      
      await fs.writeFile(
        path.join(projectDir, 'package.json'), 
        JSON.stringify(packageJson, null, 2)
      );
      
      const result = await analyzeProject(projectDir);
      
      // Verify all original properties still exist
      expect(result.projectName).toBe('simple-app');
      expect(result.projectType).toBeDefined();
      expect(result.frameworks).toBeDefined();
      expect(result.structure.rootFiles).toBeDefined();
      expect(result.structure.directories).toBeDefined();
      expect(result.dependencies).toBeDefined();
      expect(result.architecture.patterns).toBeDefined();
      expect(result.recommendations).toBeDefined();
      
      // Verify enhanced properties are added
      expect(result.structure.organizationPatterns).toBeDefined();
      expect(result.structure.architecturalHints).toBeDefined();
      expect(result.structure.enterprisePatterns).toBeDefined();
      expect(result.architecture.systemType).toBeDefined();
      expect(result.architecture.serviceArchitecture).toBeDefined();
      expect(result.architecture.enterpriseIntegration).toBeDefined();
      expect(result.businessContext).toBeDefined();
    });
  });

  describe('Quality Baseline Validation', () => {
    test('should demonstrate significant improvement over basic analysis', async () => {
      const projectDir = path.join(testTempDir, 'improvement-test');
      await fs.mkdir(path.join(projectDir, 'src', 'controllers'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'src', 'services'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'src', 'repositories'), { recursive: true });
      
      const packageJson = {
        name: 'test-service',
        description: 'Test enterprise service',
        dependencies: { '@azure/cosmos': '^3.0.0', 'express': '^4.0.0' }
      };
      
      await fs.writeFile(
        path.join(projectDir, 'package.json'), 
        JSON.stringify(packageJson, null, 2)
      );
      
      const result = await analyzeProject(projectDir, 'deep');
      
      // Quality improvements achieved
      expect(result.businessContext.domainType).not.toBe('Unknown');
      expect(result.businessContext.problemDomain).not.toBe('General software development');
      expect(result.architecture.systemType).not.toBe('Unknown');
      expect(result.structure.organizationPatterns.length).toBeGreaterThan(0);
      expect(result.structure.enterprisePatterns.some(p => p.detected)).toBe(true);
      
      // Business context specificity
      expect(result.businessContext.businessValue.length).toBeGreaterThan(0);
      expect(result.businessContext.userTypes.length).toBeGreaterThan(0);
      
      // Enterprise pattern detection
      const microsoftPattern = result.structure.enterprisePatterns.find(p => p.type === 'Microsoft-Ecosystem');
      expect(microsoftPattern?.detected).toBe(true);
    });
  });
});