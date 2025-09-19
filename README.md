# Memory Bank Generator MCP Server

> 🧠 Automated Memory Bank Generation with Semantic Organization for AI-Assisted Development
>
> *Allows AI assistants to remember your project across sessions*
>
> 2025 Microsoft Hackathon Project - Luke Pearson

<div align="center">
  <img src="docs/assets/MemoryBankMCPServerLogo.png" alt="Memory Bank Generator MCP Logo" width="700" height="700">
</div>

An MCP server that creates comprehensive memory banks for AI assistants like GitHub Copilot. Point it at your project, and it generates structured documentation that helps Copilot understand your codebase better.

## 🎯 What It Does

- **Analyzes your project**: Scans files, detects patterns, understands structure
- **Creates memory banks**: Generates 6 core documentation files in `.github/memory-bank/`
- **Sets up AI integration**: Automatically configures AI assistants to use the memory bank
- **Automated generation**: Uses advanced analysis for high-quality, project-specific content

## 🚀 Quick Start

### 1. Install

```bash
git clone https://github.com/lgpearson1771/Memory-Bank-MCP.git
cd Memory-Bank-MCP
npm install
npm run build
```

## 📚 Documentation

**📁 [Complete Documentation](docs/)** - All guides, setup instructions, and technical details

**Quick Links:**
- **[Setup Guide](docs/MCP_INTEGRATION_GUIDE.md)** - Installation for Claude Desktop and VS Code
- **[Configuration Examples](docs/examples/)** - Ready-to-use config files
- **[Architecture & Testing](docs/)** - Technical documentation and testing strategy

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

**6 MCP Tools for Memory Bank Management:**

- `generate_memory_bank` - Creates high-quality memory banks using AI assistance
- `analyze_project_structure` - Analyzes your project structure and patterns
- `update_memory_bank` - Updates existing memory banks with new changes
- `validate_memory_bank` - Validates memory bank quality and AI integration
- `resolve_sync_conflicts` - Resolves conflicts between memory bank and AI setup
- `setup_copilot_instructions` - Sets up AI assistants to use your memory bank

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

## 🎯 How It Works

### Automated Analysis & Generation

**Single Command Workflow**
```
You: "Generate a memory bank for my project at C:\MyProject"
MCP: Analyzes project → Generates content → Creates memory bank files
```

**Intelligent Processing**
- Deep project analysis (dependencies, structure, patterns)
- AI-powered content generation using built-in prompts
- Professional formatting and file organization
- Automatic AI assistant integration

**Result**: 6 high-quality documentation files with actual project details, not generic templates.

## 💡 Why Use This?

- **AI-Quality Content**: Leverages AI intelligence for professional, project-specific documentation
- **Persistent Memory**: AI assistants remember your project between sessions
- **Automated Excellence**: Deep analysis + intelligent generation = superior results
- **Easy Integration**: Works with Claude Desktop, VS Code, and other MCP-compatible tools

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