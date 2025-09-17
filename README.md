# Memory Bank Generator MCP Server

> 🧠 Interactive Memory Bank Generation for AI-Assisted Development
>
> *2025 Microsoft Hackathon Project - Luke Pearson*

An interactive MCP server that generates comprehensive memory banks for GitHub Copilot, enabling persistent project knowledge across sessions. Memory banks are created in a standardized `.github/memory-bank` directory with automatic Copilot integration.

## 🚀 Vision

Transform how AI assistants understand and work with software projects by providing an **interactive workflow** that creates rich, contextual memory banks tailored to each project's specific needs.

## ✨ Interactive Workflow

### 1. **Project Root Selection**
When you request memory bank generation, the server first asks for your project's root directory - the folder where you want the `.github/memory-bank` directory created.

### 2. **Customization Options**
Choose your preferred approach:
- **Standard Structure**: Complete memory bank with all core files
- **Custom Structure**: Tailored to specific focus areas and requirements

### 3. **Focus Areas** (Optional)
Specify areas requiring special attention:
- Complex algorithms or architectures
- API patterns and integrations  
- Testing strategies and frameworks
- Specific implementation patterns
- Performance-critical components

### 4. **Detail Level**
Select analysis depth:
- **High-level**: Overview and main concepts
- **Detailed**: Comprehensive analysis (recommended)
- **Granular**: Deep dive with extensive detail

### 5. **Additional Files** (Optional)
Request supplementary documentation:
- API documentation
- Integration guides
- Testing strategies
- Deployment procedures
- Custom sections

## 🛠️ Available Tools

### `generate_memory_bank`
**Interactive memory bank generation**
- Prompts for project root directory
- Offers customization options
- Creates `.github/memory-bank` directory
- Generates all memory bank files
- Sets up `copilot-instructions.md`

### `analyze_project_structure`
**Pre-generation analysis**
- Analyzes project structure and complexity
- Provides recommendations for focus areas
- Suggests optimal detail level
- Identifies project type and patterns

### `update_memory_bank`
**Update existing memory banks**
- Incremental updates for active projects
- Full refresh for major changes
- Specific file updates

### `validate_memory_bank`
**Quality assurance**
- Validates memory bank structure
- Checks file completeness
- Assesses content quality
- Provides improvement recommendations

### `setup_copilot_instructions`
**Copilot integration**
- Creates/updates `copilot-instructions.md`
- Configures memory bank workflows
- Sets up session reset handling

## 📁 Memory Bank Structure

Memory banks are **always** created in `.github/memory-bank/` with these core files:

```
.github/
├── memory-bank/
│   ├── projectbrief.md          # Foundation document (always generated)
│   ├── productContext.md        # Purpose and goals (always generated)
│   ├── activeContext.md         # Current work focus (always generated)
│   ├── systemPatterns.md        # Architecture and patterns (always generated)
│   ├── techContext.md           # Technologies and setup (always generated)
│   ├── progress.md              # Status and milestones (always generated)
│   ├── features/                # Optional: Only if user requests feature docs
│   │   ├── authentication.md
│   │   └── payment-system.md
│   ├── integrations/            # Optional: Only if user requests integration docs
│   │   ├── github-api.md
│   │   └── stripe-integration.md
│   ├── deployment/              # Optional: Only if user requests deployment docs
│   │   ├── docker-setup.md
│   │   └── aws-deployment.md
│   └── [custom-folders]/        # Optional: User-defined semantic folders
└── copilot-instructions.md      # Copilot configuration (always generated)
```

**🎯 File Generation Strategy:**
- **6 Core Files**: Always generated at memory bank root
- **Additional Files**: Only generated when explicitly requested by user
- **Semantic Folders**: Created automatically to organize additional files by purpose
- **User-Driven**: No extra files created unless specifically asked for

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/lgpearson1771/Memory-Bank-MCP.git
cd Memory-Bank-MCP

# Install dependencies
npm install

# Build the project
npm run build

# Test the server
npm test
```

### Configuration

#### For Claude Desktop

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

3. **Restart Claude Desktop** - Your 5 MCP tools will be available!

#### For VS Code

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

### Verify Installation

```bash
npm test
```

You should see: ✅ All 5 MCP tools configured successfully!

## 🎯 Usage Examples

### Basic Memory Bank Generation (Standard Structure)
```
User: "I'd like to generate a memory bank for my project"
Server: "What's the root directory for your project?"
User: "C:\MyProjects\WebApp"
Server: "Would you like the standard structure or custom approach?"
User: "Standard"
Server: [Generates 6 core files only - no additional files unless requested]
```

### Custom Memory Bank with Additional Files
```
User: "Generate a memory bank focusing on API patterns"
Server: "What's your project root directory?"
User: "/home/user/api-service"
Server: "Any specific focus areas?"
User: "REST API patterns, authentication, error handling"
Server: "Would you like additional documentation files?"
User: "Yes, I need API documentation and deployment guides"
Server: [Creates core files + api/endpoints.md + deployment/procedures.md in semantic folders]
```

### Minimal Memory Bank (No Additional Files)
```
User: "Create a simple memory bank for my small project"
Server: "What's your project root directory?"
User: "/home/user/simple-app"
Server: "Standard or custom structure?"
User: "Standard, just the essentials"
Server: [Generates only the 6 core files - clean and simple]
```

## 🎯 Benefits

### For GitHub Copilot
- **Context Persistence**: Maintains project understanding across sessions
- **Consistent Responses**: Aligned with project patterns and decisions
- **Informed Suggestions**: Based on actual project structure and goals

### For Developers
- **Interactive Setup**: Tailored to your specific needs
- **Standardized Location**: Always in `.github/memory-bank`
- **Automatic Integration**: Copilot configured automatically
- **Quality Assurance**: Built-in validation and recommendations

## 🔄 Workflow Integration

The memory bank integrates seamlessly with GitHub Copilot's session lifecycle:

1. **Session Start**: Copilot reads memory bank for context
2. **During Work**: Memory bank provides consistent guidance
3. **After Changes**: Update memory bank to capture new insights
4. **Session Reset**: Fresh Copilot relies entirely on memory bank

## 📊 Memory Bank Categories

- **Project Context**: Goals, requirements, and scope
- **Technical Context**: Technologies, dependencies, and setup
- **Active Context**: Current focus, recent changes, next steps
- **System Patterns**: Architecture, design patterns, relationships
- **Progress**: Status, accomplishments, known issues

## 🏗 Architecture

Streamlined architecture focused on interactive workflow:

```typescript
src/
├── index.ts              # Main MCP server with 5 tools
└── fileOperations.ts     # Real file system operations
```

## 🤝 Contributing

This MCP server is designed for the 2025 Microsoft Hackathon. Contributions welcome!

### Development Setup

```bash
git clone https://github.com/lgpearson1771/Memory-Bank-MCP.git
cd Memory-Bank-MCP
npm install
npm run dev
```

### Testing

```bash
npm test                 # MCP server tests
npm run test:file-ops    # File operation tests
```

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built using the Model Context Protocol SDK
- Designed for seamless GitHub Copilot integration
- Part of the 2025 Microsoft Hackathon innovation initiative

---

> **🎯 Hackathon Goal**: Demonstrate how interactive AI tools can automatically capture and maintain project knowledge, making software development more intelligent and collaborative.

*Made with ❤️ for the developer community*