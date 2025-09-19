/**
 * Analyze Project Structure Tool
 * Analyze project structure to prepare for memory bank generation
 */

import { analyzeProject } from '../core/projectAnalysis.js';

export const analyzeProjectStructureTool = {
  name: 'analyze_project_structure',
  description: 'Analyze project structure to prepare for memory bank generation',
  inputSchema: {
    type: 'object',
    properties: {
      projectRootPath: {
        type: 'string',
        description: 'Root folder path to analyze',
      },
      analysisDepth: {
        type: 'string',
        enum: ['shallow', 'medium', 'deep'],
        description: 'Depth of project analysis',
      }
    },
    required: ['projectRootPath']
  }
};

export async function handleAnalyzeProjectStructure(args: any) {
  const projectRootPath = args.projectRootPath;
  const analysisDepth = args.analysisDepth || 'medium';
  
  try {
    const analysis = await analyzeProject(projectRootPath, analysisDepth);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'Project analysis completed',
            projectRootPath,
            analysisDepth,
            analysis,
            message: `✅ Project structure analyzed successfully. Found ${analysis.structure?.estimatedFiles || 0} files with ${analysis.frameworks?.length || 0} frameworks detected.`
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'Project analysis failed',
            projectRootPath,
            error: error instanceof Error ? error.message : String(error),
            message: 'Failed to analyze project structure. Please check the project path and permissions.'
          }, null, 2),
        },
      ],
    };
  }
}