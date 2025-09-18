import fs from 'fs/promises';
import path from 'path';

import type { 
  ConversationalResponse, 
  ConversationPrompt,
  NextStepGuidance,
  AnalysisRecommendations
} from '../types/conversational.js';

/**
 * Analyzes a project and provides conversational guidance for memory bank generation
 * Includes intelligent framework detection and recommendations based on project complexity
 */
export async function analyzeProjectForConversation(
  projectRoot: string,
  mode: 'analyze-first' | 'guided' | 'express' | 'custom' = 'analyze-first'
): Promise<ConversationalResponse> {
  try {
    // Basic project analysis
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const readmePath = path.join(projectRoot, 'README.md');
    
    let projectType = 'Generic Project';
    let hasPackageJson = false;
    let detectedFrameworks: string[] = [];
    
    // Analyze package.json if exists
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      hasPackageJson = true;
      projectType = 'Node.js/TypeScript Project';
      
      // Detect frameworks and libraries
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (dependencies['@modelcontextprotocol/sdk']) detectedFrameworks.push('MCP Server');
      if (dependencies['typescript']) detectedFrameworks.push('TypeScript');
      if (dependencies['react']) detectedFrameworks.push('React');
      if (dependencies['vue']) detectedFrameworks.push('Vue');
      if (dependencies['angular']) detectedFrameworks.push('Angular');
      if (dependencies['express']) detectedFrameworks.push('Express');
      if (dependencies['next']) detectedFrameworks.push('Next.js');
      if (dependencies['jest']) detectedFrameworks.push('Jest Testing');
    } catch {
      // No package.json or invalid JSON
    }
    
    // Check for README
    try {
      await fs.access(readmePath);
      // README exists
    } catch {
      // No README
    }
    
    // Determine project complexity and make recommendations
    const complexity = detectedFrameworks.length > 2 ? 'complex' : detectedFrameworks.length > 0 ? 'moderate' : 'simple';
    
    let suggestedStructure: 'standard' | 'enhanced' | 'custom';
    let recommendedFocusAreas: string[] = [];
    let additionalFilesRecommended: Array<{category: string, files: string[], reasoning: string}> = [];
    
    if (complexity === 'complex') {
      suggestedStructure = 'enhanced';
      recommendedFocusAreas = ['architecture', 'integrations', 'testing'];
      
      if (detectedFrameworks.includes('MCP Server')) {
        additionalFilesRecommended.push({
          category: 'integrations',
          files: ['mcp-integration.md', 'tool-specifications.md'],
          reasoning: 'MCP servers benefit from detailed tool and integration documentation'
        });
      }
      
      if (detectedFrameworks.includes('Jest Testing')) {
        additionalFilesRecommended.push({
          category: 'testing',
          files: ['testing-strategy.md', 'test-coverage.md'],
          reasoning: 'Testing framework detected - comprehensive test documentation recommended'
        });
      }
    } else if (complexity === 'moderate') {
      suggestedStructure = 'enhanced';
      recommendedFocusAreas = ['architecture', 'apis'];
    } else {
      suggestedStructure = 'standard';
      recommendedFocusAreas = ['setup', 'usage'];
    }
    
    // Create conversational response based on mode
    const recommendations: AnalysisRecommendations = {
      projectType,
      suggestedStructure,
      recommendedFocusAreas,
      additionalFilesRecommended,
      confidence: hasPackageJson ? 'high' : 'medium'
    };
    
    let conversation: ConversationPrompt;
    let nextSteps: NextStepGuidance[];
    
    switch (mode) {
      case 'analyze-first':
        conversation = {
          message: `I've analyzed your ${projectType}${detectedFrameworks.length > 0 ? ` with ${detectedFrameworks.join(', ')}` : ''}. Based on the complexity, I recommend an ${suggestedStructure} memory bank structure. Would you like to proceed with this recommendation?`,
          options: [
            'Yes, use the recommended structure',
            'Show me customization options', 
            'Use standard structure instead',
            'Let me see the analysis details first'
          ],
          reasoning: `Detected ${complexity} project complexity with ${detectedFrameworks.length} frameworks/tools`,
          consequences: [
            'Enhanced structure includes semantic folders for better organization',
            'Standard structure uses only the 6 core files',
            'Customization allows you to specify exactly what you need'
          ],
          defaultChoice: 'Yes, use the recommended structure',
          priority: 'medium'
        };
        
        nextSteps = [
          {
            action: 'proceed_with_generation',
            description: 'Generate memory bank with recommended settings',
            toolName: 'generate_memory_bank',
            parameters: { 
              mode: 'guided',
              customizationOptions: {
                structureType: suggestedStructure,
                focusAreas: recommendedFocusAreas,
                detailLevel: 'detailed'
              }
            },
            optional: false
          },
          {
            action: 'customize_options',
            description: 'Configure specific options before generation',
            optional: true
          }
        ];
        break;
        
      case 'guided':
        conversation = {
          message: `Ready to generate your ${projectType} memory bank. I'll create ${suggestedStructure === 'enhanced' ? '6 core files plus organized additional files' : '6 core files'}. Should I proceed?`,
          options: [
            'Yes, generate the memory bank',
            'Let me adjust the focus areas',
            'Show me what files will be created',
            'Change to custom configuration'
          ],
          reasoning: `Configuration ready for ${suggestedStructure} structure`,
          consequences: [
            'Files will be created in .github/memory-bank directory',
            'Copilot instructions will be automatically configured',
            'You can always update or regenerate later'
          ],
          priority: 'high'
        };
        
        nextSteps = [
          {
            action: 'generate_files',
            description: 'Create memory bank files',
            toolName: 'generate_memory_bank',
            optional: false
          }
        ];
        break;
        
      case 'express':
        // For express mode, proceed immediately with smart defaults
        return {
          requiresUserInput: false,
          status: 'ready_to_proceed',
          conversation: {
            message: `Express mode: Creating ${suggestedStructure} memory bank for your ${projectType}`,
            options: [],
            reasoning: 'Using intelligent defaults for fast setup',
            consequences: ['Memory bank will be created immediately', 'You can customize later if needed'],
            priority: 'low'
          },
          nextSteps: [{
            action: 'generate_immediately',
            description: 'Generate with smart defaults',
            toolName: 'generate_memory_bank',
            parameters: { 
              customizationOptions: {
                structureType: suggestedStructure,
                focusAreas: recommendedFocusAreas,
                detailLevel: 'standard',
                autoConfirm: true
              }
            },
            optional: false
          }],
          recommendations,
          toolToCallNext: 'generate_memory_bank',
          suggestedParameters: {
            projectRootPath: projectRoot,
            mode: 'express',
            customizationOptions: {
              structureType: suggestedStructure,
              focusAreas: recommendedFocusAreas,
              detailLevel: 'standard',
              autoConfirm: true
            }
          }
        };
        
      default: // custom
        conversation = {
          message: `I've analyzed your ${projectType}. In custom mode, you have full control over the memory bank structure. What would you like to configure?`,
          options: [
            'Choose structure type (standard/enhanced/custom)',
            'Select focus areas',
            'Configure additional files',
            'Set detail level',
            'Review all options'
          ],
          reasoning: 'Custom mode allows complete control over all aspects',
          consequences: [
            'You can configure every aspect of the memory bank',
            'More options mean more decisions required',
            'Full flexibility for specialized needs'
          ],
          priority: 'medium'
        };
        
        nextSteps = [
          {
            action: 'configure_structure',
            description: 'Choose memory bank structure type',
            optional: false
          },
          {
            action: 'configure_focus',
            description: 'Select focus areas',
            optional: true
          },
          {
            action: 'configure_files',
            description: 'Choose additional files',
            optional: true
          }
        ];
    }
    
    return {
      requiresUserInput: true,
      status: 'awaiting_user_input',
      conversation,
      nextSteps,
      recommendations
    };
    
  } catch (error) {
    return {
      requiresUserInput: false,
      status: 'error',
      conversation: {
        message: `Error analyzing project: ${error instanceof Error ? error.message : 'Unknown error'}`,
        options: ['Retry analysis', 'Proceed with manual configuration'],
        reasoning: 'Project analysis failed',
        consequences: ['May need to configure options manually'],
        priority: 'high'
      },
      nextSteps: [],
      recommendations: {
        projectType: 'Unknown',
        suggestedStructure: 'standard',
        recommendedFocusAreas: [],
        additionalFilesRecommended: [],
        confidence: 'low'
      }
    };
  }
}