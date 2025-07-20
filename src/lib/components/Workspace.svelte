<script>
	import FileTreeView from './FileTreeView.svelte';
	import EditorView from './EditorView.svelte';
	import BacklogView from './BacklogView.svelte';
	import { project, setProject } from '$lib/stores.js';

	async function closeProject() {
		setProject(null);
	}

	async function openProject() {
		try {
			const { open } = await import('@tauri-apps/api/dialog');
			const selected = await open({
				directory: true,
				multiple: false,
				title: 'Open Existing Project'
			});
			
			if (selected && !Array.isArray(selected)) {
				const { loadProject } = await import('$lib/api.js');
				const projectData = await loadProject(selected);
				setProject(projectData);
			}
		} catch (error) {
			console.error('Error opening project:', error);
		}
	}
</script>

<div class="workspace">
	<div class="project-header">
		<div class="project-info">
			<h3>📁 {$project?.path ? $project.path.split('/').pop() : 'Project'}</h3>
			<span class="project-path">{$project?.path || ''}</span>
		</div>
		<div class="project-actions">
			<button class="header-btn" on:click={openProject} title="Open Project">
				📂 Open
			</button>
			<button class="header-btn new-project" on:click={closeProject} title="New Project">
				➕ New
			</button>
			<button class="header-btn close-project" on:click={closeProject} title="Close Project">
				✖️ Close
			</button>
		</div>
	</div>

	<div class="workspace-content">
		<div class="sidebar-left">
			<FileTreeView />
		</div>
		<div class="main-content">
			<EditorView />
		</div>
		<div class="sidebar-right">
			<BacklogView />
		</div>
	</div>
</div>

<style>
	.workspace {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #1e1e1e;
		color: #d4d4d4;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	.project-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 16px;
		background: #2d2d30;
		border-bottom: 1px solid #3e3e42;
		min-height: 40px;
	}

	.project-info h3 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: #cccccc;
	}

	.project-path {
		font-size: 11px;
		color: #969696;
		margin-left: 8px;
	}

	.project-actions {
		display: flex;
		gap: 8px;
	}

	.header-btn {
		padding: 4px 12px;
		background: #0e639c;
		color: white;
		border: none;
		border-radius: 3px;
		font-size: 12px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.header-btn:hover {
		background: #1177bb;
	}

	.header-btn.new-project {
		background: #16825d;
	}

	.header-btn.new-project:hover {
		background: #1e9e6e;
	}

	.header-btn.close-project {
		background: #a1260d;
	}

	.header-btn.close-project:hover {
		background: #c42e0f;
	}

	.workspace-content {
		display: flex;
		flex: 1;
		height: calc(100vh - 40px);
	}

	.sidebar-left {
		width: 280px;
		background: #252526;
		border-right: 1px solid #3e3e42;
		overflow-y: auto;
	}

	.main-content {
		flex: 1;
		background: #1e1e1e;
		overflow: hidden;
	}

	.sidebar-right {
		width: 320px;
		background: #252526;
		border-left: 1px solid #3e3e42;
		overflow-y: auto;
	}
</style>
