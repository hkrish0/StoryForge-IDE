<script>
	import { project, setActiveFile, activeFile } from '$lib/stores.js';
	import { readFile } from '$lib/api.js';

	async function openFile(path) {
		try {
			const content = await readFile(path);
			setActiveFile({ path, content });
		} catch (error) {
			console.error(error);
			alert(`Error: ${error}`);
		}
	}

	function getFileIcon(fileName) {
		const ext = fileName.split('.').pop()?.toLowerCase();
		switch (ext) {
			case 'js': return '🟨';
			case 'ts': return '🔷';
			case 'json': return '📄';
			case 'html': return '🌐';
			case 'css': return '🎨';
			case 'md': return '📝';
			case 'py': return '🐍';
			case 'rs': return '🦀';
			case 'env': return '⚙️';
			default: return '📄';
		}
	}
</script>

<div class="file-explorer">
	<div class="explorer-header">
		<h3>🗂️ EXPLORER</h3>
		<button class="collapse-btn" title="Refresh Files">↻</button>
	</div>
	
	<div class="project-section">
		{#if $project}
			<div class="project-title">
				<span class="folder-icon">📁</span>
				{$project.path ? $project.path.split('/').pop().toUpperCase() : 'PROJECT'}
			</div>
			
			<div class="file-list">
				{#if $project.files && $project.files.length > 0}
					{#each $project.files as file}
						<div 
							class="file-item" 
							class:active={$activeFile && $activeFile.path === file.path}
							on:click={() => openFile(file.path)}
							on:keydown={(e) => e.key === 'Enter' && openFile(file.path)}
							role="button"
							tabindex="0"
						>
							<span class="file-icon">{getFileIcon(file.name)}</span>
							<span class="file-name">{file.name}</span>
						</div>
					{/each}
				{:else}
					<div class="no-files">No files found</div>
				{/if}
			</div>
		{:else}
			<div class="no-project">
				<p>No project loaded</p>
				<small>Create or open a project to see files</small>
			</div>
		{/if}
	</div>
</div>

<style>
	.file-explorer {
		height: 100%;
		background: #252526;
		color: #cccccc;
		font-size: 13px;
	}

	.explorer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 16px;
		background: #2d2d30;
		border-bottom: 1px solid #3e3e42;
	}

	.explorer-header h3 {
		margin: 0;
		font-size: 11px;
		font-weight: 600;
		color: #cccccc;
		letter-spacing: 0.5px;
	}

	.collapse-btn {
		background: none;
		border: none;
		color: #cccccc;
		cursor: pointer;
		padding: 4px;
		border-radius: 3px;
		font-size: 12px;
	}

	.collapse-btn:hover {
		background: #37373d;
	}

	.project-section {
		padding: 8px 0;
	}

	.project-title {
		padding: 4px 16px;
		font-size: 12px;
		font-weight: 600;
		color: #cccccc;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.folder-icon {
		font-size: 14px;
	}

	.file-list {
		margin-top: 4px;
	}

	.file-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 16px 4px 24px;
		cursor: pointer;
		transition: background-color 0.1s;
		border-left: 3px solid transparent;
	}

	.file-item:hover {
		background: #2a2d2e;
	}

	.file-item.active {
		background: #37373d;
		border-left-color: #0e639c;
		color: #ffffff;
	}

	.file-icon {
		font-size: 14px;
		width: 16px;
		text-align: center;
	}

	.file-name {
		font-size: 13px;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.no-files {
		padding: 16px;
		color: #969696;
		font-style: italic;
		text-align: center;
	}

	.no-project {
		padding: 16px;
		text-align: center;
		color: #969696;
	}

	.no-project p {
		margin: 0 0 4px 0;
		font-size: 13px;
	}

	.no-project small {
		font-size: 11px;
		opacity: 0.8;
	}
</style>
