<script>
	import ProjectInitializer from '$lib/components/ProjectInitializer.svelte';
	import Workspace from '$lib/components/Workspace.svelte';
	import { project, setProject } from '$lib/stores.js';
	import { onMount } from 'svelte';

	onMount(async () => {
		const { listen } = await import('@tauri-apps/api/event');
		const unlisten = await listen('project-loaded', (event) => {
			setProject(event.payload);
		});

		return () => {
			unlisten();
		};
	});
</script>

<main>
	{#if $project}
		<Workspace />
	{:else}
		<ProjectInitializer />
	{/if}
</main>

<style>
	main {
		height: 100vh;
	}
</style>
