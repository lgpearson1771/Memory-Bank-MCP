/**
 * Integration tests for Dynamic Content Synthesis Engine
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { DynamicContentSynthesisEngine } from '../../src/core/intelligence/contentSynthesis';
import { ProjectIntelligence, SynthesizedContent } from '../../src/core/intelligence/types';

describe('Dynamic Content Synthesis Engine Integration Tests', () => {
  let contentSynthesizer: DynamicContentSynthesisEngine;
  let mockProjectIntelligence: ProjectIntelligence;

  beforeEach(() => {
    contentSynthesizer = new DynamicContentSynthesisEngine();
    
    // Create simplified mock project intelligence data
    mockProjectIntelligence = {
      codeAnalysis: {
        parsedFiles: [],
        syntaxTrees: [],
        functions: [],
        components: [],
        dataStructures: [],
        layerArchitecture: {
          layers: [],
          layerViolations: [],
          cohesion: 0.8,
          coupling: 0.2
        },
        designPatterns: [],
        codeQuality: {
          cyclomaticComplexity: 10,
          maintainabilityIndex: 75,
          codeSmells: [],
          duplicatedCodeBlocks: [],
          testCoverage: {
            overallCoverage: 85,
            unitTestCoverage: 90,
            integrationTestCoverage: 75,
            untested: [],
            testQuality: []
          }
        }
      },
      architecturalPatterns: [
        {
          name: 'Modular Architecture',
          confidence: 0.9,
          evidence: [
            {
              type: 'structural',
              description: 'Clear module separation',
              location: 'src/',
              strength: 0.9
            }
          ],
          benefits: ['Maintainability', 'Scalability'],
          implementation: 'TypeScript modules with clear boundaries'
        }
      ],
      businessContext: {
        componentFunctionality: 'Automated memory bank generation',
        domainArea: 'Developer Tools',
        userPersonas: ['Developers', 'Technical Writers'],
        businessGoals: [
          {
            goal: 'Improve documentation quality',
            priority: 'high',
            measurableOutcome: 'Reduce manual editing by 70%'
          }
        ],
        businessWorkflows: [],
        stakeholderAnalysis: [],
        businessValue: 'Transforms manual documentation processes'
      },
      relationships: {
        dependencies: [],
        dataFlow: [],
        communicationPatterns: [],
        stronglyConnectedComponents: [],
        criticalPaths: [],
        architecturalLayers: []
      },
      analysisCompleteness: 0.85,
      confidenceScore: 0.9,
      complexityAssessment: 'Moderate',
      qualityMetrics: {
        analysisDepth: 0.8,
        codeUnderstanding: 0.85,
        architecturalCoherence: 0.9,
        businessAlignmentScore: 0.75
      }
    };
  });

  describe('Content Synthesis', () => {
    it('should synthesize comprehensive project content', async () => {
      const result: SynthesizedContent = await contentSynthesizer.synthesizeContent(mockProjectIntelligence);

      expect(result).toBeDefined();
      expect(result.sections).toBeDefined();
      expect(result.businessContext).toBeDefined();
      expect(result.technicalArchitecture).toBeDefined();
      expect(result.qualityMetrics).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should generate project overview section', async () => {
      const result: SynthesizedContent = await contentSynthesizer.synthesizeContent(mockProjectIntelligence);

      expect(result.sections['project-overview']).toBeDefined();
      expect(result.sections['project-overview']).toContain('# Project Overview');
      expect(result.sections['project-overview']).toContain('Purpose and Vision');
      expect(result.sections['project-overview']).toContain('Business Value');
    });

    it('should extract business context accurately', async () => {
      const result: SynthesizedContent = await contentSynthesizer.synthesizeContent(mockProjectIntelligence);

      expect(result.businessContext.purpose).toBeDefined();
      expect(result.businessContext.domain).toBeDefined();
      expect(result.businessContext.targetAudience).toBeDefined();
      expect(result.businessContext.keyFeatures).toBeDefined();
      expect(result.businessContext.businessValue).toBeDefined();

      // Verify content is project-specific, not generic
      expect(result.businessContext.purpose).not.toBe('');
      expect(result.businessContext.domain).not.toBe('');
    });

    it('should calculate quality metrics', async () => {
      const result: SynthesizedContent = await contentSynthesizer.synthesizeContent(mockProjectIntelligence);

      expect(result.qualityMetrics.specificityScore).toBeGreaterThan(0);
      expect(result.qualityMetrics.professionalToneScore).toBeGreaterThan(0);
      expect(result.qualityMetrics.businessContextScore).toBeGreaterThan(0);
      expect(result.qualityMetrics.technicalAccuracyScore).toBeGreaterThan(0);
      expect(result.qualityMetrics.narrativeCoherenceScore).toBeGreaterThan(0);
      expect(result.qualityMetrics.overallQualityScore).toBeGreaterThan(0);

      // Verify quality scores are within expected range (0-100)
      expect(result.qualityMetrics.specificityScore).toBeLessThanOrEqual(100);
      expect(result.qualityMetrics.overallQualityScore).toBeLessThanOrEqual(100);
    });

    it('should achieve target quality thresholds', async () => {
      const result: SynthesizedContent = await contentSynthesizer.synthesizeContent(mockProjectIntelligence);

      // Verify quality metrics meet Phase 2 targets
      expect(result.qualityMetrics.specificityScore).toBeGreaterThan(80); // Target: 85%
      expect(result.qualityMetrics.professionalToneScore).toBeGreaterThan(85); // Target: 90%
      expect(result.qualityMetrics.businessContextScore).toBeGreaterThan(75); // Target: 80%
      expect(result.qualityMetrics.technicalAccuracyScore).toBeGreaterThan(80); // Target: 85%
      expect(result.qualityMetrics.overallQualityScore).toBeGreaterThan(80); // Target: 85%
    });
  });

  describe('Error Handling', () => {
    it('should handle synthesis failures gracefully', async () => {
      // Test with minimal intelligence data - create minimal valid structure
      const minimalIntelligence: ProjectIntelligence = {
        codeAnalysis: {
          parsedFiles: [],
          syntaxTrees: [],
          functions: [],
          components: [],
          dataStructures: [],
          layerArchitecture: {
            layers: [],
            layerViolations: [],
            cohesion: 0,
            coupling: 0
          },
          designPatterns: [],
          codeQuality: {
            cyclomaticComplexity: 0,
            maintainabilityIndex: 0,
            codeSmells: [],
            duplicatedCodeBlocks: [],
            testCoverage: {
              overallCoverage: 0,
              unitTestCoverage: 0,
              integrationTestCoverage: 0,
              untested: [],
              testQuality: []
            }
          }
        },
        architecturalPatterns: [],
        businessContext: {
          componentFunctionality: '',
          domainArea: '',
          userPersonas: [],
          businessGoals: [],
          businessWorkflows: [],
          stakeholderAnalysis: [],
          businessValue: ''
        },
        relationships: {
          dependencies: [],
          dataFlow: [],
          communicationPatterns: [],
          stronglyConnectedComponents: [],
          criticalPaths: [],
          architecturalLayers: []
        },
        analysisCompleteness: 0,
        confidenceScore: 0,
        complexityAssessment: 'Simple',
        qualityMetrics: {
          analysisDepth: 0,
          codeUnderstanding: 0,
          architecturalCoherence: 0,
          businessAlignmentScore: 0
        }
      };

      await expect(contentSynthesizer.synthesizeContent(minimalIntelligence)).resolves.toBeDefined();
    });
  });
});