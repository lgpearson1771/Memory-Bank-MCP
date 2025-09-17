/**
 * Test script to demonstrate the new conversational workflow
 */

import { analyzeProjectForConversation } from './dist/fileOperations.js';

async function testConversationalWorkflow() {
  console.log('🧪 Testing Conversational Memory Bank Generation\n');
  
  const testProjectPath = 'c:\\MCPs\\Memory-Bank-MCP';
  
  try {
    console.log('📋 Mode: analyze-first');
    const analyzeFirstResult = await analyzeProjectForConversation(testProjectPath, 'analyze-first');
    
    console.log('✅ Analysis Complete!');
    console.log('🤖 Conversational Response:');
    console.log(`   Status: ${analyzeFirstResult.status}`);
    console.log(`   Requires User Input: ${analyzeFirstResult.requiresUserInput}`);
    console.log(`   Project Type: ${analyzeFirstResult.recommendations.projectType}`);
    console.log(`   Suggested Structure: ${analyzeFirstResult.recommendations.suggestedStructure}`);
    console.log(`   Confidence: ${analyzeFirstResult.recommendations.confidence}`);
    
    console.log('\n💬 Conversation Prompt:');
    console.log(`   Message: ${analyzeFirstResult.conversation.message}`);
    console.log(`   Options: ${analyzeFirstResult.conversation.options.join(', ')}`);
    console.log(`   Reasoning: ${analyzeFirstResult.conversation.reasoning}`);
    console.log(`   Priority: ${analyzeFirstResult.conversation.priority}`);
    
    console.log('\n📋 Next Steps:');
    analyzeFirstResult.nextSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step.action}: ${step.description}`);
      if (step.toolName) console.log(`      Tool: ${step.toolName}`);
      console.log(`      Optional: ${step.optional}`);
    });
    
    console.log('\n🎯 Recommended Focus Areas:');
    analyzeFirstResult.recommendations.recommendedFocusAreas.forEach(area => {
      console.log(`   • ${area}`);
    });
    
    if (analyzeFirstResult.recommendations.additionalFilesRecommended.length > 0) {
      console.log('\n📄 Additional Files Recommended:');
      analyzeFirstResult.recommendations.additionalFilesRecommended.forEach(category => {
        console.log(`   📁 ${category.category}: ${category.files.join(', ')}`);
        console.log(`      Reasoning: ${category.reasoning}`);
      });
    }
    
    console.log('\n🚀 Testing Express Mode...');
    const expressResult = await analyzeProjectForConversation(testProjectPath, 'express');
    console.log(`   Express Mode Status: ${expressResult.status}`);
    console.log(`   Requires User Input: ${expressResult.requiresUserInput}`);
    console.log(`   Tool to Call Next: ${expressResult.toolToCallNext || 'None'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConversationalWorkflow();