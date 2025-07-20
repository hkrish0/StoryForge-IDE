import { invoke } from '@tauri-apps/api/tauri';
import { browser } from '$app/environment';

async function safeInvoke(command, args) {
	if (browser) {
		return await invoke(command, args);
	}
	console.log(`Tauri invoke '${command}' called on server. Skipping.`);
	return Promise.resolve();
}

export async function initializeProject(path, config = null) {
	return await safeInvoke('initialize_project', { path, config });
}

export async function loadProject(path) {
	return await safeInvoke('load_project', { path });
}

export async function readFile(path) {
	return await safeInvoke('read_file', { path });
}

export async function writeFile(path, content) {
	return await safeInvoke('write_file', { path, content });
}

export async function generateCode(projectDescription, userStories) {
	return await safeInvoke('generate_code', { projectDescription, userStories });
}
