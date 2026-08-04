<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
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
	import { accessToken } from '$lib/auth';
	import { clearCurrentUser, setCurrentUser } from '$lib/state/current-user';

	let { children } = $props();

	setSidebarContext();
	setThemeContext();
	const isLoginRoute = $derived(page.url.pathname === '/login/');
	const isScrollablePage = $derived(page.url.pathname.startsWith('/account'));

	$effect(() => {
		if (!$accessToken) {
			clearCurrentUser();
			return;
		}

		void api.getCurrentUser().then(setCurrentUser).catch(clearCurrentUser);
	});

	$effect(() => {
		if (!$accessToken && !isLoginRoute) {
			void goto(resolve('/login'), { replaceState: true });
		}
		if ($accessToken && isLoginRoute) {
			void goto(resolve('/'), { replaceState: true });
		}
	});

	$effect(() => {
		if (!$accessToken || isLoginRoute) return;
		events.connect();
		return () => events.disconnect();
	});

	function closeDocumentViewer() {
		documentViewer.set(null);
		if (page.url.pathname.startsWith('/documents/')) {
			void goto(resolve('/documents/'), { replaceState: true });
		}
	}

	onMount(() => {
		const splash = document.getElementById('arcivo-splash');
		if (splash) {
			requestAnimationFrame(() => {
				splash.classList.add('opacity-0', 'pointer-events-none');
				window.setTimeout(() => splash.remove(), 250);
			});
		}
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<title>Arcivo</title>
</svelte:head>

{#if isLoginRoute}
	{@render children()}
{:else}
	<div class="flex h-screen overflow-hidden">
		<SideNav />

		<div class="flex flex-1 flex-col overflow-hidden">
			<AppHeader />
			<main class="flex flex-1 flex-col overflow-hidden">
				<div
					class="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8 {isScrollablePage
						? 'overflow-y-auto'
						: 'overflow-hidden'}"
				>
					{@render children()}
				</div>
			</main>
		</div>
	</div>
{/if}

{#if $documentViewer}
	{#key $documentViewer.doc.id}
		<DocumentViewer
			doc={$documentViewer.doc}
			src={api.archiveUrl($documentViewer.doc.id)}
			searchQuery={$documentViewer.searchQuery}
			onClose={closeDocumentViewer}
		/>
	{/key}
{/if}
