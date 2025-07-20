# Story-Centric Architecture - MonacoG AI

## 🎯 Core Philosophy: One Story, One Focus

### The Problem with Current Approach:
- Multiple simultaneous user stories create chaos
- Unlimited chat history becomes unmanageable  
- No clear progress tracking or completion states
- AI lacks context about which story it's working on

### The Solution: Story-Centric Workflow
**Revolutionary approach that differentiates MonacoG from all other AI coding tools**

## 🏗️ Architecture Overview

### Story States Flow:
```
🟡 Draft → 🔴 Active → 🔵 Review → 🟢 Completed
   ↓         ↓          ↓         ↓
Create    Chat &     Generated   User
Story     Refine     Code        Confirms
```

### Core Rules:
1. **🎯 Single Active Story**: Only ONE story can be "Active" at any time
2. **📊 Mandatory Progression**: Must complete current story before activating next
3. **💬 Contextual Chat**: Each story has its own chat history (not global)
4. **✅ Explicit Confirmation**: User must approve generated code to move forward
5. **🔄 Iterative Refinement**: Can reopen completed stories to improve

## 📋 Story Data Model

```typescript
interface Story {
  id: string                    // Unique identifier
  title: string                 // Brief user story (e.g., "User login functionality")
  status: StoryStatus          // Current state
  chatHistory: Message[]       // Conversation within this story context
  generatedFiles: GeneratedFile[] // Code files created for this story
  createdAt: Date
  activatedAt?: Date           // When story became active
  completedAt?: Date           // When user confirmed completion
  lastModified: Date
}

type StoryStatus = 'draft' | 'active' | 'review' | 'completed'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  storyId: string              // Links message to specific story
}

interface GeneratedFile {
  id: string
  path: string                 // Relative to project root
  content: string
  language: string             // For syntax highlighting
  storyId: string              // Which story generated this file
  createdAt: Date
}
```

## 🎨 UX Design Principles

### Visual Story States:
- 🟡 **Draft**: Gray/yellow - story created but not started
- 🔴 **Active**: Red accent - currently being worked on (only one allowed)
- 🔵 **Review**: Blue accent - code generated, awaiting user confirmation
- 🟢 **Completed**: Green accent - approved and done

### Story Card Layout:
```
┌─ Story Card ─────────────────────────┐
│ 🟡 #1 User Authentication           │
│ ├─ Status: Draft                    │
│ ├─ Created: 2 hours ago             │
│ └─ [Activate] [Edit] [Delete]       │
└─────────────────────────────────────┘

┌─ Active Story Card ─────────────────┐
│ 🔴 #2 Product Catalog              │
│ ├─ Status: Active                  │
│ ├─ Chat: 5 messages                │
│ ├─ Files: 3 generated             │
│ └─ [💬 Open Chat] [⚡ Generate]    │
│                                    │
│ ┌─ Expanded Chat ─────────────────┐ │
│ │ User: I need product listing   │ │
│ │ AI: I'll create REST endpoints │ │
│ │ [Type message...] [Send]       │ │
│ └───────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🔄 Workflow Implementation

### Step 1: Story Creation
- User creates new story with brief title
- Story starts in "Draft" state
- Added to story list but not active

### Step 2: Story Activation  
- User clicks "Activate" on draft story
- Any currently active story must be completed first
- Story moves to "Active" state (red indicator)
- Chat interface becomes available

### Step 3: Story Development
- User chats with AI within story context
- AI has full context of project + current story
- AI can ask clarifying questions
- Chat history preserved per story

### Step 4: Code Generation
- User requests code generation
- AI generates files specific to this story
- Story moves to "Review" state (blue indicator)
- Generated files highlighted in file tree

### Step 5: Story Completion
- User reviews generated code
- Can iterate via chat if changes needed
- User explicitly marks story as "Completed"
- Story moves to "Completed" state (green indicator)
- New stories can now be activated

### Step 6: Story Refinement (Optional)
- Can reopen completed stories
- Continue chat to refine or expand
- Regenerate code with improvements
- Maintains full history

## 🎯 Key Benefits

### For Users:
- **Focused Development**: One story at a time prevents overwhelm
- **Clear Progress**: Visual states show exactly where you are  
- **Organized Context**: Chat history per story, not messy global chat
- **Iterative Improvement**: Can refine stories over time
- **Explicit Control**: Must approve before moving forward

### For AI:
- **Rich Context**: Understands current story + project structure
- **Focused Generation**: Generate code for specific story only
- **Conversation Memory**: Remembers full story conversation
- **Incremental Building**: Each story builds on previous completed work

### Competitive Differentiation:
- **Not a Chat Tool**: Structured workflow vs endless chat
- **Progress Tracking**: Unlike Cursor/GitHub Copilot
- **Story Context**: AI understands what it's building
- **Professional Workflow**: Like JIRA + AI + Code Editor combined

## 🛠️ Technical Implementation Plan

### Phase 1: Data Layer
- Update Svelte stores with new Story model
- Implement story state management
- Add story persistence (localStorage initially)

### Phase 2: UI Components
- Redesign BacklogView as StoryPanelView  
- Implement story cards with states
- Add story activation/completion controls

### Phase 3: Chat Interface
- Create expandable chat per story
- Implement message history per story
- Add AI chat integration

### Phase 4: AI Integration
- Connect to AI service (OpenAI/Claude API)
- Pass story context + project context to AI
- Generate code based on active story

### Phase 5: Code Generation
- Generate files specific to active story
- Track which files belong to which story
- Implement review/approval workflow

---

*This architecture will make MonacoG the first truly structured, story-driven AI development environment.*