<script lang="ts">
	let {
		activeSearch,
		searchLoading,
		onClear
	}: {
		activeSearch: string;
		searchLoading: boolean;
		onClear: () => void;
	} = $props();
</script>

{#if activeSearch}
	<div class="mb-6 flex items-center gap-3 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-2.5">
		<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-red-500 dark:text-red-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
		<span class="flex-1 text-sm text-neutral-600 dark:text-neutral-300">Gefiltert nach <span class="font-semibold text-neutral-900 dark:text-neutral-100">„{activeSearch}"
			</span></span>
		{#if searchLoading}
			<span class="text-xs text-neutral-400 animate-pulse">Suche…</span>
		{/if}
		<button
			onclick={onClear}
			class="shrink-0 rounded p-1 text-neutral-400 hover:bg-red-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
			aria-label="Filter entfernen"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
		</button>
	</div>
{/if}
