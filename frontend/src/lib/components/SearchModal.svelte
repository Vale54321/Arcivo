<script lang="ts">
	import { tick } from 'svelte';
	import { Search, FileText, FileImage, FileSpreadsheet, File } from '@lucide/svelte';
	import { api, ApiError, type Document, type SearchResult } from '$lib/api';
	import { searchQuery } from '$lib/stores';

	// ── Recent docs (localStorage) ────────────────────────────────────────────
	const RECENT_KEY = 'arcivo:recent';
	const RECENT_MAX = 5;

	function loadRecent(): Document[] {
		try {
			return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
		} catch {
			return [];
		}
	}

	function saveRecent(doc: Document) {
		const list = loadRecent().filter((d) => d.id !== doc.id);
		list.unshift(doc);
		localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
		recentDocs = loadRecent();
	}

	let recentDocs: Document[] = loadRecent();

	// ── Helpers ───────────────────────────────────────────────────────────────
	function mimeIcon(mimeType: string) {
		if (mimeType.startsWith('image/'))                            return FileImage;
		if (mimeType.includes('pdf'))                                 return FileText;
		if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileSpreadsheet;
		return File;
	}

	function formatSize(bytes: number): string {
		if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + ' MB';
		return (bytes / 1024).toFixed(0) + ' KB';
	}

	// ── State ────────────────────────────────────────────────────────────────
	let searchOpen = false;
	let searchInput: HTMLInputElement;
	let query = '';
	let results: SearchResult[] = [];
	let loading = false;
	let error = '';

	let debounceTimer: ReturnType<typeof setTimeout>;

	async function handleSearch() {
		const q = query.trim();
		if (!q) { results = []; error = ''; return; }

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			loading = true;
			error = '';
			try {
				results = await api.searchDocuments(q);
			} catch (err) {
				error = err instanceof ApiError ? `Fehler ${err.status}: ${err.message}` : 'Unbekannter Fehler';
				results = [];
			} finally {
				loading = false;
			}
		}, 300);
	}

	function openDoc(doc: Document) {
		saveRecent(doc);
		window.open(api.archiveUrl(doc.id), '_blank');
		close();
	}

	export async function open() {
		searchOpen = true;
		recentDocs = loadRecent();
		await tick();
		searchInput?.focus();
	}

	function close() {
		searchOpen = false;
		query = '';
		results = [];
		error = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			open();
		}
		if (e.key === 'Escape') {
			close();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if searchOpen}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm cursor-default"
		onclick={close}
		aria-label="Close search"
	></button>

	<!-- Dialog -->
	<div class="fixed left-1/2 top-1/4 z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-red-300 dark:border-red-900 bg-white dark:bg-neutral-900 shadow-2xl">

		<!-- Input row -->
		<div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
			<Search size={16} class="shrink-0 text-neutral-400" />
			<input
				bind:this={searchInput}
				bind:value={query}
			onkeydown={(e) => {
				if (e.key === 'Enter' && query.trim()) {
					searchQuery.set(query.trim());
					close();
				}
			}}
			oninput={handleSearch}
				type="text"
				placeholder="Dokument suchen..."
				class="flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none"
			/>
			{#if loading}
				<span class="shrink-0 text-xs text-neutral-400 animate-pulse">...</span>
			{/if}
			<kbd class="hidden sm:inline-flex items-center rounded border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-xs text-neutral-400 font-mono">
				Esc
			</kbd>
		</div>

		<!-- Results -->
		{#if query.trim() === ''}
			{#if recentDocs.length > 0}
			<div class="py-2">
				<p class="px-4 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-neutral-400">Zuletzt geöffnet</p>
				<ul>
					{#each recentDocs as doc (doc.id)}
						<li>
							<button
								onclick={() => openDoc(doc)}
								class="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
							>
								<span class="shrink-0 text-neutral-400">
									<svelte:component this={mimeIcon(doc.mimeType)} size={16} />
								</span>
								<span class="flex-1 truncate text-sm text-neutral-800 dark:text-neutral-100">{doc.name}</span>
								<span class="shrink-0 text-xs text-neutral-400">{formatSize(doc.size)}</span>
							</button>
						</li>
					{/each}
				</ul>
			</div>
			{:else}
				<div class="px-4 py-8 text-center text-sm text-neutral-400">Tippe um Dokumente zu durchsuchen…</div>
			{/if}
		{:else if error}
			<div class="px-4 py-8 text-center text-sm text-red-500 dark:text-red-400">{error}</div>
		{:else if results.length === 0}
			<div class="px-4 py-8 text-center text-sm text-neutral-400">
				Keine Ergebnisse für „{query}"
			</div>
		{:else}
			<ul class="max-h-72 overflow-y-auto py-2">
				{#each results as doc (doc.id)}
					<li>
						<button
							onclick={() => openDoc(doc)}
							class="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
						>
							<span class="shrink-0 text-neutral-400">
								<svelte:component this={mimeIcon(doc.mimeType)} size={16} />
							</span>
							<span class="flex-1 truncate text-sm text-neutral-800 dark:text-neutral-100">{doc.name}</span>
							{#if doc.matchType === 'content'}
								<span class="shrink-0 text-xs px-1.5 py-0.5 rounded font-mono bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">Inhalt</span>
							{/if}
							<span class="shrink-0 text-xs text-neutral-400">{formatSize(doc.size)}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}

	</div>
{/if}
