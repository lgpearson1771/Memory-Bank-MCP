# Memory Bank Generator MCP Server

> 🧠 Interactive Memory Bank Generation with Semantic Organization for AI-Assisted Development
>
> *2025 Microsoft Hackathon Project - Luke Pearson*

An interactive MCP server that generates comprehensive memory banks for GitHub Copilot, enabling persistent project knowledge across sessions. Features intelligent semantic folder organization and dynamic Copilot integration that adapts to your chosen project structure.

## 🚀 Vision

Transform how AI assistants understand and work with software projects by providing an **interactive workflow** that creates rich, contextual memory banks with **semantic organization** tailored to each project's specific needs.

## ✨ Interactive Workflow

### 1. **Project Root Selection**
When you request memory bank generation, the server first asks for your project's root directory - the folder where you want the `.github/memory-bank` directory created.

### 2. **Organization Strategy**
Choose your preferred structure:
- **Semantic Organization** (Default): Additional files organized into purpose-based folders
- **Flat Structure**: All files at root level for simple projects

### 3. **Customization Options**
Choose your preferred approach:
- **Standard Structure**: Complete memory bank with all core files
- **Custom Structure**: Tailored to specific focus areas and requirements

### 4. **Focus Areas** (Optional)
Specify areas requiring special attention:
- Complex algorithms or architectures
- API patterns and integrations  
- Testing strategies and frameworks
- Specific implementation patterns
- Performance-critical components

### 5. **Detail Level**
Select analysis depth:
- **High-level**: Overview and main concepts
- **Detailed**: Comprehensive analysis (recommended)
- **Granular**: Deep dive with extensive detail

### 6. **Additional Files** (Optional)
Request supplementary documentation (automatically organized into semantic folders):
- API documentation → `api/` folder
- Integration guides → `integrations/` folder
- Testing strategies → `testing/` folder
- Deployment procedures → `deployment/` folder
- Security documentation → `security/` folder
- Performance guides → `performance/` folder
- Feature specifications → `features/` folder
- Custom sections → User-defined folders

### 7. **Sync Validation** (Optional)
Enable comprehensive validation between memory bank files and Copilot instructions for perfect consistency.

## 🛠️ Available Tools

### `generate_memory_bank`
**Interactive memory bank generation with semantic organization**
- Prompts for project root directory
- Offers semantic vs. flat organization
- Creates `.github/memory-bank` directory with smart folder structure
- Generates all memory bank files with intelligent categorization
- Sets up dynamic `copilot-instructions.md` that adapts to your structure
- Optional sync validation for consistency

### `analyze_project_structure`
**Pre-generation analysis**
- Analyzes project structure and complexity
- Provides recommendations for focus areas
- Suggests optimal detail level and organization strategy
- Identifies project type and patterns

### `update_memory_bank`
**Update existing memory banks**
- Maintains semantic folder organization
- Incremental updates for active projects
- Full refresh for major changes
- Specific file updates with proper categorization

### `validate_memory_bank`
**Quality assurance with sync validation**
- Validates memory bank structure and semantic organization
- Checks file completeness across all folders
- Assesses content quality and consistency
- Comprehensive sync validation with Copilot instructions
- Identifies orphaned references and missing files

### `setup_copilot_instructions`
**Dynamic Copilot integration**
- Creates/updates `copilot-instructions.md` based on actual memory bank structure
- Automatically discovers semantic folders and files
- Configures memory bank workflows with real-time status
- Sets up session reset handling with folder awareness
- Includes sync validation timestamps

## 📁 Memory Bank Structure

Memory banks are **always** created in `.github/memory-bank/` with intelligent semantic organization:

### Semantic Organization (Default)
```
.github/
├── memory-bank/
│   ├── projectbrief.md          # Foundation document (always generated)
│   ├── productContext.md        # Purpose and goals (always generated)
│   ├── activeContext.md         # Current work focus (always generated)
│   ├── systemPatterns.md        # Architecture and patterns (always generated)
│   ├── techContext.md           # Technologies and setup (always generated)
│   ├── progress.md              # Status and milestones (always generated)
│   ├── features/                # Feature-specific documentation
│   │   ├── authentication.md    # Smart categorization by content
│   │   └── payment-system.md
│   ├── integrations/            # Third-party integrations, APIs, external services
│   │   ├── github-api.md
│   │   └── stripe-integration.md
│   ├── deployment/              # Deployment guides, infrastructure, operations
│   │   ├── docker-setup.md
│   │   └── aws-deployment.md
│   ├── api/                     # API documentation, endpoints, specifications
│   │   ├── rest-endpoints.md
│   │   └── graphql-schema.md
│   ├── testing/                 # Testing strategies, frameworks, QA
│   │   ├── unit-testing.md
│   │   └── e2e-testing.md
│   ├── security/                # Security considerations, auth, compliance
│   │   ├── auth-patterns.md
│   │   └── security-checklist.md
│   ├── performance/             # Performance optimization, monitoring
│   │   └── optimization-guide.md
│   └── [custom-folders]/        # User-defined semantic folders
└── copilot-instructions.md      # Dynamic Copilot config (auto-generated based on structure)
```

### Flat Organization (Optional)
```
.github/
├── memory-bank/
│   ├── projectbrief.md          # Core files (always at root)
│   ├── productContext.md
│   ├── activeContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   ├── progress.md
│   ├── additional-file-1.md     # Additional files at root level
│   └── additional-file-2.md
└── copilot-instructions.md      # Configured for flat structure
```

