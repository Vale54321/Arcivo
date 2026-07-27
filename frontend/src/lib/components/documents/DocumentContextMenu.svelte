<script lang="ts">
	import { Archive, Download, Info, Trash2 } from '@lucide/svelte';
	import type { Document } from '$lib/api';

	type ContextState = { x: number; y: number; doc: Document };

	let {
		state,
		onClose,
		onOpenArchive,
		onDownloadOriginal,
		onOpenInfo,
		onDelete
	}: {
		state: ContextState | null;
		onClose: () => void;
		onOpenArchive: (doc: Document) => void;
		onDownloadOriginal: (doc: Document) => void;
		onOpenInfo: (doc: Document) => void;
		onDelete: (doc: Document) => void;
	} = $props();
</script>

{#if state}
	<div class="fixed inset-0 z-40" role="presentation" onclick={onClose} oncontextmenu={(e) => { e.preventDefault(); onClose(); }}></div>
	<div
		class="fixed z-50 min-w-44 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-1 text-sm overflow-hidden"
		style="left:{state.x}px; top:{state.y}px"
	>
		<div class="px-3 py-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500 truncate max-w-48">{state.doc.name}</div>
		<div class="my-1 border-t border-neutral-100 dark:border-neutral-800"></div>
		<button
			onclick={() => { onOpenArchive(state.doc); onClose(); }}
			class="flex w-full items-center gap-2.5 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
		>
			<Archive size={14} class="text-neutral-400 shrink-0" /> Archiv öffnen
		</button>
		<button
			onclick={() => { onDownloadOriginal(state.doc); onClose(); }}
			class="flex w-full items-center gap-2.5 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
		>
			<Download size={14} class="text-neutral-400 shrink-0" /> Herunterladen
		</button>
		<button
			onclick={() => { onOpenInfo(state.doc); onClose(); }}
			class="flex w-full items-center gap-2.5 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
		>
			<Info size={14} class="text-neutral-400 shrink-0" /> Information
		</button>
		<div class="my-1 border-t border-neutral-100 dark:border-neutral-800"></div>
		<button
			onclick={() => { onDelete(state.doc); onClose(); }}
			class="flex w-full items-center gap-2.5 px-3 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
		>
			<Trash2 size={14} class="shrink-0" /> Löschen
		</button>
	</div>
{/if}
