<script lang="ts">
	import { LayoutGrid, LayoutList } from '@lucide/svelte';
	import { Header } from '@arcivo/ui-components';

	type ViewMode = 'list' | 'grid';

	let {
		activeSearch,
		documentCount,
		resultCount,
		viewMode,
		onSetViewMode
	}: {
		activeSearch: string;
		documentCount: number;
		resultCount: number;
		viewMode: ViewMode;
		onSetViewMode: (mode: ViewMode) => void;
	} = $props();
</script>

<div class="mb-8 flex items-center justify-between">
	<Header
		level={1}
		title="Dokumente"
		description={activeSearch
			? `${resultCount} Ergebnis${resultCount !== 1 ? 'se' : ''} für „${activeSearch}"`
			: `${documentCount} Dokument${documentCount !== 1 ? 'e' : ''} gespeichert`}
		class="!mb-0"
	/>
	<div
		class="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900"
	>
		<button
			onclick={() => onSetViewMode('list')}
			title="Listenansicht"
			class="flex items-center justify-center rounded-md p-1.5 transition-colors
				{viewMode === 'list'
				? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
				: 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}"
		>
			<LayoutList size={16} />
		</button>
		<button
			onclick={() => onSetViewMode('grid')}
			title="Gitteransicht"
			class="flex items-center justify-center rounded-md p-1.5 transition-colors
				{viewMode === 'grid'
				? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
				: 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}"
		>
			<LayoutGrid size={16} />
		</button>
	</div>
</div>
