# Memory Bank Generator MCP Server

> 🧠 Interactive Memory Bank Generation with Semantic Organization for AI-Assisted Development
>
> *2025 Microsoft Hackathon Project - Luke Pearson*

An interactive MCP server that generates comprehensive memory banks for GitHub Copilot, enabling persistent project knowledge across sessions. Features intelligent semantic folder organization, enhanced project analysis with real content generation, and dynamic Copilot integration that adapts to your chosen project structure.

## 🚀 Vision

Transform how AI assistants understand and work with software projects by providing an **interactive workflow** that creates rich, contextual memory banks with **semantic organization** and **real project data analysis** tailored to each project's specific needs.

## ✨ Interactive Workflow

### 1. **Enhanced Project Analysis**
When you request memory bank generation, the server performs deep analysis of your project:
- **Package.json Parsing**: Extracts project name, description, version, dependencies, and npm scripts
- **Framework Detection**: Automatically identifies React, Express.js, Vue, Angular, TypeScript, Jest, and 20+ other frameworks
- **Source File Scanning**: Categorizes TypeScript, JavaScript, Python, and other source files by type and location
- **Dependency Analysis**: Maps runtime and development dependencies with actual versions
- **Architecture Detection**: Identifies entry points, configuration files, and architectural patterns
- **Smart Recommendations**: Suggests optimal memory bank structure based on detected complexity and technologies

### 2. **Conversational Mode Selection**
Choose your preferred interaction style:
- **Analyze-First** (Default): Full project analysis with recommendations and multiple options
- **Guided**: Step-by-step workflow with contextual guidance
- **Express**: Quick generation with minimal interaction
- **Custom**: Detailed customization with all available options

### 3. **Organization Strategy**
Choose your preferred structure:
- **Semantic Organization** (Default): Additional files organized into purpose-based folders
- **Flat Structure**: All files at root level for simple projects

### 4. **Interactive Customization**
The conversational workflow presents contextual options:
- **Standard Structure**: Complete memory bank with all core files
- **Enhanced Structure**: Includes semantic folders for complex projects
- **Custom Structure**: Tailored to specific focus areas and requirements

### 5. **Focus Areas** (Optional)
Specify areas requiring special attention:
- Complex algorithms or architectures
- API patterns and integrations  
- Testing strategies and frameworks
- Specific implementation patterns
- Performance-critical components

### 6. **Detail Level**
Select analysis depth:
- **High-level**: Overview and main concepts
- **Detailed**: Comprehensive analysis (recommended)
- **Granular**: Deep dive with extensive detail

### 7. **Interactive Sync Resolution**
When conflicts are detected between memory bank and Copilot instructions:
- **Conflict Analysis**: Detailed breakdown of sync issues
- **Resolution Options**: Auto-resolve, review individually, or cancel
- **Step-by-Step Confirmation**: User confirmation for each proposed fix
- **Conversation Logging**: Full audit trail of all decisions made

## 🛠️ Available Tools

### `generate_memory_bank`
**Enhanced memory bank generation with real project data analysis**
- **Deep Project Analysis**: Parses package.json, scans source files, detects frameworks and dependencies  
- **Real Content Generation**: Creates meaningful documentation using actual project data instead of placeholders
- **Framework Detection**: Automatically analyzes project to detect technologies (React, Express.js, Jest, TypeScript, etc.)
- **Multi-Mode Interaction**: Supports analyze-first, guided, express, and custom conversational modes
- **Smart Recommendations**: Provides context-aware suggestions based on project complexity and detected technologies
- **Interactive Options**: Presents multiple choices with reasoning and consequences for user selection
- **Semantic Organization**: Organizes additional files with intelligent categorization when requested
- **Always creates 6 core files** in `.github/memory-bank` directory with real project data
- **Generates additional files only when explicitly requested** during conversational workflow
- Sets up dynamic `copilot-instructions.md` that adapts to actual files generated

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
- Interactive mode for detailed conflict analysis

### `resolve_sync_conflicts`
**🆕 Interactive sync conflict resolution**
- **Conversational workflow** for resolving sync conflicts between memory bank and Copilot instructions
- **Multi-step user interaction** with detailed conflict analysis and impact assessment
- **Auto-resolution options** for low-risk conflicts that can be safely fixed automatically
- **Manual review mode** with per-conflict confirmation for high-impact changes
- **Complete audit trail** of user choices, actions taken, and conversation log
- **Final validation** and status reporting after resolution attempts

### `setup_copilot_instructions`
**Dynamic Copilot integration**
- Creates/updates `copilot-instructions.md` based on actual memory bank structure
- Automatically discovers semantic folders and files
- Configures memory bank workflows with real-time status
- Sets up session reset handling with folder awareness
- Includes sync validation timestamps

## 📁 Memory Bank Structure

Memory banks are **always** created in `.github/memory-bank/` with the following structure:

