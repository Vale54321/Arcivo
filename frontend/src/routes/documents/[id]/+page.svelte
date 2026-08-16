<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { documentViewer } from '$lib/stores';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	let loading = $state(true);
	let openedDocumentId = $state<string | null>(null);

	onMount(() => {
		const documentId = page.params.id;
		let active = true;

		if (!documentId) {
			void goto(resolve('/documents/'), { replaceState: true });
			return;
		}

		void api
			.getDocument(documentId)
			.then((doc) => {
				if (active) {
					openedDocumentId = doc.id;
					documentViewer.update((request) => ({
						doc,
						searchQuery: request?.doc.id === doc.id ? request.searchQuery : undefined
					}));
				}
			})
			.catch(() => {
				if (active) void goto(resolve('/documents/'), { replaceState: true });
			})
			.finally(() => {
				if (active) loading = false;
			});

		return () => {
			active = false;
			documentViewer.update((request) => (request?.doc.id === openedDocumentId ? null : request));
		};
	});
</script>

{#if loading}
	<div class="flex flex-1 items-center justify-center text-neutral-500 dark:text-neutral-400">
		<Spinner size={20} />
	</div>
{/if}
