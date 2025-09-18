/**
 * Conversational workflow interfaces for Memory Bank Generator
 */

export interface ConversationalResponse {
  requiresUserInput: boolean;
  status: 'analysis_complete' | 'awaiting_user_input' | 'ready_to_proceed' | 'completed' | 'error';
  conversation: ConversationPrompt;
  nextSteps: NextStepGuidance[];
  recommendations: AnalysisRecommendations;
  toolToCallNext?: string;
  suggestedParameters?: any;
}

export interface ConversationPrompt {
  message: string;
  options: string[];
  reasoning: string;
  consequences: string[];
  defaultChoice?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface NextStepGuidance {
  action: string;
  description: string;
  toolName?: string;
  parameters?: any;
  optional: boolean;
}

export interface AnalysisRecommendations {
  projectType: string;
  suggestedStructure: 'standard' | 'enhanced' | 'custom';
  recommendedFocusAreas: string[];
  additionalFilesRecommended: {
    category: string;
    files: string[];
    reasoning: string;
  }[];
  confidence: 'low' | 'medium' | 'high';
}