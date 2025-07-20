# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (SvelteKit)
- `npm run dev` - Start development server (frontend only)
- `npm run build` - Build the SvelteKit frontend for production
- `npm run preview` - Preview the built frontend

### Tauri Desktop App
- `npm run tauri dev` - Start the Tauri development app (builds frontend + runs Rust backend)
- `npm run dev:bg` - Start Tauri in background with output logged to tauri.log
- `npm run tauri build` - Build the complete desktop application

### Backend (Rust)
Backend commands must be run from the `src-tauri/` directory:
- `cargo build` - Build the Rust backend
- `cargo run` - Run the Rust backend directly
- `cargo test` - Run Rust tests

## Architecture Overview

MonacoG is a **Tauri-based desktop application** that serves as a project management and code generation tool. The architecture consists of:

### Frontend (SvelteKit)
- **Tech Stack**: SvelteKit with static adapter, Vite for bundling
- **Entry Point**: `src/routes/+page.svelte` - conditionally renders ProjectInitializer or Workspace
- **State Management**: Svelte stores in `src/lib/stores.js` manage project, backlog, and active file state
- **API Layer**: `src/lib/api.js` wraps Tauri invoke calls with browser safety checks

### Backend (Rust/Tauri)
- **Location**: `src-tauri/src/main.rs`
- **Commands**: Exposes 5 main Tauri commands for project management:
  - `initialize_project` - Creates new Node.js projects with Express template
  - `load_project` - Loads existing projects and scans files
  - `read_file/write_file` - File I/O operations
  - `generate_code` - Simple template-based code generation from user stories

### Component Structure
The workspace follows a **three-panel layout**:
- **Left Sidebar**: FileTreeView - project file navigation
- **Center**: EditorView - file editing (currently textarea, designed for Monaco Editor integration)
- **Right Sidebar**: BacklogView - user story management and code generation

### Key Data Flow
1. **Project Loading**: User selects path → Tauri loads project → Frontend updates stores → Workspace renders
2. **File Editing**: User clicks file → FileTree updates activeFile store → Editor displays content
3. **Code Generation**: User adds stories + description → Tauri generates Express routes → Updates project files

### Tauri Configuration
- **Permissions**: Limited to dialog APIs and shell open
- **Security**: CSP disabled, minimal allowlist for security
- **Build**: Frontend builds to `build/`, Tauri bundles complete app

## Current Development Status (2025-01-20)

### ✅ Completed Features:
1. **Monaco Editor Integration** - Replaced textarea with full Monaco Editor
   - CDN-based loading for reliability
   - Syntax highlighting for JS, TS, JSON, HTML, CSS, etc.
   - Real-time editing with save functionality
   - Dark theme integration

2. **Enhanced Project Wizard** - Modern UI with package selection
   - Professional wizard interface with tabs
   - 11 popular Node.js packages (Express, CORS, Helmet, Morgan, etc.)
   - Smart package.json and index.js generation
   - Automatic .env file creation for dotenv

3. **Folder Selection Dialog** - Native directory picker
   - Browse button for parent directory selection
   - Real-time project path preview
   - Improved UX flow: name → browse → create

### ✅ COMPLETED REVOLUTIONARY FEATURES:

1. **Monaco Editor Integration** ✅ - Professional code editor with syntax highlighting
2. **Enhanced Project Wizard** ✅ - Package selection + folder browser
3. **VS Code-Style Interface** ✅ - Dark theme, professional panels  
4. **Project Management** ✅ - Open/New/Close projects
5. **Story-Centric Architecture** ✅ - GAME-CHANGING workflow implementation

### 🚀 BREAKTHROUGH ARCHITECTURE (IMPLEMENTED):

**Revolutionary Story-Centric Workflow** - Our key differentiator:
- **Single Active Story Rule**: Only one story active at a time (prevents chaos)
- **Story States**: Draft → Active → Review → Completed with visual indicators  
- **Contextual Chat**: Expandable chat per story (not global), AI understands story context
- **Mandatory Confirmation**: User must approve generated code before next story
- **Iterative Refinement**: Can reopen completed stories for improvements

**Story Data Structure:**
```typescript
Story {
  id: string
  title: string           // Brief user story
  status: 'draft' | 'active' | 'review' | 'completed'
  chatHistory: Message[]  // Conversation within story context
  generatedFiles: File[]  // Code generated for this story
  createdAt: Date
  completedAt?: Date
}
```

### 📋 Next Priorities:
1. **Story State Management** - Implement new data structures & stores
2. **Single Active Story UI** - Redesign BacklogView with story states
3. **AI Service Integration** - Context-aware generation per active story
4. **Expandable Chat Interface** - Per-story chat with AI integration

## Important Notes

- **Monaco Editor** is now fully implemented (EditorView.svelte:67-72)
- **Project creation** supports advanced package selection
- **File tree scanning** is shallow (single directory level only)
- **Code generation** is currently template-based, AI integration planned
- Frontend uses **static adapter** for Tauri compatibility