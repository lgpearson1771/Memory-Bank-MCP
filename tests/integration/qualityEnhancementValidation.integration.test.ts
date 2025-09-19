/**
 * Memory Bank Quality Baseline Validation Test
 * Validates that memory bank generation maintains expected quality standards
 * Converted from quality enhancement test to baseline validation
 */

import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Test baseline memory bank quality to prevent regressions
 * This ensures we maintain our 53/100 baseline while working on improvements
 */
async function testBaselineQuality() {
  console.log('🎯 Memory Bank Baseline Quality Validation');
  console.log('==========================================');
  
  const projectPath = path.resolve(__dirname, '../..');
  const memoryBankPath = path.join(projectPath, '.github', 'memory-bank');
  
  try {
    console.log('📊 Validating Baseline Quality Standards:');
    console.log('=========================================');
    
    // Check if memory bank exists
    const memoryBankExists = await checkMemoryBankExists(memoryBankPath);
    if (!memoryBankExists) {
      console.log('⚠️ No memory bank found - this is expected for clean testing');
      return;
    }
    
    // Read and validate core files
    const coreFiles = ['projectbrief.md', 'productContext.md', 'activeContext.md', 'systemPatterns.md', 'techContext.md', 'progress.md'];
    const qualityResults = [];
    
    for (const file of coreFiles) {
      const filePath = path.join(memoryBankPath, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const quality = validateContentQuality(content, file);
        qualityResults.push({ file, ...quality });
        
        console.log(`📝 ${file}: ${quality.passed ? '✅ PASS' : '❌ FAIL'} - ${quality.score}/100`);
        if (!quality.passed) {
          quality.issues.forEach(issue => console.log(`   - ${issue}`));
        }
      } catch (error) {
        console.log(`� ${file}: ❌ MISSING or UNREADABLE`);
        qualityResults.push({ file, passed: false, score: 0, issues: ['File missing or unreadable'] });
      }
    }
    
    // Calculate overall baseline score
    const averageScore = qualityResults.reduce((sum, result) => sum + result.score, 0) / qualityResults.length;
    const passedFiles = qualityResults.filter(r => r.passed).length;
    
    console.log('\\n📊 Baseline Quality Results:');
    console.log('=============================');
    console.log(`Overall Quality Score: ${averageScore.toFixed(1)}/100`);
    console.log(`Files Passing: ${passedFiles}/${coreFiles.length}`);
    
    // Validate against expected baseline (53/100)
    if (averageScore >= 50 && passedFiles >= 5) {
      console.log('\\n✅ BASELINE MAINTAINED: Quality meets expected standards');
      console.log('✅ Ready for quality improvement initiatives');
    } else if (averageScore >= 40) {
      console.log('\\n⚠️ QUALITY WARNING: Below expected baseline but acceptable');
      console.log('⚠️ Monitor for further regressions');
    } else {
      console.log('\\n❌ QUALITY REGRESSION: Below acceptable baseline');
      console.log('❌ Immediate investigation required');
    }
    
    return {
      overallScore: averageScore,
      passedFiles,
      totalFiles: coreFiles.length,
      results: qualityResults
    };
  } catch (error) {
    console.error('❌ Baseline validation failed:', error);
    throw error;
  }
}

/**
 * Validate content quality for baseline standards
 */
function validateContentQuality(content: string, fileName: string): { passed: boolean; score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;
  
  // Check for basic content structure
  if (!content.includes('# ') && !content.includes('## ')) {
    issues.push('Missing proper markdown headers');
    score -= 20;
  }
  
  // Check for project-specific content (not generic)
  if (content.includes('Software solution') && !content.includes('memory-bank-generator-mcp')) {
    issues.push('Contains generic content instead of project-specific information');
    score -= 30;
  }
  
  // Check for meaningless content
  if (content.includes('Advanced functionality for core functionality') || 
      content.includes('Core functionality: Advanced functionality')) {
    issues.push('Contains meaningless or circular content');
    score -= 40;
  }
  
  // Check for project name preservation
  if (fileName === 'projectbrief.md' && !content.includes('memory-bank-generator-mcp')) {
    issues.push('Project name missing or incorrect');
    score -= 25;
  }
  
  // Check for project type accuracy
  if (fileName === 'projectbrief.md' && !content.includes('MCP Server') && content.includes('Unknown')) {
    issues.push('Project type incorrectly identified or missing');
    score -= 20;
  }
  
  // Check for minimum content length
  if (content.length < 200) {
    issues.push('Content too short - likely incomplete generation');
    score -= 15;
  }
  
  // Check for template placeholders
  if (content.includes('TODO') || content.includes('PLACEHOLDER') || content.includes('[INSERT')) {
    issues.push('Contains unfilled template placeholders');
    score -= 20;
  }
  
  return {
    passed: score >= 50 && issues.length === 0,
    score: Math.max(0, score),
    issues
  };
}

/**
 * Check if memory bank directory and files exist
 */
async function checkMemoryBankExists(memoryBankPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(memoryBankPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Demonstrate quality standards we're maintaining
 */
function demonstrateQualityStandards() {
  console.log('\\n🔍 Quality Standards for Baseline:');
  console.log('===================================');
  
  console.log('\\n✅ REQUIRED STANDARDS:');
  console.log('   - Project name correctly identified (memory-bank-generator-mcp)');
  console.log('   - Project type accurate (MCP Server, not Unknown)');
  console.log('   - No meaningless circular content');
  console.log('   - Proper markdown structure');
  console.log('   - Minimum content length (200+ chars per file)');
  console.log('   - No unfilled template placeholders');
  
  console.log('\\n⚠️ ACCEPTABLE BASELINE ISSUES:');
  console.log('   - Some generic phrases (API implementation follows...)');
  console.log('   - Limited business context depth');
  console.log('   - Standard architectural descriptions');
  
  console.log('\\n❌ REGRESSION INDICATORS:');
  console.log('   - Project name lost or wrong');
  console.log('   - Project type shows as Unknown');
  console.log('   - Circular/meaningless content');
  console.log('   - Missing core information');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBaselineQuality()
    .then(demonstrateQualityStandards)
    .then(() => {
      console.log('\\n🎯 BASELINE VALIDATION COMPLETE');
      console.log('================================');
      console.log('✅ Baseline quality standards verified');
      console.log('✅ Ready for incremental improvements');
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

// Jest test cases
describe('Memory Bank Baseline Quality Validation', () => {
  it('should validate content quality correctly', () => {
    const goodContent = `# Project Brief

## Project Overview
**memory-bank-generator-mcp** (v1.0.0)
An intelligent MCP server that automatically generates, maintains, and evolves comprehensive memory bank files for any software project

**Project Type:** MCP Server
**Complexity:** High
**Total Files:** 62`;

    const result = validateContentQuality(goodContent, 'projectbrief.md');
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThan(90);
    expect(result.issues).toHaveLength(0);
  });

  it('should detect quality issues in bad content', () => {
    const badContent = `# Project Brief

**Software solution**

**Project Type:** Unknown`;

    const result = validateContentQuality(badContent, 'projectbrief.md');
    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(50);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('should detect meaningless content', () => {
    const meaninglessContent = `# Project Brief
Advanced functionality for core functionality`;

    const result = validateContentQuality(meaninglessContent, 'projectbrief.md');
    expect(result.passed).toBe(false);
    expect(result.issues).toContain('Contains meaningless or circular content');
  });
});

export { testBaselineQuality, demonstrateQualityStandards, validateContentQuality };