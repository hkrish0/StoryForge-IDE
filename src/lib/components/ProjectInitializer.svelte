<script>
	import { onMount } from 'svelte';
	import { setProject } from '$lib/stores.js';

	let projectPath = '';
	let projectName = '';
	let projectDescription = '';
	let api;
	let isLoading = false;
	let errorMessage = '';
	let showAdvanced = false;

	// Package selection
	let selectedPackages = {
		express: true,
		cors: false,
		helmet: false,
		morgan: false,
		dotenv: false,
		jsonwebtoken: false,
		bcrypt: false,
		mongoose: false,
		sequelize: false,
		joi: false,
		nodemailer: false
	};

	let packageDescriptions = {
		express: 'Fast web framework for Node.js',
		cors: 'Enable Cross-Origin Resource Sharing',
		helmet: 'Security middleware for Express',
		morgan: 'HTTP request logger middleware',
		dotenv: 'Load environment variables from .env file',
		jsonwebtoken: 'JSON Web Token implementation',
		bcrypt: 'Password hashing library',
		mongoose: 'MongoDB object modeling',
		sequelize: 'SQL ORM for Node.js',
		joi: 'Data validation library',
		nodemailer: 'Send emails from Node.js'
	};

	onMount(async () => {
		const clientApi = await import('$lib/api.js');
		api = clientApi;
	});

	async function selectFolder() {
		try {
			const { open } = await import('@tauri-apps/api/dialog');
			const selected = await open({
				directory: true,
				multiple: false,
				title: 'Select Project Directory'
			});
			
			if (selected && !Array.isArray(selected)) {
				// Set the selected folder path, but user will need to add project name
				projectPath = selected;
			}
		} catch (error) {
			console.error('Error selecting folder:', error);
		}
	}

	async function selectProjectFolder() {
		try {
			const { open } = await import('@tauri-apps/api/dialog');
			const selected = await open({
				directory: true,
				multiple: false,
				title: 'Select Parent Directory for New Project'
			});
			
			if (selected && !Array.isArray(selected)) {
				// Store the parent directory, project folder will be created inside it
				projectPath = selected;
			}
		} catch (error) {
			console.error('Error selecting folder:', error);
		}
	}

	async function createProject() {
		if (!api || !projectName.trim()) return;
		
		// Build the full project path
		let fullProjectPath;
		if (projectPath && projectName) {
			// If user selected a parent directory, combine it with project name
			fullProjectPath = `${projectPath}/${projectName.replace(/\s+/g, '-').toLowerCase()}`;
		} else if (projectPath) {
			// Use the full path as-is
			fullProjectPath = projectPath;
		} else {
			errorMessage = 'Please select a location for your project';
			return;
		}

		isLoading = true;
		errorMessage = '';
		try {
			const selectedPackagesList = Object.keys(selectedPackages).filter(pkg => selectedPackages[pkg]);
			
			await api.initializeProject(fullProjectPath, {
				name: projectName || 'new-project',
				description: projectDescription,
				packages: selectedPackagesList
			});
			
			const projectData = await api.loadProject(fullProjectPath);
			setProject(projectData);
		} catch (error) {
			errorMessage = error;
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	async function openProject() {
		if (!api || !projectPath.trim()) return;
		isLoading = true;
		errorMessage = '';
		try {
			const projectData = await api.loadProject(projectPath);
			setProject(projectData);
		} catch (error) {
			errorMessage = error;
			console.error(error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="project-wizard">
	<h2>Project Wizard</h2>
	
	<div class="tabs">
		<button class="tab active">Create New Project</button>
		<button class="tab" on:click={selectFolder} disabled={!api || isLoading}>Open Existing Project</button>
	</div>

	<div class="wizard-content">
		<div class="form-group">
			<label for="projectName">Project Name *</label>
			<input 
				id="projectName"
				type="text" 
				bind:value={projectName} 
				placeholder="my-awesome-app" 
				disabled={isLoading}
				required
			/>
		</div>

		<div class="form-group">
			<label for="projectPath">Project Location *</label>
			<div class="path-input-group">
				<input 
					id="projectPath"
					type="text" 
					bind:value={projectPath} 
					placeholder="Select parent directory for your project" 
					disabled={isLoading} 
					required
				/>
				<button 
					type="button" 
					class="browse-btn" 
					on:click={selectProjectFolder}
					disabled={isLoading}
				>
					Browse...
				</button>
			</div>
			<small class="help-text">
				{#if projectName}
					Project will be created at: <code>{projectPath || '[parent-directory]'}/{projectName}</code>
				{:else}
					Enter a project name to see the full path
				{/if}
			</small>
		</div>

		<div class="form-group">
			<label for="projectDescription">Description</label>
			<textarea 
				id="projectDescription"
				bind:value={projectDescription} 
				placeholder="A brief description of your project..." 
				disabled={isLoading}
				rows="3"
			></textarea>
		</div>

		<div class="form-group">
			<div class="advanced-toggle">
				<label>
					<input type="checkbox" bind:checked={showAdvanced} />
					Advanced Package Selection
				</label>
			</div>
		</div>

		{#if showAdvanced}
			<div class="packages-section">
				<h3>Select Packages</h3>
				<div class="packages-grid">
					{#each Object.keys(selectedPackages) as packageName}
						<div class="package-item">
							<label class="package-label">
								<input 
									type="checkbox" 
									bind:checked={selectedPackages[packageName]}
									disabled={packageName === 'express' || isLoading}
								/>
								<div class="package-info">
									<span class="package-name">{packageName}</span>
									<span class="package-desc">{packageDescriptions[packageName]}</span>
								</div>
							</label>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="actions">
			<button 
				class="create-btn" 
				on:click={createProject} 
				disabled={!api || isLoading || !projectName.trim()}
			>
				{#if isLoading}
					<span class="spinner"></span>
					Creating Project...
				{:else}
					Create Project
				{/if}
			</button>
		</div>

		{#if errorMessage}
			<div class="error-message">
				<strong>Error:</strong> {errorMessage}
			</div>
		{/if}
	</div>
</div>

<style>
	.project-wizard {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.project-wizard h2 {
		text-align: center;
		color: #2c3e50;
		margin-bottom: 2rem;
	}

	.tabs {
		display: flex;
		margin-bottom: 2rem;
		border-bottom: 1px solid #dee2e6;
	}

	.tab {
		padding: 0.75rem 1.5rem;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 0.9rem;
		color: #6c757d;
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
	}

	.tab:hover {
		color: #495057;
	}

	.tab.active {
		color: #007acc;
		border-bottom-color: #007acc;
	}

	.wizard-content {
		background: #f8f9fa;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #495057;
	}

	.form-group input, .form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ced4da;
		border-radius: 4px;
		font-size: 0.9rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus, .form-group textarea:focus {
		outline: none;
		border-color: #007acc;
		box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.25);
	}

	.path-input-group {
		display: flex;
		gap: 0.5rem;
		align-items: stretch;
	}

	.path-input-group input {
		flex: 1;
	}

	.browse-btn {
		padding: 0.75rem 1rem;
		background: #6c757d;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		white-space: nowrap;
		transition: background-color 0.2s;
	}

	.browse-btn:hover:not(:disabled) {
		background: #5a6268;
	}

	.browse-btn:disabled {
		background: #adb5bd;
		cursor: not-allowed;
	}

	.help-text {
		display: block;
		margin-top: 0.5rem;
		font-size: 0.8rem;
		color: #6c757d;
		line-height: 1.3;
	}

	.help-text code {
		background: #e9ecef;
		padding: 0.125rem 0.25rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Consolas', monospace;
		font-size: 0.75rem;
	}

	.advanced-toggle label {
		display: flex;
		align-items: center;
		font-weight: normal;
		cursor: pointer;
	}

	.advanced-toggle input[type="checkbox"] {
		width: auto;
		margin-right: 0.5rem;
	}

	.packages-section {
		margin-top: 1.5rem;
		padding: 1.5rem;
		background: white;
		border-radius: 6px;
		border: 1px solid #dee2e6;
	}

	.packages-section h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #495057;
	}

	.packages-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
	}

	.package-item {
		border: 1px solid #dee2e6;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.package-item:hover {
		border-color: #007acc;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.package-label {
		display: flex;
		align-items: flex-start;
		padding: 1rem;
		cursor: pointer;
		margin: 0;
	}

	.package-label input[type="checkbox"] {
		width: auto;
		margin-right: 0.75rem;
		margin-top: 0.25rem;
	}

	.package-info {
		flex: 1;
	}

	.package-name {
		display: block;
		font-weight: 600;
		color: #495057;
		margin-bottom: 0.25rem;
	}

	.package-desc {
		display: block;
		font-size: 0.85rem;
		color: #6c757d;
		line-height: 1.4;
	}

	.actions {
		margin-top: 2rem;
		text-align: center;
	}

	.create-btn {
		background: #007acc;
		color: white;
		border: none;
		padding: 0.75rem 2rem;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.create-btn:hover:not(:disabled) {
		background: #005a9e;
	}

	.create-btn:disabled {
		background: #6c757d;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.error-message {
		margin-top: 1rem;
		padding: 1rem;
		background: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
		border-radius: 4px;
	}

	/* Legacy error class for compatibility */
	.error {
		color: red;
		margin-top: 10px;
	}
</style>