### Core Structure (Always Generated)
```
.github/
├── memory-bank/
│   ├── projectbrief.md          # ✅ Foundation document (ALWAYS generated)
│   ├── productContext.md        # ✅ Purpose and goals (ALWAYS generated)
│   ├── activeContext.md         # ✅ Current work focus (ALWAYS generated)
│   ├── systemPatterns.md        # ✅ Architecture and patterns (ALWAYS generated)
│   ├── techContext.md           # ✅ Technologies and setup (ALWAYS generated)
│   └── progress.md              # ✅ Status and milestones (ALWAYS generated)
└── copilot-instructions.md      # ✅ Dynamic Copilot config (ALWAYS generated)
```

### With Optional Additional Files (User-Requested Only)

#### Semantic Organization (Default when additional files requested)
```
.github/
├── memory-bank/
│   ├── [6 core files above]      # ✅ Always generated
│   ├── features/                 # 🔄 OPTIONAL: Only if explicitly requested
│   │   ├── authentication.md     # 🔄 Generated only when user requests feature docs
│   │   └── payment-system.md     # 🔄 Smart categorization by content
│   ├── integrations/             # 🔄 OPTIONAL: Third-party integrations, APIs
│   │   ├── github-api.md         # 🔄 Only when user requests integration docs
│   │   └── stripe-integration.md
│   ├── deployment/               # 🔄 OPTIONAL: Deployment guides, infrastructure
│   │   ├── docker-setup.md       # 🔄 Only when user requests deployment docs
│   │   └── aws-deployment.md
│   ├── api/                      # 🔄 OPTIONAL: API documentation, endpoints
│   │   ├── rest-endpoints.md     # 🔄 Only when user requests API docs
│   │   └── graphql-schema.md
│   ├── testing/                  # 🔄 OPTIONAL: Testing strategies, frameworks
│   │   ├── unit-testing.md       # 🔄 Only when user requests testing docs
│   │   └── e2e-testing.md
│   ├── security/                 # 🔄 OPTIONAL: Security considerations, auth
│   │   ├── auth-patterns.md      # 🔄 Only when user requests security docs
│   │   └── security-checklist.md
│   ├── performance/              # 🔄 OPTIONAL: Performance optimization
│   │   └── optimization-guide.md # 🔄 Only when user requests performance docs
│   └── [custom-folders]/         # 🔄 OPTIONAL: User-defined semantic folders
└── copilot-instructions.md       # ✅ Dynamically adapts to actual structure
```

#### Flat Organization (When additional files requested with flat preference)
```
.github/
├── memory-bank/
│   ├── [6 core files above]     # ✅ Always generated at root
│   ├── additional-file-1.md     # 🔄 OPTIONAL: Only when explicitly requested
│   ├── additional-file-2.md     # 🔄 OPTIONAL: Additional files at root level
│   └── custom-documentation.md  # 🔄 OPTIONAL: User-specified files
└── copilot-instructions.md      # ✅ Configured for flat structure
```

**🎯 Smart File Organization:**
- **6 Core Files**: ALWAYS generated at memory bank root level (no exceptions)
- **Additional Files**: ONLY generated when explicitly requested by user during customization
- **Semantic Categorization**: When additional files are requested, they're automatically sorted by purpose
- **Custom Folders**: User can define project-specific semantic folders for requested files
- **Dynamic Copilot Integration**: Instructions adapt to actual files generated (core + any requested additional files)
- **User-Driven**: Zero additional files created unless specifically asked for in customization options

## 🔧 Semantic Categories (For Additional Files)

### Automatic Categorization (When Additional Files Are Requested)
When users explicitly request additional documentation files, they are automatically organized based on content patterns:

| Category | Folder | File Patterns | Purpose | Generated When |
|----------|--------|---------------|---------|----------------|
| **Features** | `features/` | feature, component, module, functionality | Feature-specific implementation details | User requests feature documentation |
| **Integrations** | `integrations/` | api, integration, service, external, webhook | Third-party services and APIs | User requests integration documentation |
| **Deployment** | `deployment/` | deploy, infrastructure, docker, kubernetes, ci/cd | Deployment and infrastructure | User requests deployment documentation |
| **API** | `api/` | endpoint, route, controller, graphql, rest | API documentation and specs | User requests API documentation |
| **Testing** | `testing/` | test, qa, spec, e2e, unit | Testing strategies and frameworks | User requests testing documentation |
| **Security** | `security/` | security, auth, authentication, compliance | Security considerations | User requests security documentation |
| **Performance** | `performance/` | performance, optimization, benchmark, monitoring | Performance and optimization | User requests performance documentation |

**Note**: These folders are only created when users explicitly request additional files during the interactive setup process.

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

3. **Restart Claude Desktop** - Your 6 MCP tools will be available!

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

You should see: ✅ All 6 MCP tools configured successfully!

## 🎯 Usage Examples

### Basic Memory Bank Generation (Core Files Only)
```
User: "I'd like to generate a memory bank for my project"
Server: "What's the root directory for your project?"
User: "C:\MyProjects\WebApp"
Server: "Would you like semantic organization (recommended) or flat structure?"
User: "Semantic organization"
Server: "Standard structure or custom approach?"
User: "Standard"
Server: [Generates ONLY the 6 core files - clean and simple]
Result: ✅ 6 essential files at .github/memory-bank/ root level
```

