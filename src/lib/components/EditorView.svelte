<script>
	import { activeFile } from '$lib/stores.js';
	import { writeFile } from '$lib/api.js';
	import MonacoEditor from './MonacoEditor.svelte';

	// Determine language based on file extension
	function getLanguageFromExtension(filePath) {
		if (!filePath) return 'javascript';
		
		const extension = filePath.split('.').pop()?.toLowerCase();
		
		switch (extension) {
			case 'js':
			case 'mjs':
				return 'javascript';
			case 'ts':
				return 'typescript';
			case 'json':
				return 'json';
			case 'html':
				return 'html';
			case 'css':
				return 'css';
			case 'md':
				return 'markdown';
			case 'py':
				return 'python';
			case 'rs':
				return 'rust';
			case 'toml':
				return 'toml';
			case 'yaml':
			case 'yml':
				return 'yaml';
			default:
				return 'plaintext';
		}
	}

	async function saveFile() {
		if ($activeFile) {
			try {
				await writeFile($activeFile.path, $activeFile.content);
				alert('File saved!');
			} catch (error) {
				console.error(error);
				alert(`Error: ${error}`);
			}
		}
	}

	function handleEditorChange(newContent) {
		if ($activeFile) {
			$activeFile.content = newContent;
		}
	}

</script>

<div class="editor-container">
	{#if $activeFile}
		<div class="editor-header">
			<h3>{$activeFile.path}</h3>
			<button on:click={saveFile} class="save-btn">Save File</button>
		</div>
		<div class="editor-wrapper">
			<MonacoEditor
				value={$activeFile.content}
				language={getLanguageFromExtension($activeFile.path)}
				onChange={handleEditorChange}
			/>
		</div>
	{:else}
		<div class="no-file">
			<p>Select a file to edit.</p>
		</div>
	{/if}
</div>

<style>
	.editor-container {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px;
		border-bottom: 1px solid #ccc;
		background-color: #f5f5f5;
	}

	.editor-header h3 {
		margin: 0;
		font-size: 14px;
		color: #333;
	}

	.save-btn {
		padding: 6px 12px;
		background-color: #007acc;
		color: white;
		border: none;
		border-radius: 3px;
		cursor: pointer;
		font-size: 12px;
	}

	.save-btn:hover {
		background-color: #005a9e;
	}

	.editor-wrapper {
		flex: 1;
		overflow: hidden;
	}

	.no-file {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #666;
	}
</style>
