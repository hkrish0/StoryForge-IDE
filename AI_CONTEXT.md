# AI Editor Context - MonacoG Enhancement Project

## Project Overview
Building an AI-powered Node.js/Express editor with the following key features:
- AI-generated project initialization (like npm init but with package selection)
- Monaco Editor integration for rich code editing
- User story management with drag/drop reordering
- AI-powered Express REST endpoint generation from project description + user stories
- Tauri + SvelteKit tech stack (maintaining existing architecture)

## Current Architecture Analysis
**Frontend (SvelteKit):**
- Entry: `src/routes/+page.svelte` - conditionally renders ProjectInitializer or Workspace
- State: Svelte stores in `src/lib/stores.js` (project, backlog, activeFile)
- Components: ProjectInitializer, Workspace (3-panel), FileTreeView, EditorView (textarea), BacklogView

**Backend (Rust/Tauri):**
- 5 commands: initialize_project, load_project, read_file, write_file, generate_code
- Basic Express template generation only
- Single-level directory scanning
- Template-based route generation (no AI yet)

## Proposed New Architecture

### Frontend Structure:
```
src/
├── routes/+page.svelte                    # Main application entry
├── lib/
│   ├── stores/
│   │   ├── project.js                     # Project state management
│   │   ├── userStories.js                # User stories with drag/drop
│   │   ├── aiGeneration.js               # AI generation state
│   │   └── editor.js                     # Monaco editor state
│   ├── components/
│   │   ├── ProjectWizard.svelte          # Initial project setup
│   │   ├── UserStoryPanel.svelte         # Left/right sidebar for stories
│   │   ├── MonacoEditor.svelte           # Monaco editor integration
│   │   ├── FileExplorer.svelte           # File tree navigation
│   │   ├── AIGenerationPanel.svelte      # AI controls & progress
│   │   └── ProjectSettings.svelte        # Package selection, auth, DB
│   ├── api/
│   │   ├── tauri.js                      # Tauri command wrappers
│   │   └── ai.js                         # AI service integration
│   └── utils/
│       ├── dragDrop.js                   # User story reordering
│       └── codeGeneration.js             # Code generation helpers
```

### Backend Structure:
```
src-tauri/src/
├── main.rs                               # Main Tauri app entry
├── commands/
│   ├── project.rs                        # Project initialization & management
│   ├── file_system.rs                    # File operations
│   ├── ai_generation.rs                  # AI service communication
│   └── package_manager.rs                # npm/dependency management
├── models/
│   ├── project.rs                        # Project data structures
│   ├── user_story.rs                     # User story models
│   └── generation_request.rs             # AI generation models
├── services/
│   ├── template_engine.rs                # Project template generation
│   ├── ai_client.rs                      # External AI API client
│   └── code_analyzer.rs                  # Code structure analysis
└── utils/
    ├── file_utils.rs                     # File system utilities
    └── validation.rs                     # Input validation
```

## MVP Features Defined

### Core MVP Features:
1. **Project Wizard** ✅ COMPLETED
   - Project name, description input
   - Package selection (Express, Auth, Database, Validation, etc.)
   - Template generation with selected packages
   - Native folder selection dialog

2. **Monaco Editor Integration** ✅ COMPLETED
   - Syntax highlighting for JavaScript/TypeScript
   - File editing with save functionality
   - CDN-based loading with fallback

3. **Revolutionary Story-Centric Workflow** 🚀 NEW ARCHITECTURE
   - **Single Active Story**: Only one story active at a time for focused development
   - **Story States**: Draft → Active → Review → Completed with visual indicators
   - **Expandable Chat**: Detailed conversation per story (not global chat)
   - **Mandatory Completion**: User must confirm before moving to next story
   - **Iterative Refinement**: Can reopen and edit completed stories
   
   **Story Data Structure:**
   ```typescript
   Story {
     id: string
     title: string           // Brief user story
     status: 'draft' | 'active' | 'review' | 'completed'
     chatHistory: Message[]  // Detailed conversation within story
     generatedFiles: File[]  // Code generated for this story
     createdAt: Date
     completedAt?: Date
   }
   ```

4. **AI Code Generation**
   - Context-aware generation based on active story
   - Iterative refinement through story chat
   - File-specific code generation per story
   - Integration with existing project structure

5. **File Management** ✅ COMPLETED
   - VS Code-style file tree navigation
   - File icons and active file highlighting
   - Project management (Open/New/Close)

### Current Strengths to Build On:
- ✅ Solid Tauri + SvelteKit foundation
- ✅ Clean architecture with proper separation
- ✅ Basic file operations working
- ✅ User story concept already exists

### Key Differentiators:
- **Story-Centric Architecture**: Unlike chat-based tools, focuses development through structured stories
- **Single Active Story Rule**: Prevents overwhelming complexity and maintains focus
- **Context-Aware AI**: AI understands project structure and story context
- **Professional Editor UI**: VS Code-style interface with Monaco Editor

## Implementation Priority (Updated):
1. ✅ Monaco Editor integration - COMPLETED
2. ✅ Enhanced project wizard - COMPLETED  
3. ✅ Professional UI redesign - COMPLETED
4. 🔄 Story-Centric Workflow - IN PROGRESS
5. 🔄 AI service integration with story context - NEXT
6. Story state management and chat interface

## Tech Stack Maintained:
- Frontend: SvelteKit + Vite
- Backend: Rust + Tauri
- Editor: Monaco Editor (to be added)
- AI: External API integration (to be determined)

---
*Generated context for MonacoG-AI development session*