### Enhanced Memory Bank with Real Project Data
```
User: "Generate a memory bank for my React/Express web app"
Server: "I've analyzed your project and detected: React, Express.js, Jest, TypeScript"
Server: "Project: demo-web-app v1.0.0 - A demo web application for memory bank generation testing"
Server: "Dependencies: 3 runtime (express@^4.18.0, react@^18.2.0, react-dom@^18.2.0), 4 dev dependencies"
Server: "Would you like semantic organization or additional documentation?"
User: "Yes, I need API and deployment documentation"
Server: [Creates 6 core files with real project data + api/endpoints.md + deployment/docker-guide.md]
Result: Meaningful documentation with actual dependencies, scripts, and architecture
```

### Real Content Example (vs Previous Placeholders)
**Before**: `[List key dependencies and their purposes]`
**After**: 
```markdown
### Runtime Dependencies (3)
- `express@^4.18.0`
- `react@^18.2.0` 
- `react-dom@^18.2.0`

### Available Scripts
- `npm run start`: node server.js
- `npm run test`: jest
- `npm run build`: webpack --mode production
```

### Minimal Memory Bank (Core Files Only, Flat Structure)
```
User: "Create a simple memory bank for my small project"
Server: "What's your project root directory?"
User: "/home/user/simple-app"
Server: "Semantic organization or flat structure?"
User: "Flat structure for simplicity"
Server: "Would you like any additional files beyond the core 6?"
User: "No, just the essentials"
Server: [Generates only the 6 core files at root - clean and simple]
Result: ✅ 6 files total at .github/memory-bank/ + copilot-instructions.md
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
Result: ✅ 6 core files + 9 additional files organized in 4 semantic folders, fully synchronized with Copilot instructions
```

## 🎯 Benefits

### For GitHub Copilot
- **Rich Project Context**: Memory banks contain real project data, dependencies, and architecture details
- **Framework Awareness**: Understands detected frameworks (React, Express.js, Jest) and their specific patterns
- **Dependency Knowledge**: Access to actual runtime and development dependencies with versions
- **Architecture Understanding**: Real entry points, configuration files, and project structure patterns
- **Context Persistence**: Maintains project understanding across sessions
- **Semantic Awareness**: Understands project organization and file relationships
- **Dynamic Integration**: Copilot instructions adapt to actual memory bank structure
- **Consistent Responses**: Aligned with actual project patterns and decisions
- **Informed Suggestions**: Based on real project data rather than generic templates
- **Sync Validation**: Ensures Copilot instructions stay current with memory bank changes

### For Developers
- **Real Project Documentation**: Generated content uses actual project name, dependencies, scripts, and architecture
- **Interactive Setup**: Tailored to your specific needs and workflow
- **Minimal by Default**: Always generates only 6 essential core files with meaningful content
- **Optional Expansion**: Additional files only when explicitly requested
- **Semantic Organization**: Requested files automatically organized by purpose
- **Standardized Location**: Always in `.github/memory-bank`
- **Automatic Integration**: Copilot configured automatically with structure awareness
- **Quality Assurance**: Built-in validation and sync checking
- **Flexible Structure**: Choose between semantic organization or flat structure for additional files
- **Custom Categories**: Define project-specific semantic folders for requested files
- **User-Driven Generation**: Zero bloat - only creates files you actually need
- **Accurate Messaging**: Clear feedback about what was generated (content enhancement vs additional files)

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
├── index.ts                      # Main MCP server with 6 tools
├── core/                         # Core business logic
│   ├── projectAnalysis.ts        # Project scanning and analysis
│   ├── memoryBankGenerator.ts    # Memory bank file generation
│   ├── semanticOrganization.ts   # Semantic folder organization  
│   └── validation.ts             # Memory bank validation
├── interactions/                 # User interaction workflows
│   ├── conversational.ts         # Conversational analysis guidance
│   └── syncResolution.ts         # Interactive sync conflict resolution
├── integrations/                 # External tool integrations
│   └── copilotIntegration.ts     # GitHub Copilot instructions setup
├── utils/                        # Utility functions
│   └── fileUtils.ts              # File system operations
└── types/                        # Type definitions
    ├── conversational.ts         # Conversational workflow types
    └── sync.ts                   # Sync and conflict resolution types
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
- Inspired by the [Cline Memory Bank documentation](https://docs.cline.bot/prompting/cline-memory-bank) for AI-assisted development patterns

## 📚 Additional Resources

- **[Cline Memory Bank Documentation](https://docs.cline.bot/prompting/cline-memory-bank)** - Original inspiration and foundational concepts for AI memory banks
- **[Model Context Protocol](https://modelcontextprotocol.io/)** - Protocol specification for AI tool integration
- **[GitHub Copilot Documentation](https://docs.github.com/en/copilot)** - Official documentation for GitHub Copilot integration

---

> **🎯 Hackathon Goal**: Demonstrate how interactive AI tools can automatically capture, organize, and maintain project knowledge using semantic organization principles, making software development more intelligent, structured, and collaborative. Features intelligent file categorization, dynamic Copilot integration, and comprehensive sync validation.

*Made with ❤️ for the developer community*