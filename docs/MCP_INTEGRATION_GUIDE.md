# How to Configure and Verify Memory Bank Generator MCP Server

## 🚀 Overview

The Memory Bank Generator MCP Server provides 5 interactive tools for creating and managing memory banks with **intelligent semantic organization**. This guide will help you integrate it with Claude Desktop, VS Code, and other MCP-compatible clients.

## 🔧 Key Features

- **Semantic Organization**: Smart categorization of files into purpose-based folders
- **Dynamic Copilot Integration**: Instructions automatically adapt to memory bank structure
- **Interactive Workflow**: User-guided customization for project-specific needs
- **Comprehensive Validation**: Sync checking between memory bank and Copilot instructions
- **Flexible Structure**: Choice between semantic organization and flat structure

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

Once configured, you'll have access to these 5 interactive tools:

### 1. `generate_memory_bank`
**Interactive memory bank generation with semantic organization**
- Choose between semantic organization (default) or flat structure
- Smart categorization of additional files into purpose-based folders
- User-driven generation - only creates files you explicitly request
- Automatic dynamic Copilot integration

**Example Usage:**
```
User: "Generate a memory bank for my React project"
Tool: Prompts for project root, organization preference, additional files
Result: Core files + semantic folders (features/, integrations/, etc.) if requested
```

### 2. `analyze_project_structure`
**Pre-generation analysis and recommendations**
- Analyzes project complexity and structure
- Suggests optimal organization strategy
- Identifies project type and patterns
- Recommends focus areas and detail levels

### 3. `update_memory_bank`
**Update existing memory banks**
- Maintains semantic folder organization during updates
- Incremental updates for active projects
- Specific file updates with proper categorization
- Full refresh options for major changes

### 4. `validate_memory_bank`
**Comprehensive validation with sync checking**
- Validates memory bank structure and semantic organization
- Comprehensive sync validation between memory bank and Copilot instructions
- Identifies orphaned references and missing files
- Quality assessment with consistency and completeness checking

### 5. `setup_copilot_instructions`
**Dynamic Copilot integration**
- Creates/updates `copilot-instructions.md` based on actual memory bank structure
- Automatically discovers semantic folders and files
- Real-time status indicators (✅/❌) for core files
- Sync validation timestamps and folder awareness

## ✅ How to Verify MCP Server is Working

### 1. Test Server Directly
```bash
# From your project directory
node scripts/test-server.js
```

### 2. Check Server Startup
```bash
# Run the server directly
npm run build
node dist/index.js
```

### 3. Test with MCP Client
```bash
# If you have an MCP client tool
mcp-client connect memory-bank-generator
```

### 4. Monitor Logs
- Check VS Code Output panel for MCP logs
- Look for server startup messages
- Verify tool registration messages

## 🔧 Troubleshooting

### Common Issues:

1. **Server not starting:**
   - Ensure `npm run build` completes successfully
   - Check that Node.js path is correct
   - Verify all dependencies are installed

2. **Tools not appearing:**
   - Restart the AI assistant application
   - Check server logs for errors
   - Verify MCP configuration syntax

3. **Permission errors:**
   - Ensure the AI assistant has permission to execute Node.js
   - Check file paths are correct and accessible

### Debug Commands:
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
   - 6 new tools available: analyze_project, generate_memory_bank, etc.
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

Your MCP server is ready for integration! 🎉