<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { tick } from 'svelte';
	import { Search } from '@lucide/svelte';
	import { api, ApiError, type Document, type SearchResult } from '$lib/api';
	import { documentsResponseSchema } from '@arcivo/api-contracts';
	import { documentViewer, searchQuery } from '$lib/stores';
	import SearchResultItem from '$lib/components/search/SearchResultItem.svelte';

	const RECENT_KEY = 'arcivo:recent';
	const RECENT_MAX = 5;
	const DEBOUNCE_MS = 300;

	let searchOpen = $state(false);
	let searchInput = $state<HTMLInputElement | null>(null);
	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let recentDocs = $state<Document[]>([]);
	let loading = $state(false);
	let error = $state('');
	let highlighted = $state(0);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	let orderedResults = $derived(prioritizeNameMatches(results));
	let visibleDocs = $derived<(Document | SearchResult)[]>(
		query.trim() ? orderedResults : recentDocs
	);

	function prioritizeNameMatches(searchResults: SearchResult[]): SearchResult[] {
		return [...searchResults].sort((left, right) => matchPriority(left) - matchPriority(right));
	}

	function matchPriority(result: SearchResult): number {
		return result.matchType === 'content' ? 1 : 0;
	}

	function loadRecent(): Document[] {
		try {
			return documentsResponseSchema.parse(JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'));
		} catch {
			return [];
		}
	}

	function saveRecent(doc: Document) {
		const documents = loadRecent().filter((entry) => entry.id !== doc.id);
		documents.unshift(doc);
		localStorage.setItem(RECENT_KEY, JSON.stringify(documents.slice(0, RECENT_MAX)));
		recentDocs = loadRecent();
	}

	function onInput() {
		highlighted = 0;
		error = '';
		if (debounceTimer) clearTimeout(debounceTimer);

		const term = query.trim();
		if (!term) {
			results = [];
			loading = false;
			return;
		}

		loading = true;
		debounceTimer = setTimeout(() => void runSearch(term), DEBOUNCE_MS);
	}

	async function runSearch(term: string) {
		try {
			results = await api.searchDocuments(term);
		} catch (cause) {
			if (cause instanceof ApiError && cause.status === 404) {
				results = [];
			} else {
				error =
					cause instanceof ApiError
						? `Fehler ${cause.status}: ${cause.message}`
						: 'Die Suche ist derzeit nicht verfügbar.';
				results = [];
			}
		} finally {
			loading = false;
		}
	}

	function select(doc: Document | SearchResult) {
		saveRecent(doc);
		const term = query.trim();
		const contentMatch =
			'matchType' in doc && (doc.matchType === 'content' || doc.matchType === 'both');
		documentViewer.set({ doc, searchQuery: contentMatch && term ? term : undefined });
		void goto(resolve(`/documents/${encodeURIComponent(doc.id)}/`));
		close();
	}

	function applyFilter() {
		const term = query.trim();
		if (!term) return;
		searchQuery.set(term);
		close();
	}

	export async function open() {
		searchOpen = true;
		query = '';
		results = [];
		error = '';
		highlighted = 0;
		recentDocs = loadRecent();
		await tick();
		searchInput?.focus();
	}

	function close() {
		searchOpen = false;
		if (debounceTimer) clearTimeout(debounceTimer);
	}

	function onKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				highlighted = visibleDocs.length ? (highlighted + 1) % visibleDocs.length : 0;
				break;
			case 'ArrowUp':
				event.preventDefault();
				highlighted = visibleDocs.length
					? (highlighted - 1 + visibleDocs.length) % visibleDocs.length
					: 0;
				break;
			case 'Enter': {
				event.preventDefault();
				const doc = visibleDocs[highlighted];
				if (doc) select(doc);
				else applyFilter();
				break;
			}
			case 'Escape':
				close();
				break;
		}
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			void open();
		}
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#if searchOpen}
	<button
		type="button"
		class="fixed inset-0 z-40 cursor-default bg-black/20 backdrop-blur-sm"
		onclick={close}
		aria-label="Suche schließen"
	></button>

	<div
		class="fixed top-1/4 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-red-300 bg-white shadow-2xl dark:border-red-900 dark:bg-neutral-900"
		role="dialog"
		aria-modal="true"
		aria-label="Dokumente suchen"
	>
		<div
			class="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-700"
		>
			<Search size={16} class="shrink-0 text-neutral-400" />
			<input
				bind:this={searchInput}
				bind:value={query}
				oninput={onInput}
				onkeydown={onKeydown}
				type="text"
				placeholder="Dokument suchen…"
				class="flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
			/>
			{#if loading}
				<span class="shrink-0 animate-pulse text-xs text-neutral-400">…</span>
			{/if}
			<kbd
				class="hidden items-center rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-400 sm:inline-flex dark:border-neutral-600 dark:bg-neutral-800"
			>
				Esc
			</kbd>
		</div>

		{#if query.trim() === ''}
			{#if recentDocs.length > 0}
				<div class="py-2">
					<p class="px-4 pt-2 pb-1 text-xs font-medium tracking-wider text-neutral-400 uppercase">
						Zuletzt geöffnet
					</p>
					<ul>
						{#each recentDocs as doc, index (doc.id)}
							<SearchResultItem {doc} highlighted={index === highlighted} onSelect={select} />
						{/each}
					</ul>
				</div>
			{:else}
				<p class="px-4 py-8 text-center text-sm text-neutral-400">
					Tippe um Dokumente zu durchsuchen…
				</p>
			{/if}
		{:else if error}
			<p class="px-4 py-8 text-center text-sm text-red-500 dark:text-red-400">{error}</p>
		{:else if results.length === 0}
			<p class="px-4 py-8 text-center text-sm text-neutral-400">
				{loading ? 'Suche…' : `Keine Ergebnisse für „${query}"`}
			</p>
		{:else}
			<ul class="max-h-72 overflow-y-auto py-2">
				{#each orderedResults as doc, index (doc.id)}
					<SearchResultItem
						{doc}
						searchTerm={query}
						matchType={doc.matchType}
						highlighted={index === highlighted}
						onSelect={select}
					/>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
