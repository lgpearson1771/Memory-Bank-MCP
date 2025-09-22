# Memory Bank Generator MCP Server - Integration Guide

## 🚀 Overview

The Memory Bank Generator MCP Server provides 5 production-ready tools for creating and managing comprehensive memory banks. This guide covers integration with Claude Desktop, VS Code, and other MCP-compatible AI assistants.

## 🔧 Key Features

- **Professional Documentation**: Enterprise-grade memory bank generation with comprehensive project analysis
- **Intelligent Analysis**: Deep understanding of project structure, dependencies, and architecture patterns
- **AI Integration**: Seamless setup and configuration for GitHub Copilot and other AI assistants
- **Quality Validation**: Comprehensive validation ensuring documentation completeness and accuracy
- **Performance Optimized**: Efficient processing of projects of any size (tested up to 500+ files)
- **Production Ready**: Robust error handling with 23 comprehensive integration tests

## 🔍 Where to Find MCP Server Configuration in VS Code

### Method 1: Command Palette
1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type "MCP" or "Model Context Protocol"
3. Look for commands like:
   - `MCP: List Servers`
   - `MCP: Reload Servers`
   - `MCP: Server Status`

### Method 2: VS Code Settings
1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "MCP" or "Model Context Protocol"
3. Look for sections like:
   - `Extensions > MCP Servers`
   - `AI Assistant > MCP Configuration`

### Method 3: Extensions View
1. Open Extensions view (`Ctrl+Shift+X`)
2. Search for "MCP" or "Model Context Protocol"
3. Install MCP-related extensions if available

### Method 4: Output Panel
1. Open Output panel (`Ctrl+Shift+U`)
2. Select "MCP" or "Model Context Protocol" from dropdown
3. View server logs and status

## 🛠 Configuration Steps

### For Claude Desktop Integration

1. **Find Claude Desktop config file:**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **Add this configuration:**
   ```json
   {
     "mcpServers": {
       "memory-bank-generator": {
         "command": "node",
         "args": [
           "<MCP_SERVER_PATH>\\dist\\index.js"
         ],
         "env": {
           "LOG_LEVEL": "info"
         }
       }
     }
   }
   ```
   
   *Example configuration available in: `docs/examples/claude_desktop_config.json`*

3. **Restart Claude Desktop**

### For VS Code Extensions

1. **Install MCP Extension** (if available)
2. **Add to VS Code settings.json:**
   ```json
   {
     "mcp.servers": {
       "memory-bank-generator": {
         "command": "node",
         "args": ["<MCP_SERVER_PATH>\\dist\\index.js"],
         "env": {
           "LOG_LEVEL": "info"
         }
       }
     }
   }
   ```

## 🛠️ Available MCP Tools

Once configured, you'll have access to these **5** production-ready tools:

### 1. `generate_memory_bank`
**Professional memory bank generation**
- Comprehensive project analysis including dependencies, architecture, and patterns
- Creates 6 core memory bank files with enterprise-grade content
- Intelligent content generation based on actual project structure
- Automatic AI assistant integration setup
- Professional formatting suitable for production environments

**Example Usage:**
```
User: "Generate a memory bank for my React project"
Tool: Analyzes project → Generates comprehensive memory bank → Sets up AI integration
Result: 6 professional memory bank files + AI assistant configuration
```

### 2. `analyze_project_structure`
**Deep project analysis and intelligence**
- Advanced project structure analysis with dependency mapping
- Framework and technology detection with configuration analysis
- Architecture pattern recognition and documentation
- Performance analysis and optimization recommendations
- Analysis depths: shallow, medium, deep

### 3. `update_memory_bank`
**Intelligent memory bank updates**
- Full project re-analysis with current state detection
- Updates existing memory banks with new project changes
- Intelligent placeholder replacement (removes TODO, "not implemented", etc.)
- Maintains professional quality and consistency
- Preserves manual customizations while updating core content