**🎯 Smart File Organization:**
- **6 Core Files**: Always generated at memory bank root
- **Additional Files**: Only generated when explicitly requested by user
- **Semantic Categorization**: Files automatically sorted by purpose (features, integrations, deployment, api, testing, security, performance)
- **Custom Folders**: User can define project-specific semantic folders
- **Dynamic Copilot Integration**: Instructions adapt to actual structure
- **User-Driven**: No extra files created unless specifically asked for

## 🔧 Semantic Categories

### Automatic Categorization
Files are automatically organized based on content patterns:

| Category | Folder | File Patterns | Purpose |
|----------|--------|---------------|---------|
| **Features** | `features/` | feature, component, module, functionality | Feature-specific implementation details |
| **Integrations** | `integrations/` | api, integration, service, external, webhook | Third-party services and APIs |
| **Deployment** | `deployment/` | deploy, infrastructure, docker, kubernetes, ci/cd | Deployment and infrastructure |
| **API** | `api/` | endpoint, route, controller, graphql, rest | API documentation and specs |
| **Testing** | `testing/` | test, qa, spec, e2e, unit | Testing strategies and frameworks |
| **Security** | `security/` | security, auth, authentication, compliance | Security considerations |
| **Performance** | `performance/` | performance, optimization, benchmark, monitoring | Performance and optimization |

### Custom Semantic Folders
Define your own categorization:
```json
{
  "customFolders": [
    {
      "name": "analytics",
      "description": "Data analytics and reporting",
      "filePatterns": ["analytics", "reporting", "metrics", "dashboard"]
    }
  ]
}
```

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

### Basic Memory Bank Generation (Semantic Organization)
```
User: "I'd like to generate a memory bank for my project"
Server: "What's the root directory for your project?"
User: "C:\MyProjects\WebApp"
Server: "Would you like semantic organization (recommended) or flat structure?"
User: "Semantic organization"
Server: "Standard structure or custom approach?"
User: "Standard"
Server: [Generates 6 core files only - additional files organized semantically when requested]
```

### Custom Memory Bank with Semantic Organization
```
User: "Generate a memory bank focusing on API patterns and deployment"
Server: "What's your project root directory?"
User: "/home/user/api-service"
Server: "Any specific focus areas?"
User: "REST API patterns, authentication, Docker deployment"
Server: "Would you like additional documentation files?"
User: "Yes, I need API documentation, deployment guides, and security docs"
Server: [Creates core files + api/endpoints.md + deployment/docker-guide.md + security/auth-patterns.md]
Result: Smart categorization into purpose-based folders
```

### Minimal Memory Bank (No Additional Files)
```
User: "Create a simple memory bank for my small project"
Server: "What's your project root directory?"
User: "/home/user/simple-app"
Server: "Semantic organization or flat structure?"
User: "Flat structure for simplicity"
Server: [Generates only the 6 core files at root - clean and simple]
```

### Advanced with Custom Semantic Folders
```
User: "Set up memory bank with custom organization for my data pipeline"
Server: "What's your project root directory?"
User: "/projects/data-pipeline"
Server: "Any custom folder categories?"
User: "Yes, I need folders for data-sources, transforms, and monitoring"
Server: [Creates custom semantic folders and organizes files accordingly]
Result: data-sources/, transforms/, monitoring/ folders with smart categorization
```

### Validation with Sync Checking
```
User: "Validate my memory bank and check Copilot sync"
Server: "Enable comprehensive sync validation?"
User: "Yes, full validation"
Server: [Analyzes memory bank structure, semantic organization, and Copilot sync]
Result: ✅ 15 files organized in 4 semantic folders, fully synchronized with Copilot instructions
```

## 🎯 Benefits

### For GitHub Copilot
- **Context Persistence**: Maintains project understanding across sessions
- **Semantic Awareness**: Understands project organization and file relationships
- **Dynamic Integration**: Copilot instructions adapt to actual memory bank structure
- **Consistent Responses**: Aligned with project patterns and decisions
- **Informed Suggestions**: Based on actual project structure and goals
- **Sync Validation**: Ensures Copilot instructions stay current with memory bank changes

### For Developers
- **Interactive Setup**: Tailored to your specific needs and workflow
- **Semantic Organization**: Files automatically organized by purpose
- **Standardized Location**: Always in `.github/memory-bank`
- **Automatic Integration**: Copilot configured automatically with structure awareness
- **Quality Assurance**: Built-in validation and sync checking
- **Flexible Structure**: Choose between semantic organization or flat structure
- **Custom Categories**: Define project-specific semantic folders
- **User-Driven Generation**: Only creates files you actually need

### For Teams
- **Consistent Knowledge Base**: Standardized memory bank structure across projects
- **Easy Onboarding**: New team members can quickly understand project context
- **Documentation Standards**: Semantic organization encourages good documentation practices
- **Scalable Structure**: Memory bank grows intelligently with project complexity

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

> **🎯 Hackathon Goal**: Demonstrate how interactive AI tools can automatically capture, organize, and maintain project knowledge using semantic organization principles, making software development more intelligent, structured, and collaborative. Features intelligent file categorization, dynamic Copilot integration, and comprehensive sync validation.

*Made with ❤️ for the developer community*