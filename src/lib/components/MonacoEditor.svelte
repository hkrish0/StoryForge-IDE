<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let value = '';
	export let language = 'javascript';
	export let readOnly = false;
	export let onChange = null;

	let containerEl;
	let editor;
	let monacoLoaded = false;

	function loadMonacoFromCDN() {
		return new Promise((resolve, reject) => {
			// Check if Monaco is already loaded
			if (window.monaco) {
				resolve(window.monaco);
				return;
			}

			// Load Monaco Editor from CDN
			const script = document.createElement('script');
			script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
			script.onload = () => {
				window.require.config({ 
					paths: { 
						'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' 
					} 
				});
				
				window.require(['vs/editor/editor.main'], () => {
					resolve(window.monaco);
				});
			};
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	onMount(async () => {
		if (browser && containerEl) {
			console.log('Monaco Editor: Starting CDN initialization...');
			try {
				const monaco = await loadMonacoFromCDN();
				console.log('Monaco Editor: Loaded from CDN successfully', monaco);

				// Configure Monaco Editor theme
				monaco.editor.defineTheme('vs-dark-custom', {
					base: 'vs-dark',
					inherit: true,
					rules: [],
					colors: {
						'editor.background': '#1e1e1e'
					}
				});

				// Create the editor
				editor = monaco.editor.create(containerEl, {
					value: value,
					language: language,
					theme: 'vs-dark-custom',
					readOnly: readOnly,
					automaticLayout: true,
					minimap: { enabled: false },
					fontSize: 14,
					lineNumbers: 'on',
					roundedSelection: false,
					scrollBeyondLastLine: false,
					wordWrap: 'on'
				});

				console.log('Monaco Editor: Created successfully');
				monacoLoaded = true;

				// Listen for content changes
				editor.onDidChangeModelContent(() => {
					const newValue = editor.getValue();
					value = newValue;
					if (onChange) {
						onChange(newValue);
					}
				});

			} catch (error) {
				console.error('Failed to load Monaco Editor from CDN:', error);
				monacoLoaded = false;
			}
		}
	});

	onDestroy(() => {
		if (editor) {
			editor.dispose();
		}
	});

	// Update editor when value changes externally
	$: if (editor && monacoLoaded && value !== editor.getValue()) {
		editor.setValue(value);
	}

	// Update language when it changes
	$: if (editor && monacoLoaded && window.monaco) {
		const model = editor.getModel();
		if (model) {
			window.monaco.editor.setModelLanguage(model, language);
		}
	}
</script>

<div bind:this={containerEl} class="monaco-editor-container">
	{#if !monacoLoaded}
		<div class="loading-fallback">
			<p>Loading Monaco Editor...</p>
			<textarea 
				bind:value={value} 
				on:input={(e) => onChange && onChange(e.target.value)}
				class="fallback-textarea"
				placeholder="Monaco Editor is loading from CDN..."
			></textarea>
		</div>
	{/if}
</div>

<style>
	.monaco-editor-container {
		width: 100%;
		height: 100%;
		min-height: 400px;
	}

	.loading-fallback {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.loading-fallback p {
		margin: 10px;
		color: #666;
		font-style: italic;
	}

	.fallback-textarea {
		flex: 1;
		width: 100%;
		min-height: 350px;
		font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
		font-size: 14px;
		line-height: 1.5;
		padding: 10px;
		border: 1px solid #ccc;
		resize: none;
	}
</style>