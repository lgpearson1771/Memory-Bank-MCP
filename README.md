# Memory Bank Generator MCP Server


> 🧠 Automated Memory Bank Generation with Semantic Organization for AI-Assisted Development
>
> *Allows AI assistants to remember your project across sessions*
>
> 2025 Microsoft Hackathon Project - Luke Pearson

![Memory Bank Generator MCP](docs\assets\MemoryBankMCPServerLogo.png)

An MCP server that creates comprehensive memory banks for AI assistants like GitHub Copilot. Point it at your project, and it generates structured documentation that helps Copilot understand your codebase better.

## 🎯 What It Does

- **Analyzes your project**: Reads package.json, scans files, detects frameworks
- **Creates memory banks**: Generates 6 core documentation files in `.github/memory-bank/`
- **Sets up Copilot**: Automatically configures GitHub Copilot to use the memory bank
- **Smart organization**: Optional semantic folders for complex projects

## 🚀 Quick Start

### 1. Install

```bash
git clone https://github.com/lgpearson1771/Memory-Bank-MCP.git
cd Memory-Bank-MCP
npm install
npm run build
```

## 📚 Documentation

- **[Complete Documentation](docs/README.md)** - Full documentation index
- **[Setup Guide](docs/MCP_INTEGRATION_GUIDE.md)** - Detailed installation and configuration
- **[Product Requirements](docs/prds/Memory-Bank-Generator-PRD.md)** - Feature specifications
- **[Testing Strategy](docs/prds/Testing-PRD.md)** - Testing and security implementation

## 🧪 Testing & Quality

**Current Status**: ✅ Security implementation complete (11/11 security tests passing)
- Content sanitization and input validation working
- Professional documentation generation
- See [Testing PRD](docs/prds/Testing-PRD.md) for detailed status

1. **Add to VS Code's mcp.json:**
   ```json
   {
     "servers": {
       "memory-bank-generator": {
         "command": "node",
         "args": ["<MCP_SERVER_PATH>\\dist\\index.js"],
         "env": {
           "LOG_LEVEL": "info"
         },
         "type": "stdio"
       }
     }
   }
   ```

2. **Restart VS Code** - Tools available through Copilot!

### For Claude Desktop

1. **Find Claude Desktop's configuration file:**
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **Add your MCP server configuration:**
   ```json
   {
     "mcpServers": {
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

3. **Restart Claude Desktop** - Your 6 MCP tools will be available!

### Verify Installation

```bash
npm test
```

You should see: ✅ All 6 MCP tools configured successfully!

## 🛠️ Available Tools

### `generate_memory_bank`
Creates memory banks for your project with real project data

### `analyze_project_structure`  
Analyzes your project before generating memory banks

### `update_memory_bank`
Updates existing memory banks when your project changes

### `validate_memory_bank`
Checks memory bank quality and syncs with Copilot

### `resolve_sync_conflicts`
Fixes conflicts between memory bank and Copilot instructions

### `setup_copilot_instructions`
Sets up GitHub Copilot to use your memory bank

## 📁 What Gets Created

Memory banks are created in `.github/memory-bank/` with these files:

```
.github/
├── memory-bank/
│   ├── projectbrief.md          # Project overview
│   ├── productContext.md        # Goals and purpose  
│   ├── activeContext.md         # Current work
│   ├── systemPatterns.md        # Architecture
│   ├── techContext.md           # Tech stack
│   └── progress.md              # Status
└── copilot-instructions.md      # Copilot config
```

**Optional**: You can request additional files organized in semantic folders like `features/`, `api/`, `deployment/`, etc.

## 🎯 Simple Usage

### Basic Memory Bank
```
Ask Copilot: "Generate a memory bank for my project at C:\MyProject"
Result: 6 core files created with your real project data
```

### With Additional Documentation  
```
Ask Copilot: "Generate a memory bank with API documentation"
Result: Core files + api/ folder with API docs
```

### Example Generated Content
```markdown
### Dependencies
- express@^4.18.0
- react@^18.2.0

### Scripts  
- npm start: node server.js
- npm test: jest
```

## 💡 Why Use This?

- **Persistent Memory**: Copilot remembers your project between sessions
- **Real Data**: Uses actual project info, not generic templates  
- **Zero Setup**: Just point and generate
- **Smart Organization**: Files organized by purpose when needed

## 🤝 Contributing

This project started at the 2025 Microsoft Hackathon and is now production-ready!

```bash
git clone https://github.com/lgpearson1771/Memory-Bank-MCP.git
cd Memory-Bank-MCP
npm install
npm run dev
```

## � More Info

- [Cline Memory Bank Documentation](https://docs.cline.bot/prompting/cline-memory-bank)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [GitHub Copilot Docs](https://docs.github.com/en/copilot)

---

*Made with ❤️ for developers who want smarter AI assistants*