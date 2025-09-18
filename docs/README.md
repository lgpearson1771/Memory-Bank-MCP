# Memory Bank Generator MCP Server - Documentation

This directory contains comprehensive documentation for the Memory Bank Generator MCP Server with **intelligent project analysis** and **semantic organization** capabilities.

## 📚 Documentation Index

### 📋 Product Requirements Documents (PRDs)
- **[Memory Bank Generator PRD](prds/Memory-Bank-Generator-PRD.md)** - Main product requirements and feature specifications
- **[Testing PRD](prds/Testing-PRD.md)** - Testing strategy, security requirements, and implementation status

### 🧪 Testing Documentation
- **[Testing Strategy](testing/testing-strategy.md)** - Comprehensive testing approach and methodologies
- **Security Testing** - Input validation and content sanitization testing (see Testing PRD)

### 🏗️ Architecture & Integration
- **[MCP Integration Guide](MCP_INTEGRATION_GUIDE.md)** - Complete setup and configuration instructions

### 📁 Configuration Examples
- **[examples/claude_desktop_config.json](examples/claude_desktop_config.json)** - Claude Desktop MCP configuration
- **[examples/vscode_mcp_config.json](examples/vscode_mcp_config.json)** - VS Code MCP extension configuration

## 🚀 Quick Start

1. **Verify your MCP server is working:**
   ```bash
   npm run build
   node scripts/test-server.js
   ```

2. **Choose your integration method:**
   - For Claude Desktop: Use `examples/claude_desktop_config.json`
   - For VS Code: Use `examples/vscode_mcp_config.json`

3. **Follow the detailed setup in:** [MCP Integration Guide](MCP_INTEGRATION_GUIDE.md)

## 📁 Documentation Structure

```
docs/
├── README.md                       # This file - documentation index
├── prds/                          # Product Requirements Documents
│   ├── Memory-Bank-Generator-PRD.md  # Main PRD with feature specs
│   └── Testing-PRD.md               # Testing strategy and security requirements
├── testing/                       # Testing documentation
│   └── testing-strategy.md          # Comprehensive testing approach
├── architecture/                  # Technical architecture docs (planned)
├── MCP_INTEGRATION_GUIDE.md        # Setup and troubleshooting guide
└── examples/
    ├── claude_desktop_config.json    # Claude Desktop configuration
    └── vscode_mcp_config.json        # VS Code configuration
```

## 🛠 Available MCP Tools

## 🛠 Available MCP Tools

The server provides these **6** tools with intelligent semantic organization:

1. `generate_memory_bank` - **Interactive generation with semantic organization**
   - Generates 6 core files at `.github/memory-bank/` root
   - Smart categorization of additional files into purpose-based folders
   - Choice between semantic organization (default) or flat structure
   - Additional files generated based on user preferences
   - Automatic GitHub Copilot integration

2. `analyze_project_structure` - **Analysis with organization recommendations**
   - Suggests optimal organization strategy (semantic vs flat)
   - Identifies project patterns for smart categorization

3. `update_memory_bank` - **Updates maintaining semantic organization**
   - Preserves semantic folder structure during updates
   - Smart categorization of new files

4. `validate_memory_bank` - **Comprehensive validation with sync checking**
   - Validates semantic organization and folder structure
   - Sync validation between memory bank and Copilot instructions
   - Identifies orphaned references and missing files
   - Interactive mode for conflict analysis

5. `resolve_sync_conflicts` - **Interactive sync conflict resolution**
   - User-guided workflow for resolving sync conflicts
   - Multi-step interaction with conflict analysis
   - Auto-resolution options for low-risk conflicts
   - Manual review with per-conflict confirmation
   - Complete audit trail of actions taken

6. `setup_copilot_instructions` - **Dynamic Copilot integration**
   - Creates instructions based on actual memory bank structure
   - Real-time discovery of semantic folders and files
   - Status indicators and sync validation timestamps

## 📁 Generated Memory Bank Structure

### Semantic Organization (Default)
```
.github/
├── memory-bank/
│   ├── projectbrief.md          # Always generated - Foundation document
│   ├── productContext.md        # Always generated - Purpose and goals
│   ├── activeContext.md         # Always generated - Current work focus
│   ├── systemPatterns.md        # Always generated - Architecture patterns
│   ├── techContext.md           # Always generated - Technologies and setup
│   ├── progress.md              # Always generated - Status and milestones
│   ├── features/                # Smart categorization - Feature-specific docs
│   ├── integrations/            # Smart categorization - Third-party integrations
│   ├── deployment/              # Smart categorization - Infrastructure & deployment
│   ├── api/                     # Smart categorization - API documentation
│   ├── testing/                 # Smart categorization - Testing strategies
│   ├── security/                # Smart categorization - Security documentation
│   ├── performance/             # Smart categorization - Performance optimization
│   └── [custom-folders]/        # User-defined semantic categories
└── copilot-instructions.md      # Dynamic generation based on actual structure
```

### Flat Organization (Optional)
```
.github/
├── memory-bank/
│   ├── projectbrief.md          # Core files at root
│   ├── productContext.md
│   ├── activeContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   ├── progress.md
│   ├── additional-file-1.md     # Additional files at root level
│   └── additional-file-2.md
└── copilot-instructions.md      # Configured for flat structure
```

**Key Principles:**
- **6 core files** always generated at memory bank root for immediate accessibility
- **Smart categorization** organizes additional files by content patterns (feature, api, integration, deploy, test, security, performance)
- **User-driven generation** - additional files created based on user preferences
- **Dynamic Copilot integration** - instructions adapt to actual memory bank structure
- **Custom folders** - support for project-specific semantic categories
- **Structure flexibility** - choice between semantic organization or flat structure

## 📞 Support

For questions or issues:
1. Check the [MCP Integration Guide](MCP_INTEGRATION_GUIDE.md) for troubleshooting
2. Review the example configurations in the `examples/` folder

---

*Documentation for Memory Bank Generator MCP Server*