### 4. `validate_memory_bank`
**Comprehensive validation and quality assurance**
- Validates memory bank structure and file completeness
- Verifies AI assistant integration and configuration
- Quality assessment with professional standards checking
- JSON-formatted results for programmatic use
- Sync validation between memory bank and AI setup

### 5. `setup_copilot_instructions`
**AI assistant configuration and integration**
- Creates and updates GitHub Copilot instructions
- Automatic memory bank structure detection and referencing
- Professional template generation with project-specific content
- Integration verification and status reporting
- Seamless AI assistant onboarding
- Complete audit trail of actions taken and conversation log
- Final validation and status reporting after resolution attempts

**Example Workflow:**
```
Tool: "🔍 Sync Conflict Analysis - 3 unreferenced files detected (medium severity)"
Tool: "How would you like to resolve these conflicts?"
User: "Review each conflict individually"
Tool: "Conflict 1/3: features/authentication.md not referenced in Copilot instructions"
Tool: "Would you like to add this reference?"
User: "Yes - Apply this fix"
Tool: "✅ Reference added. Moving to next conflict..."
```

### 6. `setup_copilot_instructions`
**GitHub Copilot integration**
- Creates/updates `copilot-instructions.md` based on actual memory bank structure
- Automatically discovers semantic folders and files
- Real-time status indicators (✅/❌) for core files
- Sync validation timestamps and folder awareness

## ✅ How to Verify MCP Server is Working

### 1. Run Comprehensive Tests
```bash
# Unit tests
node tests/unit/validate-tools.js

# Integration tests  
node tests/integration/run-all.mjs

# Quick verification
node tests/integration/quick-test.js
```

### 2. Test Server Directly
```bash
# Build and start server
npm run build
node dist/index.js
```

### 3. Verify Tool Registration
- Check AI assistant for available MCP tools
- Look for 5 memory bank tools in tool list
- Test basic functionality with a small project

### 4. Monitor Logs
- Check VS Code Output panel for MCP logs
- Look for server startup messages
- Verify tool registration messages

## 🔧 Troubleshooting

### Common Issues

1. **Server not starting:**
   - Ensure `npm run build` completes successfully
   - Check that Node.js path is correct in configuration
   - Verify all dependencies are installed with `npm install`

2. **Tools not appearing:**
   - Restart the AI assistant application completely
   - Check server logs for errors in output panel
   - Verify MCP configuration syntax in config file

3. **Performance issues:**
   - Test with smaller projects first
   - Check available system memory
   - Monitor server logs for error messages

### Performance Benchmarks

The server has been tested with:
- **Small projects**: 10-50 files (< 100ms)
- **Medium projects**: 100-200 files (< 500ms)  
- **Large projects**: 500+ files (< 1000ms)
- **Memory usage**: < 100MB increase during operation

3. **Permission errors:**
   - Ensure the AI assistant has permission to execute Node.js
   - Check file paths are correct and accessible

### Debug Commands
```bash
# Test compilation
npm run build

# Test server startup
node dist/index.js --help

# Verify tools registration
node scripts/test-server.js
```

## 📊 Expected Behavior

When working correctly, you should see:

1. **In AI Assistant:**
   - 6 tools available: analyze_project, generate_memory_bank, resolve_sync_conflicts, etc.
   - Tool descriptions and parameters
   - Ability to call tools and get responses

2. **In Logs:**
   - "Memory Bank Generator MCP Server started"
   - "Tool registered: analyze_project" (x6 tools)
   - No error messages

3. **In File System:**
   - `dist/` folder with compiled JavaScript
   - Server responds to MCP protocol messages

## 🎯 Quick Verification Checklist

- [ ] Project builds without errors (`npm run build`)
- [ ] Test script passes (`node scripts/test-server.js`)
- [ ] Server starts without errors (`node dist/index.js`)
- [ ] 6 tools are registered and available
- [ ] MCP configuration is correct
- [ ] AI assistant can discover the server
- [ ] Tools can be called and return responses

---

The MCP server is ready for integration! 🎉