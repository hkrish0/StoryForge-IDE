<script>
	import { onMount } from 'svelte';
	import { 
		stories, 
		activeStory, 
		createStory, 
		activateStory, 
		updateStoryStatus, 
		deleteStory,
		editStory,
		canActivateStory,
		canReactivateStory,
		addMessage,
		activeStoryMessages,
		project,
		setProject 
	} from '$lib/stores.js';

	let newStoryTitle = '';
	let projectDescription = '';
	let api = {};
	let isGenerating = false;
	let errorMessage = '';
	let expandedStories = new Set(); // Track which stories have expanded chat
	let editingStory = null; // Track which story is being edited
	let editTitle = '';

	// Chat state for active story
	let newMessage = '';
	let isSendingMessage = false;

	onMount(async () => {
		const { generateCode, writeFile, loadProject } = await import('$lib/api.js');
		api = { generateCode, writeFile, loadProject };
	});

	function handleCreateStory() {
		if (newStoryTitle.trim()) {
			createStory(newStoryTitle.trim());
			newStoryTitle = '';
		}
	}

	function handleActivateStory(storyId) {
		if (canActivateStory(storyId)) {
			activateStory(storyId);
			// Auto-expand the newly activated story
			expandedStories.add(storyId);
			expandedStories = expandedStories;
		}
	}

	function reactivateStory(storyId) {
		// Allow reactivating completed/review stories
		if (canReactivateStory(storyId)) {
			activateStory(storyId);
			expandedStories.add(storyId);
			expandedStories = expandedStories;
		}
	}

	function toggleStoryExpansion(storyId) {
		if (expandedStories.has(storyId)) {
			expandedStories.delete(storyId);
		} else {
			expandedStories.add(storyId);
		}
		expandedStories = expandedStories;
	}

	function startEditing(story) {
		editingStory = story.id;
		editTitle = story.title;
	}

	function saveEdit() {
		if (editTitle.trim() && editingStory) {
			editStory(editingStory, editTitle.trim());
		}
		cancelEdit();
	}

	function cancelEdit() {
		editingStory = null;
		editTitle = '';
	}

	async function sendMessage() {
		if (!newMessage.trim() || !$activeStory || isSendingMessage) return;

		const messageContent = newMessage.trim();
		newMessage = '';
		isSendingMessage = true;

		try {
			// Add user message
			addMessage($activeStory.id, 'user', messageContent);

			// TODO: Send to AI service and get response
			// For now, simulate AI response
			setTimeout(() => {
				addMessage($activeStory.id, 'ai', `I understand you want: "${messageContent}". Let me help you implement this feature.`);
				isSendingMessage = false;
			}, 1000);

		} catch (error) {
			console.error('Error sending message:', error);
			isSendingMessage = false;
		}
	}

	async function handleGenerate(storyId) {
		if (!api.generateCode || !$project) return;
		
		isGenerating = true;
		errorMessage = '';
		
		try {
			const story = $stories.find(s => s.id === storyId);
			if (!story) throw new Error('Story not found');

			// Move story to review status
			updateStoryStatus(storyId, 'review');

			// Generate code based on story context
			const generatedCode = await api.generateCode(projectDescription, [story.title]);

			const path = `${$project.path}/routes-${story.id}.js`;
			await api.writeFile(path, generatedCode);

			// Refresh the project to show the new file
			const updatedProject = await api.loadProject($project.path);
			setProject(updatedProject);

		} catch (error) {
			errorMessage = error.toString();
			console.error('Code generation error:', error);
		} finally {
			isGenerating = false;
		}
	}

	function getStoryStatusIcon(status) {
		switch (status) {
			case 'draft': return '🟡';
			case 'active': return '🔴';
			case 'review': return '🔵';
			case 'completed': return '🟢';
			default: return '⚪';
		}
	}

	function getStoryStatusColor(status) {
		switch (status) {
			case 'draft': return '#fbbf24';
			case 'active': return '#ef4444';
			case 'review': return '#3b82f6';
			case 'completed': return '#10b981';
			default: return '#6b7280';
		}
	}

	function formatTimeAgo(date) {
		if (!date) return '';
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		
		if (diffMins < 1) return 'now';
		if (diffMins < 60) return `${diffMins}m ago`;
		
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		
		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays}d ago`;
	}
</script>

<div class="story-panel">
	<div class="panel-header">
		<h3>📋 STORY MANAGER</h3>
		<span class="story-count">{$stories.length}</span>
	</div>

	<div class="panel-content">
		<!-- Project Description Section -->
		<div class="section">
			<div class="section-header">
				<h4>📝 Project Context</h4>
			</div>
			<div class="section-body">
				<textarea 
					class="description-input"
					bind:value={projectDescription} 
					placeholder="Describe your project context for AI..."
					rows="3" 
					disabled={isGenerating}
				></textarea>
			</div>
		</div>

		<!-- Story Creation Section -->
		<div class="section">
			<div class="section-header">
				<h4>➕ Create Story</h4>
			</div>
			<div class="section-body">
				<div class="story-input-group">
					<input 
						class="story-input"
						type="text" 
						bind:value={newStoryTitle} 
						placeholder="Enter user story (e.g., 'User authentication')"
						disabled={isGenerating}
						on:keydown={(e) => e.key === 'Enter' && handleCreateStory()}
					/>
					<button class="add-btn" on:click={handleCreateStory} disabled={isGenerating || !newStoryTitle.trim()}>
						CREATE
					</button>
				</div>
			</div>
		</div>

		<!-- Stories List Section -->
		<div class="section stories-section">
			<div class="section-header">
				<h4>📚 Stories</h4>
				{#if $activeStory}
					<span class="active-indicator">🔴 1 Active</span>
				{:else}
					<span class="inactive-indicator">⚪ No Active</span>
				{/if}
			</div>
			<div class="section-body">
				{#if $stories.length === 0}
					<div class="empty-stories">
						<p>No stories yet</p>
						<small>Create your first story to get started</small>
					</div>
				{:else}
					<div class="stories-list">
						{#each $stories as story (story.id)}
							<div class="story-card" class:expanded={expandedStories.has(story.id)}>
								<!-- Story Header -->
								<div class="story-header" style="border-left: 3px solid {getStoryStatusColor(story.status)}">
									<div class="story-status">
										<span class="status-icon">{getStoryStatusIcon(story.status)}</span>
										<span class="status-text">{story.status.toUpperCase()}</span>
									</div>
									
									<div class="story-title-area">
										{#if editingStory === story.id}
											<input 
												class="edit-input"
												bind:value={editTitle}
												on:keydown={(e) => e.key === 'Enter' && saveEdit()}
												on:blur={saveEdit}
												autofocus
											/>
										{:else}
											<h5 class="story-title">{story.title}</h5>
										{/if}
										<small class="story-meta">
											Created {formatTimeAgo(story.createdAt)}
											{#if story.lastModified > story.createdAt}
												• Updated {formatTimeAgo(story.lastModified)}
											{/if}
										</small>
									</div>

									<div class="story-actions">
										<!-- Primary Actions Based on Status -->
										{#if story.status === 'draft'}
											<button 
												class="action-btn activate-btn" 
												on:click={() => handleActivateStory(story.id)}
												disabled={!canActivateStory(story.id)}
												title="Activate Story"
											>
												▶️
											</button>
										{:else if story.status === 'active'}
											<button 
												class="action-btn chat-btn" 
												on:click={() => toggleStoryExpansion(story.id)}
												title="Open Chat"
											>
												💬
											</button>
											<button 
												class="action-btn generate-btn" 
												on:click={() => handleGenerate(story.id)}
												disabled={isGenerating}
												title="Generate Code"
											>
												⚡
											</button>
										{:else if story.status === 'review'}
											<button 
												class="action-btn approve-btn" 
												on:click={() => updateStoryStatus(story.id, 'completed')}
												title="Mark Complete"
											>
												✅
											</button>
											<button 
												class="action-btn chat-btn" 
												on:click={() => toggleStoryExpansion(story.id)}
												title="Continue Discussion"
											>
												💬
											</button>
											<button 
												class="action-btn reactivate-btn" 
												on:click={() => reactivateStory(story.id)}
												disabled={!canReactivateStory(story.id)}
												title="Reactivate for Editing"
											>
												🔄
											</button>
										{:else if story.status === 'completed'}
											<button 
												class="action-btn chat-btn" 
												on:click={() => toggleStoryExpansion(story.id)}
												title="View Chat History"
											>
												💬
											</button>
											<button 
												class="action-btn reactivate-btn" 
												on:click={() => reactivateStory(story.id)}
												disabled={!canReactivateStory(story.id)}
												title="Reactivate for Editing"
											>
												🔄
											</button>
											<button 
												class="action-btn regenerate-btn" 
												on:click={() => handleGenerate(story.id)}
												disabled={isGenerating}
												title="Regenerate Code"
											>
												⚡
											</button>
										{/if}

										<!-- Always Available Actions -->
										<button 
											class="action-btn edit-btn" 
											on:click={() => startEditing(story)}
											title="Edit Title"
										>
											✏️
										</button>
										<button 
											class="action-btn delete-btn" 
											on:click={() => deleteStory(story.id)}
											title="Delete Story"
										>
											🗑️
										</button>
									</div>
								</div>

								<!-- Expandable Chat Section -->
								{#if expandedStories.has(story.id)}
									<div class="story-chat">
										<div class="chat-messages">
											{#each $activeStoryMessages as message (message.id)}
												<div class="message" class:user={message.role === 'user'} class:ai={message.role === 'ai'}>
													<div class="message-header">
														<span class="message-role">{message.role === 'user' ? '👤' : '🤖'}</span>
														<span class="message-time">{formatTimeAgo(message.timestamp)}</span>
													</div>
													<div class="message-content">{message.content}</div>
												</div>
											{/each}
											
											{#if isSendingMessage}
												<div class="message ai">
													<div class="message-header">
														<span class="message-role">🤖</span>
														<span class="message-time">Thinking...</span>
													</div>
													<div class="message-content typing">
														<span class="typing-dots">
															<span>•</span><span>•</span><span>•</span>
														</span>
													</div>
												</div>
											{/if}
										</div>

										<!-- Chat Input -->
										<div class="chat-input-area">
											<input 
												class="chat-input"
												type="text" 
												bind:value={newMessage} 
												placeholder={story.status === 'completed' ? "Continue the conversation..." : "Describe what you need..."}
												disabled={isSendingMessage || story.status !== 'active'}
												on:keydown={(e) => e.key === 'Enter' && sendMessage()}
											/>
											<button 
												class="send-btn" 
												on:click={sendMessage}
												disabled={isSendingMessage || !newMessage.trim() || story.status !== 'active'}
											>
												{#if isSendingMessage}⏳{:else}📤{/if}
											</button>
											
											{#if story.status !== 'active'}
												<small class="chat-hint">
													{#if story.status === 'draft'}
														Activate story to start chatting
													{:else if story.status === 'review' || story.status === 'completed'}
														Reactivate story to continue chatting
													{/if}
												</small>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}

				{#if errorMessage}
					<div class="error-message">
						<span class="error-icon">❌</span>
						<span>{errorMessage}</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.story-panel {
		height: 100%;
		background: #252526;
		color: #cccccc;
		display: flex;
		flex-direction: column;
		font-size: 13px;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 16px;
		background: #2d2d30;
		border-bottom: 1px solid #3e3e42;
	}

	.panel-header h3 {
		margin: 0;
		font-size: 11px;
		font-weight: 600;
		color: #cccccc;
		letter-spacing: 0.5px;
	}

	.story-count {
		background: #0e639c;
		color: white;
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 10px;
		min-width: 18px;
		text-align: center;
	}

	.panel-content {
		flex: 1;
		padding: 8px 0;
		overflow-y: auto;
	}

	.section {
		margin-bottom: 12px;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 16px 4px 16px;
		border-bottom: 1px solid #3e3e42;
	}

	.section-header h4 {
		margin: 0;
		font-size: 11px;
		font-weight: 600;
		color: #cccccc;
		letter-spacing: 0.3px;
	}

	.active-indicator {
		background: #ef4444;
		color: white;
		font-size: 9px;
		padding: 2px 6px;
		border-radius: 8px;
	}

	.inactive-indicator {
		background: #6b7280;
		color: white;
		font-size: 9px;
		padding: 2px 6px;
		border-radius: 8px;
	}

	.section-body {
		padding: 8px 16px;
	}

	.description-input {
		width: 100%;
		background: #1e1e1e;
		border: 1px solid #3e3e42;
		color: #cccccc;
		padding: 6px 8px;
		border-radius: 3px;
		font-size: 11px;
		font-family: inherit;
		resize: vertical;
		min-height: 60px;
	}

	.description-input:focus {
		outline: none;
		border-color: #0e639c;
	}

	.story-input-group {
		display: flex;
		gap: 8px;
	}

	.story-input {
		flex: 1;
		background: #1e1e1e;
		border: 1px solid #3e3e42;
		color: #cccccc;
		padding: 6px 8px;
		border-radius: 3px;
		font-size: 11px;
	}

	.story-input:focus {
		outline: none;
		border-color: #0e639c;
	}

	.add-btn {
		background: #16825d;
		border: none;
		color: white;
		padding: 6px 12px;
		border-radius: 3px;
		cursor: pointer;
		font-size: 10px;
		font-weight: 600;
	}

	.add-btn:hover:not(:disabled) {
		background: #1e9e6e;
	}

	.add-btn:disabled {
		background: #525252;
		cursor: not-allowed;
	}

	.stories-list {
		max-height: 500px;
		overflow-y: auto;
	}

	.story-card {
		background: #1e1e1e;
		border-radius: 6px;
		margin-bottom: 8px;
		overflow: hidden;
		transition: all 0.2s;
	}

	.story-card:hover {
		background: #232324;
	}

	.story-card.expanded {
		background: #1a1a1b;
		border: 1px solid #3e3e42;
	}

	.story-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		border-left: 3px solid #6b7280;
	}

	.story-status {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 50px;
	}

	.status-icon {
		font-size: 12px;
		margin-bottom: 2px;
	}

	.status-text {
		font-size: 8px;
		font-weight: 600;
		letter-spacing: 0.5px;
	}

	.story-title-area {
		flex: 1;
		min-width: 0;
	}

	.story-title {
		margin: 0 0 2px 0;
		font-size: 12px;
		font-weight: 600;
		color: #ffffff;
		line-height: 1.3;
		word-wrap: break-word;
	}

	.story-meta {
		font-size: 9px;
		color: #969696;
		line-height: 1.2;
	}

	.edit-input {
		background: #2d2d30;
		border: 1px solid #0e639c;
		color: #ffffff;
		padding: 4px 6px;
		border-radius: 3px;
		font-size: 12px;
		font-weight: 600;
		width: 100%;
	}

	.story-actions {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}

	.action-btn {
		background: none;
		border: none;
		color: #cccccc;
		cursor: pointer;
		padding: 4px;
		border-radius: 3px;
		font-size: 12px;
		transition: all 0.15s;
	}

	.action-btn:hover {
		background: #37373d;
		transform: scale(1.1);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.activate-btn:hover { color: #22c55e; }
	.chat-btn:hover { color: #60a5fa; }
	.generate-btn:hover { color: #fbbf24; }
	.approve-btn:hover { color: #10b981; }
	.edit-btn:hover { color: #a78bfa; }
	.delete-btn:hover { color: #f87171; }
	.reactivate-btn:hover { color: #fb923c; }
	.regenerate-btn:hover { color: #fbbf24; }

	.story-chat {
		border-top: 1px solid #3e3e42;
		background: #111111;
	}

	.chat-messages {
		max-height: 200px;
		overflow-y: auto;
		padding: 8px;
	}

	.message {
		margin-bottom: 8px;
		padding: 6px 8px;
		border-radius: 6px;
		font-size: 11px;
	}

	.message.user {
		background: #1e40af;
		margin-left: 20px;
	}

	.message.ai {
		background: #374151;
		margin-right: 20px;
	}

	.message-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}

	.message-role {
		font-size: 10px;
	}

	.message-time {
		font-size: 8px;
		color: #9ca3af;
	}

	.message-content {
		line-height: 1.4;
	}

	.typing {
		opacity: 0.7;
	}

	.typing-dots span {
		animation: typing 1.4s infinite;
		font-size: 16px;
	}

	.typing-dots span:nth-child(2) {
		animation-delay: 0.2s;
	}

	.typing-dots span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes typing {
		0%, 60%, 100% { opacity: 0.3; }
		30% { opacity: 1; }
	}

	.chat-input-area {
		display: flex;
		gap: 6px;
		padding: 8px;
		border-top: 1px solid #3e3e42;
		background: #1a1a1b;
	}

	.chat-input {
		flex: 1;
		background: #2d2d30;
		border: 1px solid #3e3e42;
		color: #cccccc;
		padding: 6px 8px;
		border-radius: 3px;
		font-size: 11px;
	}

	.chat-input:focus {
		outline: none;
		border-color: #0e639c;
	}

	.send-btn {
		background: #0e639c;
		border: none;
		color: white;
		padding: 6px 10px;
		border-radius: 3px;
		cursor: pointer;
		font-size: 12px;
	}

	.send-btn:hover:not(:disabled) {
		background: #1177bb;
	}

	.send-btn:disabled {
		background: #525252;
		cursor: not-allowed;
	}

	.chat-hint {
		position: absolute;
		right: 8px;
		bottom: 4px;
		font-size: 9px;
		color: #969696;
		font-style: italic;
	}

	.chat-input-area {
		position: relative;
	}

	.empty-stories {
		text-align: center;
		color: #969696;
		padding: 20px 0;
	}

	.empty-stories p {
		margin: 0 0 4px 0;
		font-size: 12px;
	}

	.empty-stories small {
		font-size: 10px;
		opacity: 0.8;
	}

	.error-message {
		margin-top: 8px;
		padding: 8px;
		background: #5a1e1e;
		border: 1px solid #f48771;
		border-radius: 4px;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px;
	}

	.error-icon {
		flex-shrink: 0;
	}
</style>
