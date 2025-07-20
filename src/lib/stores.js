import { writable, derived } from 'svelte/store';

// ===== Project Management =====
export const project = writable(null);
export const activeFile = writable(null);

export function setProject(projectData) {
	project.set(projectData);
}

export function setActiveFile(file) {
	activeFile.set(file);
}

// ===== Story-Centric Data Model =====

// Story states: 'draft' | 'active' | 'review' | 'completed'
export const stories = writable([]);
export const messages = writable([]);
export const generatedFiles = writable([]);

// Derived store for the currently active story (only one allowed)
export const activeStory = derived(stories, ($stories) => 
	$stories.find(story => story.status === 'active') || null
);

// ===== Story Management Functions =====

let storyIdCounter = 1;
let messageIdCounter = 1;

export function createStory(title) {
	const newStory = {
		id: `story-${storyIdCounter++}`,
		title: title.trim(),
		status: 'draft',
		createdAt: new Date(),
		lastModified: new Date(),
		activatedAt: null,
		completedAt: null
	};

	stories.update(currentStories => [...currentStories, newStory]);
	return newStory;
}

export function activateStory(storyId) {
	stories.update(currentStories => 
		currentStories.map(story => ({
			...story,
			status: story.id === storyId ? 'active' : 
					story.status === 'active' ? 'draft' : story.status,
			activatedAt: story.id === storyId ? new Date() : story.activatedAt,
			lastModified: story.id === storyId ? new Date() : story.lastModified
		}))
	);
}

export function updateStoryStatus(storyId, newStatus) {
	stories.update(currentStories => 
		currentStories.map(story => 
			story.id === storyId 
				? {
					...story,
					status: newStatus,
					lastModified: new Date(),
					completedAt: newStatus === 'completed' ? new Date() : story.completedAt
				}
				: story
		)
	);
}

export function deleteStory(storyId) {
	// Remove story
	stories.update(currentStories => 
		currentStories.filter(story => story.id !== storyId)
	);
	
	// Remove associated messages
	messages.update(currentMessages => 
		currentMessages.filter(message => message.storyId !== storyId)
	);
	
	// Remove associated generated files
	generatedFiles.update(currentFiles => 
		currentFiles.filter(file => file.storyId !== storyId)
	);
}

export function editStory(storyId, newTitle) {
	stories.update(currentStories => 
		currentStories.map(story => 
			story.id === storyId 
				? { ...story, title: newTitle.trim(), lastModified: new Date() }
				: story
		)
	);
}

// ===== Message Management =====

export function addMessage(storyId, role, content) {
	const newMessage = {
		id: `msg-${messageIdCounter++}`,
		storyId,
		role, // 'user' | 'ai'
		content: content.trim(),
		timestamp: new Date()
	};

	messages.update(currentMessages => [...currentMessages, newMessage]);
	
	// Update story's lastModified
	stories.update(currentStories => 
		currentStories.map(story => 
			story.id === storyId 
				? { ...story, lastModified: new Date() }
				: story
		)
	);
	
	return newMessage;
}

// Get messages for a specific story
export function getStoryMessages(storyId) {
	let storyMessages = [];
	messages.subscribe(currentMessages => {
		storyMessages = currentMessages.filter(msg => msg.storyId === storyId);
	})();
	return storyMessages;
}

// Derived store for messages of the active story
export const activeStoryMessages = derived(
	[messages, activeStory], 
	([$messages, $activeStory]) => 
		$activeStory ? $messages.filter(msg => msg.storyId === $activeStory.id) : []
);

// ===== Generated Files Management =====

export function addGeneratedFile(storyId, path, content, language = 'javascript') {
	const newFile = {
		id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		storyId,
		path,
		content,
		language,
		createdAt: new Date()
	};

	generatedFiles.update(currentFiles => [...currentFiles, newFile]);
	return newFile;
}

export function getStoryFiles(storyId) {
	let storyFiles = [];
	generatedFiles.subscribe(currentFiles => {
		storyFiles = currentFiles.filter(file => file.storyId === storyId);
	})();
	return storyFiles;
}

// ===== Utility Functions =====

export function canActivateStory(storyId) {
	let currentStories = [];
	let targetStory = null;
	
	stories.subscribe(stories => { currentStories = stories; })();
	targetStory = currentStories.find(s => s.id === storyId);
	
	if (!targetStory || targetStory.status === 'active') return false;
	
	// Check if there's already an active story (excluding the target story)
	const hasActiveStory = currentStories.some(s => s.status === 'active' && s.id !== storyId);
	return !hasActiveStory;
}

export function canReactivateStory(storyId) {
	let currentStories = [];
	stories.subscribe(stories => { currentStories = stories; })();
	
	const targetStory = currentStories.find(s => s.id === storyId);
	if (!targetStory || targetStory.status === 'active') return false;
	
	// Can reactivate if story is in review/completed and no other story is active
	const hasActiveStory = currentStories.some(s => s.status === 'active');
	return (targetStory.status === 'review' || targetStory.status === 'completed') && !hasActiveStory;
}

export function getActiveStoryId() {
	let currentStories = [];
	stories.subscribe(stories => { currentStories = stories; })();
	const active = currentStories.find(s => s.status === 'active');
	return active ? active.id : null;
}

// ===== Legacy Support (for backward compatibility) =====
export const backlog = derived(stories, $stories => 
	$stories.map(story => story.title) // Simple array of titles for old components
);

export function addStory(title) {
	return createStory(title);
}
