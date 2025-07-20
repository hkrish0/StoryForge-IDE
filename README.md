# 🚀 StoryForge IDE

> **Revolutionary story-centric AI development environment with multi-language support**

StoryForge IDE transforms how developers build applications by introducing a **structured, story-driven workflow** that eliminates the chaos of traditional AI coding tools. Built with Tauri and SvelteKit, it features Monaco Editor integration and a focused development approach through user stories.

![Story-Centric Workflow](https://img.shields.io/badge/Workflow-Story%20Centric-blue)
![Monaco Editor](https://img.shields.io/badge/Editor-Monaco-green)
![Tauri Desktop](https://img.shields.io/badge/Platform-Tauri%20Desktop-orange)
![Multi-Language](https://img.shields.io/badge/Support-Multi%20Language-purple)

## 🎯 Revolutionary Architecture: One Story, One Focus

### The Problem with Current AI Tools
- Multiple simultaneous conversations create chaos
- No clear progress tracking or completion states  
- AI lacks context about what it's currently building
- Overwhelming unlimited chat history

### The StoryForge Solution
**Single Active Story Workflow** with structured progression:

```
🟡 Draft → 🔴 Active → 🔵 Review → 🟢 Completed
   ↓         ↓          ↓         ↓
Create    Chat &     Generated   User
Story     Refine     Code        Confirms
```

## ✨ Key Features

### 🎨 Professional Development Environment
- **Monaco Editor**: Full syntax highlighting for JavaScript, TypeScript, JSON, HTML, CSS
- **VS Code-Style Interface**: Dark theme, professional panels, file tree navigation
- **Tauri Desktop App**: Native performance with web technologies

### 📋 Story-Centric Workflow
- **Single Active Story Rule**: Only one story active at a time for focused development
- **Visual State Progression**: Clear indicators for Draft → Active → Review → Completed
- **Expandable Chat Interface**: Detailed conversation per story (not global chat)
- **Iterative Refinement**: Reopen and improve completed stories
- **Full User Control**: Edit stories in any state

### 🛠️ Smart Project Creation
- **Enhanced Project Wizard**: Professional UI with package selection
- **11 Popular Node.js Packages**: Express, CORS, Helmet, Morgan, Dotenv, JWT, Bcrypt, Mongoose, Sequelize, Joi, Nodemailer
- **Intelligent Code Generation**: Smart package.json and index.js generation
- **Native Folder Selection**: Browse and select project directories

### 🔮 Future Multi-Language Support
- **Extensible Architecture**: Designed for Python, Java, C#, Go, Rust, and more
- **Language-Agnostic Workflow**: Story-centric approach works for any technology
- **Template System**: Expandable project templates

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Rust and Cargo (for Tauri)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/hkrish0/StoryForge-IDE.git
cd StoryForge-IDE

# Install dependencies
npm install

# Start development server (Tauri desktop app)
npm run tauri dev

# Or start frontend only
npm run dev
```

### Building for Production

```bash
# Build the complete desktop application
npm run tauri build

# Build frontend only
npm run build
```

## 🏗️ Project Architecture

### Frontend (SvelteKit)
- **Entry Point**: `src/routes/+page.svelte` - conditionally renders ProjectInitializer or Workspace
- **State Management**: Svelte stores in `src/lib/stores.js` manage project, stories, and active file state
- **API Layer**: `src/lib/api.js` wraps Tauri invoke calls with browser safety checks

### Backend (Rust/Tauri)
- **Location**: `src-tauri/src/main.rs`
- **Commands**: 5 main Tauri commands for project management:
  - `initialize_project` - Creates new Node.js projects with package selection
  - `load_project` - Loads existing projects and scans files
  - `read_file/write_file` - File I/O operations
  - `generate_code` - Context-aware code generation (AI integration planned)

### Three-Panel Layout
- **Left Sidebar**: FileTreeView - project file navigation
- **Center**: EditorView - Monaco Editor for code editing
- **Right Sidebar**: StoryPanelView - user story management and AI chat

## 📊 Story Data Model

```typescript
interface Story {
  id: string
  title: string                 // Brief user story description
  status: 'draft' | 'active' | 'review' | 'completed'
  chatHistory: Message[]        // Conversation within story context
  generatedFiles: File[]        // Code files created for this story
  createdAt: Date
  completedAt?: Date
}

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  storyId: string              // Links message to specific story
}
```

## 🎯 Workflow Example

1. **Create Story**: "User authentication system"
2. **Activate Story**: Story becomes active (red indicator)
3. **Chat with AI**: Discuss requirements within story context
4. **Generate Code**: AI creates authentication routes and middleware
5. **Review**: Story moves to review state (blue indicator)
6. **Approve**: User confirms and marks complete (green indicator)
7. **Next Story**: Can now activate next story in queue

## 🛠️ Development Commands

### Frontend (SvelteKit)
```bash
npm run dev          # Start development server (frontend only)
npm run build        # Build SvelteKit frontend for production
npm run preview      # Preview the built frontend
```

### Tauri Desktop App
```bash
npm run tauri dev    # Start Tauri development app (builds frontend + runs Rust backend)
npm run dev:bg       # Start Tauri in background with output logged to tauri.log
npm run tauri build  # Build complete desktop application
```

### Backend (Rust)
```bash
cd src-tauri/
cargo build          # Build Rust backend
cargo run            # Run Rust backend directly
cargo test           # Run Rust tests
```

## 🎨 UI Screenshots

### Story Panel with Active Story
```
┌─ Story Card ─────────────────────────┐
│ 🔴 #2 User Authentication           │
│ ├─ Status: Active                   │
│ ├─ Chat: 5 messages                 │
│ ├─ Files: 3 generated              │
│ └─ [💬 Open Chat] [⚡ Generate]     │
│                                     │
│ ┌─ Expanded Chat ──────────────────┐ │
│ │ User: I need login endpoints     │ │
│ │ AI: I'll create JWT auth system  │ │
│ │ [Type message...] [Send]         │ │
│ └──────────────────────────────────── │
└─────────────────────────────────────┘
```

## 🚧 Current Status

### ✅ Completed Features
- ✅ Monaco Editor Integration with syntax highlighting
- ✅ Enhanced Project Wizard with package selection
- ✅ VS Code-Style Interface with dark theme
- ✅ Story-Centric Architecture Implementation
- ✅ Expandable Chat Interface per story
- ✅ Complete story state management
- ✅ File tree navigation and project management

### 🔄 In Development
- 🔄 AI Service Integration (OpenAI/Claude API)
- 🔄 Context-aware code generation
- 🔄 Enhanced file management per story

### 🔮 Planned Features
- 🔮 Python project support
- 🔮 Java/Spring Boot templates
- 🔮 Database integration wizards
- 🔮 Docker containerization
- 🔮 Git integration with story-based commits

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: https://github.com/hkrish0/StoryForge-IDE
- **Issues**: https://github.com/hkrish0/StoryForge-IDE/issues
- **Discussions**: https://github.com/hkrish0/StoryForge-IDE/discussions

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=hkrish0/StoryForge-IDE&type=Date)](https://star-history.com/#hkrish0/StoryForge-IDE&Date)

---

**Built with ❤️ by the StoryForge team**

*Transforming how developers build applications, one story at a time.*