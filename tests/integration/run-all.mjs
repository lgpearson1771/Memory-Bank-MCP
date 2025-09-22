#!/usr/bin/env node
/**
 * Master Integration Test Runner
 * Runs all integration test suites and provides comprehensive reporting
 */

import { IntegrationTestSuite } from './end-to-end-workflow.test.mjs';
import { EdgeCasesTestSuite } from './edge-cases.test.mjs';
import { PerformanceTestSuite } from './performance.test.mjs';

class MasterTestRunner {
  constructor() {
    this.suiteResults = [];
    this.startTime = Date.now();
  }

  async log(message) {
    console.log(message);
  }

  async runSuite(suiteName, SuiteClass) {
    await this.log(`\n${'='.repeat(70)}`);
    await this.log(`🚀 Starting ${suiteName}`);
    await this.log(`${'='.repeat(70)}`);
    
    const suite = new SuiteClass();
    const startTime = Date.now();
    
    try {
      const success = await suite.runAllTests();
      const duration = Date.now() - startTime;
      
      this.suiteResults.push({
        name: suiteName,
        status: success ? 'PASSED' : 'FAILED',
        duration,
        tests: suite.testResults || []
      });
      
      await this.log(`\n📊 ${suiteName} completed in ${duration}ms`);
      return success;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.suiteResults.push({
        name: suiteName,
        status: 'FAILED',
        duration,
        error: error.message,
        tests: []
      });
      
      await this.log(`\n❌ ${suiteName} failed: ${error.message}`);
      return false;
    }
  }

  async generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const passedSuites = this.suiteResults.filter(s => s.status === 'PASSED').length;
    const failedSuites = this.suiteResults.filter(s => s.status === 'FAILED').length;
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    for (const suite of this.suiteResults) {
      totalTests += suite.tests.length;
      passedTests += suite.tests.filter(t => t.status === 'PASSED').length;
      failedTests += suite.tests.filter(t => t.status === 'FAILED').length;
    }

    await this.log(`\n${'='.repeat(80)}`);
    await this.log(`📋 COMPREHENSIVE INTEGRATION TEST REPORT`);
    await this.log(`${'='.repeat(80)}`);
    
    await this.log(`\n🏢 TEST SUITES SUMMARY:`);
    await this.log(`${'─'.repeat(40)}`);
    
    for (const suite of this.suiteResults) {
      const icon = suite.status === 'PASSED' ? '✅' : '❌';
      const duration = `${suite.duration}ms`;
      await this.log(`${icon} ${suite.name.padEnd(30)} ${suite.status.padEnd(8)} ${duration}`);
      
      if (suite.status === 'FAILED' && suite.error) {
        await this.log(`   Error: ${suite.error}`);
      }
    }
    
    await this.log(`\n📊 DETAILED TEST BREAKDOWN:`);
    await this.log(`${'─'.repeat(40)}`);
    
    for (const suite of this.suiteResults) {
      if (suite.tests.length > 0) {
        const suitePassed = suite.tests.filter(t => t.status === 'PASSED').length;
        const suiteFailed = suite.tests.filter(t => t.status === 'FAILED').length;
        
        await this.log(`\n${suite.name}:`);
        await this.log(`  ✅ Passed: ${suitePassed}`);
        await this.log(`  ❌ Failed: ${suiteFailed}`);
        await this.log(`  📈 Total:  ${suite.tests.length}`);
        
        // Show failed tests
        const failedTests = suite.tests.filter(t => t.status === 'FAILED');
        if (failedTests.length > 0) {
          await this.log(`  Failed tests:`);
          for (const test of failedTests) {
            await this.log(`    - ${test.name}: ${test.error}`);
          }
        }
      }
    }
    
    await this.log(`\n🎯 OVERALL SUMMARY:`);
    await this.log(`${'─'.repeat(40)}`);
    await this.log(`Test Suites: ${passedSuites} passed, ${failedSuites} failed`);
    await this.log(`Individual Tests: ${passedTests} passed, ${failedTests} failed`);
    await this.log(`Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
    
    // Performance insights
    const performanceSuite = this.suiteResults.find(s => s.name.includes('Performance'));
    if (performanceSuite && performanceSuite.tests.length > 0) {
      await this.log(`\n⚡ PERFORMANCE INSIGHTS:`);
      await this.log(`${'─'.repeat(40)}`);
      
      const performanceTests = performanceSuite.tests.filter(t => t.result?.duration);
      if (performanceTests.length > 0) {
        const avgDuration = performanceTests.reduce((sum, test) => sum + test.result.duration, 0) / performanceTests.length;
        const fastestTest = performanceTests.reduce((prev, current) => 
          (prev.result.duration < current.result.duration) ? prev : current
        );
        const slowestTest = performanceTests.reduce((prev, current) => 
          (prev.result.duration > current.result.duration) ? prev : current
        );
        
        await this.log(`Average Test Duration: ${avgDuration.toFixed(2)}ms`);
        await this.log(`Fastest Test: ${fastestTest.name} (${fastestTest.result.duration.toFixed(2)}ms)`);
        await this.log(`Slowest Test: ${slowestTest.name} (${slowestTest.result.duration.toFixed(2)}ms)`);
      }
    }
    
    await this.log(`\n🏆 FINAL RESULT:`);
    await this.log(`${'─'.repeat(40)}`);
    
    if (failedSuites === 0 && failedTests === 0) {
      await this.log(`🎉 ALL TESTS PASSED! 🎉`);
      await this.log(`The Memory Bank MCP Server is ready for production use.`);
      await this.log(`End-to-end workflow verified with ${totalTests} tests across ${this.suiteResults.length} suites.`);
    } else {
      await this.log(`❌ TESTS FAILED`);
      await this.log(`${failedSuites} test suite(s) and ${failedTests} individual test(s) failed.`);
      await this.log(`Please review the failures above before proceeding.`);
    }
    
    await this.log(`\n${'='.repeat(80)}`);
    
    return failedSuites === 0 && failedTests === 0;
  }

  async runAllIntegrationTests() {
    await this.log(`🧪 Memory Bank MCP Server - Integration Test Suite`);
    await this.log(`Starting comprehensive integration testing...`);
    await this.log(`Timestamp: ${new Date().toISOString()}`);
    
    const suites = [
      ['End-to-End Workflow Tests', IntegrationTestSuite],
      ['Edge Cases and Error Handling Tests', EdgeCasesTestSuite],
      ['Performance and Load Tests', PerformanceTestSuite]
    ];
    
    let allPassed = true;
    
    for (const [suiteName, SuiteClass] of suites) {
      const success = await this.runSuite(suiteName, SuiteClass);
      if (!success) {
        allPassed = false;
      }
    }
    
    const finalSuccess = await this.generateReport();
    return finalSuccess && allPassed;
  }
}

// Main execution
async function runAllTests() {
  const runner = new MasterTestRunner();
  const success = await runner.runAllIntegrationTests();
  process.exit(success ? 0 : 1);
}

// Export for potential programmatic use
export { MasterTestRunner };

// Run if called directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  runAllTests().catch(console.error);
}