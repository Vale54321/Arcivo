<script lang="ts">
	import { ChevronDown, ChevronUp, X } from '@lucide/svelte';
	import { Input } from '@arcivo/ui-components';
	import type { PdfSearchResult } from './pdf-viewer-types';

	let {
		input = $bindable(),
		status,
		results,
		currentIndex,
		onSearch,
		onClose,
		onMove,
		onSelect
	}: {
		input: string;
		status: string;
		results: PdfSearchResult[];
		currentIndex: number;
		onSearch: () => void;
		onClose: () => void;
		onMove: (direction: -1 | 1) => void;
		onSelect: (index: number) => void;
	} = $props();
</script>

<aside
	class="absolute inset-x-2 top-2 z-20 flex max-h-[70vh] flex-col rounded-xl border border-neutral-200 bg-white p-3 shadow-xl sm:static sm:inset-auto sm:max-h-none sm:w-80 sm:shrink-0 sm:rounded-none sm:border-y-0 sm:border-r-0 sm:border-l sm:shadow-none dark:border-neutral-800 dark:bg-neutral-900"
>
	<div class="flex items-center gap-2">
		<Input
			id="arcivo-pdf-search"
			bind:value={input}
			oninput={onSearch}
			onkeydown={(event) => {
				if (event.key === 'Enter') onMove(event.shiftKey ? -1 : 1);
			}}
			variant="search"
			containerClass="flex-1"
			placeholder="Im Dokument suchen"
		/>
		<button
			type="button"
			onclick={onClose}
			aria-label="Suche schließen"
			class="viewer-button compact"
		>
			<X size={16} />
		</button>
	</div>
	<div class="mt-2 flex items-center justify-between gap-2">
		<p class="truncate text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
		<div class="flex shrink-0 items-center gap-0.5">
			<button
				type="button"
				onclick={() => onMove(-1)}
				disabled={!results.length}
				aria-label="Vorheriger Treffer"
				title="Vorheriger Treffer"
				class="viewer-button compact"
			>
				<ChevronUp size={16} />
			</button>
			<button
				type="button"
				onclick={() => onMove(1)}
				disabled={!results.length}
				aria-label="Nächster Treffer"
				title="Nächster Treffer"
				class="viewer-button compact"
			>
				<ChevronDown size={16} />
			</button>
		</div>
	</div>
	{#if results.length}
		<div class="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
			{#each results as result, index (`${result.page}-${result.occurrence}`)}
				<button
					type="button"
					onclick={() => onSelect(index)}
					aria-current={index === currentIndex ? 'true' : undefined}
					class="w-full rounded-lg border px-3 py-2.5 text-left transition-colors {index ===
					currentIndex
						? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40'
						: 'border-transparent hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800'}"
				>
					<span class="mb-1 block text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
						Seite {result.page}
					</span>
					<span class="block text-xs leading-5 text-neutral-700 dark:text-neutral-300">
						{result.before}
						<mark
							class="rounded bg-yellow-200 px-0.5 text-neutral-900 dark:bg-yellow-600 dark:text-black"
						>
							{result.match}
						</mark>
						{result.after}
					</span>
				</button>
			{/each}
		</div>
	{/if}
</aside>
