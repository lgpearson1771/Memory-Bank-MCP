#!/usr/bin/env node
/**
 * Memory Bank Generator MCP Server CLI
 * Entry point for npx execution
 */

// Import and start the MCP server from the built distribution
import('../dist/index.js').then(() => {
    // The main server starts automatically when imported
}).catch((error) => {
    console.error('Failed to start Memory Bank Generator MCP Server:', error);
    process.exit(1);
});