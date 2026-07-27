<script lang="ts">
	import { Archive, Download, Info, Trash2 } from '@lucide/svelte';
	import type { Document } from '$lib/api';
	import ContextMenu from '$lib/components/ui/ContextMenu.svelte';
	import type { MenuItem } from '$lib/components/ui/menu';

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

	let items = $derived.by<MenuItem[]>(() => {
		if (!state) return [];
		const doc = state.doc;
		return [
			{ label: 'Archiv öffnen', icon: Archive, onSelect: () => onOpenArchive(doc) },
			{ label: 'Herunterladen', icon: Download, onSelect: () => onDownloadOriginal(doc) },
			{ label: 'Information', icon: Info, onSelect: () => onOpenInfo(doc) },
			{
				label: 'Löschen',
				icon: Trash2,
				danger: true,
				separated: true,
				onSelect: () => onDelete(doc)
			}
		];
	});
</script>

<ContextMenu
	position={state ? { x: state.x, y: state.y } : null}
	heading={state?.doc.name}
	{items}
	{onClose}
/>
