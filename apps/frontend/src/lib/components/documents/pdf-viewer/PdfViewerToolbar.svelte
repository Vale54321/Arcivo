<script lang="ts">
	import {
		ChevronLeft,
		ChevronRight,
		Maximize2,
		Minus,
		Plus,
		RotateCw,
		Search
	} from '@lucide/svelte';
	import { Input } from '@arcivo/ui-components';

	let {
		pageNumber,
		pageCount,
		zoom,
		fitToWidth,
		fitToHeight,
		searchOpen,
		onSetPage,
		onChangeZoom,
		onResetZoom,
		onFitToWidth,
		onRotate,
		onToggleSearch
	}: {
		pageNumber: number;
		pageCount: number;
		zoom: number;
		fitToWidth: boolean;
		fitToHeight: boolean;
		searchOpen: boolean;
		onSetPage: (page: number) => void;
		onChangeZoom: (delta: number) => void;
		onResetZoom: () => void;
		onFitToWidth: () => void;
		onRotate: () => void;
		onToggleSearch: () => void;
	} = $props();
</script>

<div
	class="flex min-h-12 flex-wrap items-center justify-center gap-1 border-t border-neutral-100 px-2 py-1.5 dark:border-neutral-800/70"
>
	<div class="toolbar-group">
		<button
			type="button"
			onclick={() => onSetPage(pageNumber - 1)}
			disabled={pageNumber <= 1}
			title="Vorherige Seite"
			aria-label="Vorherige Seite"
			class="viewer-button compact"
		>
			<ChevronLeft size={17} />
		</button>
		<label class="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
			<span class="sr-only">Seite</span>
			<Input
				variant="bare"
				containerClass="flex-none"
				type="number"
				min="1"
				max={pageCount || 1}
				value={pageNumber}
				onchange={(event) => onSetPage(Number(event.currentTarget.value))}
				class="h-8 w-12 flex-none rounded-md border-neutral-200 bg-white px-1 text-center text-sm text-neutral-800 focus:border-red-400 focus:ring-red-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
			/>
			<span>/ {pageCount || '–'}</span>
		</label>
		<button
			type="button"
			onclick={() => onSetPage(pageNumber + 1)}
			disabled={pageNumber >= pageCount}
			title="Nächste Seite"
			aria-label="Nächste Seite"
			class="viewer-button compact"
		>
			<ChevronRight size={17} />
		</button>
	</div>

	<div class="toolbar-group">
		<button
			type="button"
			onclick={() => onChangeZoom(-25)}
			title="Verkleinern"
			aria-label="Verkleinern"
			class="viewer-button compact"
		>
			<Minus size={16} />
		</button>
		<button
			type="button"
			onclick={onResetZoom}
			title="Originalgröße"
			class="min-w-12 rounded-md px-1.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
		>
			{fitToHeight ? 'Höhe' : fitToWidth ? 'Breite' : `${zoom}%`}
		</button>
		<button
			type="button"
			onclick={() => onChangeZoom(25)}
			title="Vergrößern"
			aria-label="Vergrößern"
			class="viewer-button compact"
		>
			<Plus size={16} />
		</button>
		<button
			type="button"
			onclick={onFitToWidth}
			title="An Breite anpassen"
			aria-label="An Breite anpassen"
			class:active={fitToWidth}
			class="viewer-button compact"
		>
			<Maximize2 size={15} />
		</button>
		<button
			type="button"
			onclick={onRotate}
			title="Im Uhrzeigersinn drehen"
			aria-label="Im Uhrzeigersinn drehen"
			class="viewer-button compact"
		>
			<RotateCw size={16} />
		</button>
	</div>
	<button
		type="button"
		onclick={onToggleSearch}
		class:active={searchOpen}
		title="PDF durchsuchen (Strg+F)"
		aria-label="PDF durchsuchen"
		class="viewer-button compact ml-1"
	>
		<Search size={17} />
	</button>
</div>
