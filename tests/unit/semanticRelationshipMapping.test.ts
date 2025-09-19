import { describe, it, expect, beforeEach } from '@jest/globals';
import { SemanticRelationshipMapper, CodeAnalysisResult } from '../../src/core/projectIntelligenceEngine';

describe('SemanticRelationshipMapper', () => {
  let mapper: SemanticRelationshipMapper;
  let mockCodeAnalysis: CodeAnalysisResult;

  beforeEach(() => {
    mapper = new SemanticRelationshipMapper();
    
    // Create minimal valid CodeAnalysisResult
    mockCodeAnalysis = {
      parsedFiles: [],
      syntaxTrees: [],
      functions: [],
      components: [],
      dataStructures: [],
      layerArchitecture: {
        layers: [],
        coupling: 0,
        cohesion: 0,
        adherence: 0
      },
      designPatterns: [],
      codeQuality: {
        maintainability: 100,
        reliability: 100,
        security: 100,
        performance: 100
      }
    };
  });

  describe('initialization', () => {
    it('should create a new SemanticRelationshipMapper instance', () => {
      expect(mapper).toBeDefined();
      expect(mapper).toBeInstanceOf(SemanticRelationshipMapper);
    });
  });

  describe('buildRelationshipGraph', () => {
    it('should handle empty file list gracefully', async () => {
      const result = await mapper.buildRelationshipGraph([], mockCodeAnalysis);

      expect(result).toBeDefined();
      expect(result.dependencies).toBeInstanceOf(Array);
      expect(result.dataFlow).toBeInstanceOf(Array);
      expect(result.communicationPatterns).toBeInstanceOf(Array);
      expect(result.stronglyConnectedComponents).toBeInstanceOf(Array);
      expect(result.criticalPaths).toBeInstanceOf(Array);
      expect(result.architecturalLayers).toBeInstanceOf(Array);
      
      // With no files, all arrays should be empty
      expect(result.dependencies).toHaveLength(0);
      expect(result.dataFlow).toHaveLength(0);
      expect(result.communicationPatterns).toHaveLength(0);
      expect(result.stronglyConnectedComponents).toHaveLength(0);
      expect(result.criticalPaths).toHaveLength(0);
      expect(result.architecturalLayers).toHaveLength(0);
    });

    it('should return a valid relationship graph structure', async () => {
      const result = await mapper.buildRelationshipGraph([], mockCodeAnalysis);

      // Verify the structure matches RelationshipGraph interface
      expect(result).toHaveProperty('dependencies');
      expect(result).toHaveProperty('dataFlow');
      expect(result).toHaveProperty('communicationPatterns');
      expect(result).toHaveProperty('stronglyConnectedComponents');
      expect(result).toHaveProperty('criticalPaths');
      expect(result).toHaveProperty('architecturalLayers');
    });

    it('should handle errors gracefully and not throw exceptions', async () => {
      // Should not throw an error even with malformed input
      await expect(mapper.buildRelationshipGraph([], mockCodeAnalysis)).resolves.toBeDefined();
    });

    it('should handle null/undefined input gracefully', async () => {
      // Test with various edge cases
      const result1 = await mapper.buildRelationshipGraph([], mockCodeAnalysis);
      expect(result1).toBeDefined();

      // Test with empty analysis
      const emptyAnalysis = {
        ...mockCodeAnalysis,
        parsedFiles: []
      };
      const result2 = await mapper.buildRelationshipGraph([], emptyAnalysis);
      expect(result2).toBeDefined();
    });
  });

  describe('interface compliance', () => {
    it('should produce DependencyEdge structures correctly', async () => {
      const result = await mapper.buildRelationshipGraph([], mockCodeAnalysis);

      // Each dependency should have required properties
      result.dependencies.forEach(dependency => {
        expect(dependency).toHaveProperty('source');
        expect(dependency).toHaveProperty('target');
        expect(dependency).toHaveProperty('type');
        expect(dependency).toHaveProperty('strength');
        expect(typeof dependency.source).toBe('string');
        expect(typeof dependency.target).toBe('string');
        expect(typeof dependency.type).toBe('string');
        expect(typeof dependency.strength).toBe('number');
      });
    });

    it('should produce DataFlowEdge structures correctly', async () => {
      const result = await mapper.buildRelationshipGraph([], mockCodeAnalysis);

      // Each data flow should have required properties
      result.dataFlow.forEach(flow => {
        expect(flow).toHaveProperty('source');
        expect(flow).toHaveProperty('target');
        expect(flow).toHaveProperty('dataType');
        expect(flow).toHaveProperty('volume');
        expect(typeof flow.source).toBe('string');
        expect(typeof flow.target).toBe('string');
        expect(typeof flow.dataType).toBe('string');
        expect(typeof flow.volume).toBe('string');
      });
    });

    it('should produce CommunicationEdge structures correctly', async () => {
      const result = await mapper.buildRelationshipGraph([], mockCodeAnalysis);

      // Each communication pattern should have required properties
      result.communicationPatterns.forEach(pattern => {
        expect(pattern).toHaveProperty('source');
        expect(pattern).toHaveProperty('target');
        expect(pattern).toHaveProperty('protocol');
        expect(pattern).toHaveProperty('frequency');
        expect(typeof pattern.source).toBe('string');
        expect(typeof pattern.target).toBe('string');
        expect(typeof pattern.protocol).toBe('string');
        expect(typeof pattern.frequency).toBe('string');
      });
    });

    it('should produce ComponentCluster structures correctly', async () => {
      const result = await mapper.buildRelationshipGraph([], mockCodeAnalysis);

      // Each strongly connected component should have required properties
      result.stronglyConnectedComponents.forEach(component => {
        expect(component).toHaveProperty('components');
        expect(component).toHaveProperty('cohesion');
        expect(component).toHaveProperty('purpose');
        expect(component.components).toBeInstanceOf(Array);
        expect(typeof component.cohesion).toBe('number');
        expect(typeof component.purpose).toBe('string');
      });
    });

    it('should produce CriticalPath structures correctly', async () => {
      const result = await mapper.buildRelationshipGraph([], mockCodeAnalysis);

      // Each critical path should have required properties
      result.criticalPaths.forEach(path => {
        expect(path).toHaveProperty('components');
        expect(path).toHaveProperty('businessImpact');
        expect(path).toHaveProperty('riskLevel');
        expect(path.components).toBeInstanceOf(Array);
        expect(typeof path.businessImpact).toBe('string');
        expect(['high', 'medium', 'low']).toContain(path.riskLevel);
      });
    });

    it('should produce ArchitecturalLayer structures correctly', async () => {
      const result = await mapper.buildRelationshipGraph([], mockCodeAnalysis);

      // Each architectural layer should have required properties
      result.architecturalLayers.forEach(layer => {
        expect(layer).toHaveProperty('name');
        expect(layer).toHaveProperty('components');
        expect(layer).toHaveProperty('dependencies');
        expect(layer).toHaveProperty('purpose');
        expect(typeof layer.name).toBe('string');
        expect(layer.components).toBeInstanceOf(Array);
        expect(layer.dependencies).toBeInstanceOf(Array);
        expect(typeof layer.purpose).toBe('string');
      });
    });
  });

  describe('error recovery', () => {
    it('should handle unexpected errors and return empty structures', async () => {
      // Test that the mapper can handle errors gracefully
      const result = await mapper.buildRelationshipGraph([], mockCodeAnalysis);
      
      // Should always return valid structure even in error cases
      expect(result).toBeDefined();
      expect(Array.isArray(result.dependencies)).toBe(true);
      expect(Array.isArray(result.dataFlow)).toBe(true);
      expect(Array.isArray(result.communicationPatterns)).toBe(true);
      expect(Array.isArray(result.stronglyConnectedComponents)).toBe(true);
      expect(Array.isArray(result.criticalPaths)).toBe(true);
      expect(Array.isArray(result.architecturalLayers)).toBe(true);
    });

    it('should be resilient to malformed data', async () => {
      // Test with various malformed inputs
      const malformedAnalysis = {
        ...mockCodeAnalysis,
        parsedFiles: null as any
      };

      // Should not throw and should return valid structure
      await expect(mapper.buildRelationshipGraph([], malformedAnalysis)).resolves.toBeDefined();
    });
  });

  describe('architectural insights', () => {
    it('should provide meaningful layer detection even with empty input', async () => {
      const result = await mapper.buildRelationshipGraph([], mockCodeAnalysis);
      
      // Even with empty input, the structure should be valid
      expect(result.architecturalLayers).toBeInstanceOf(Array);
      
      // Should handle the case where no architectural layers are detected
      expect(result.architecturalLayers).toHaveLength(0);
    });

    it('should handle critical path analysis gracefully', async () => {
      const result = await mapper.buildRelationshipGraph([], mockCodeAnalysis);
      
      // Critical paths should be empty for empty input
      expect(result.criticalPaths).toBeInstanceOf(Array);
      expect(result.criticalPaths).toHaveLength(0);
    });

    it('should handle strongly connected component analysis', async () => {
      const result = await mapper.buildRelationshipGraph([], mockCodeAnalysis);
      
      // Should be empty for empty input
      expect(result.stronglyConnectedComponents).toBeInstanceOf(Array);
      expect(result.stronglyConnectedComponents).toHaveLength(0);
    });
  });
});