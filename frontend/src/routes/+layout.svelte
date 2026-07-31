<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import SideNav from '$lib/components/SideNav.svelte';
	import DocumentViewer from '$lib/components/documents/DocumentViewer.svelte';
	import { api } from '$lib/api';
	import { documentViewer } from '$lib/stores';
	import { setSidebarContext } from '$lib/state/sidebar.svelte';
	import { setThemeContext } from '$lib/state/theme.svelte';
	import { events } from '$lib/events';

	let { children } = $props();

	setSidebarContext();
	setThemeContext();

	onMount(() => {
		events.connect();
		const splash = document.getElementById('arcivo-splash');
		if (splash) {
			requestAnimationFrame(() => {
				splash.classList.add('opacity-0', 'pointer-events-none');
				window.setTimeout(() => splash.remove(), 250);
			});
		}

		return () => events.disconnect();
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<title>Arcivo</title>
</svelte:head>

<div class="flex h-screen overflow-hidden">
	<SideNav />

	<div class="flex flex-1 flex-col overflow-hidden">
		<AppHeader />
		<main class="flex flex-1 flex-col overflow-hidden">
			<div
				class="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8"
			>
				{@render children()}
			</div>
		</main>
	</div>
</div>

{#if $documentViewer}
	{#key $documentViewer.doc.id}
		<DocumentViewer
			doc={$documentViewer.doc}
			src={api.archiveUrl($documentViewer.doc.id)}
			searchQuery={$documentViewer.searchQuery}
			onClose={() => documentViewer.set(null)}
		/>
	{/key}
{/if}
