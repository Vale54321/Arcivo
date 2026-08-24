<script lang="ts">
	import { Archive, Download, Trash2 } from '@lucide/svelte';
	import { ActionItem, Overlay } from '../../../../../../src';

	type Position = { x: number; y: number };

	const MENU_WIDTH = 176;
	const MENU_HEIGHT = 144;

	let position = $state<Position | null>(null);
	let surfaceStyle = $derived(
		position ? `left: ${position.x}px; top: ${position.y}px` : ''
	);

	function openMenu(event: MouseEvent): void {
		event.preventDefault();
		position = {
			x: Math.max(8, Math.min(event.clientX, window.innerWidth - MENU_WIDTH - 8)),
			y: Math.max(8, Math.min(event.clientY, window.innerHeight - MENU_HEIGHT - 8))
		};
	}

	function close(): void {
		position = null;
	}
</script>

<button
	type="button"
	oncontextmenu={openMenu}
	class="w-full max-w-xs rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-left text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
>
	Right-click this document to open its context menu.
</button>

<Overlay
	open={position !== null}
	onClose={close}
	role="menu"
	ariaLabel="Document actions"
	backdrop="transparent"
	dismissOnContextMenu
	style={surfaceStyle}
	surfaceClass="min-w-44 py-1 text-sm"
>
	<ActionItem role="menuitem" onclick={close}>
		{#snippet leading()}
			<Archive size={16} />
		{/snippet}
		Open archive
	</ActionItem>
	<ActionItem role="menuitem" onclick={close}>
		{#snippet leading()}
			<Download size={16} />
		{/snippet}
		Download
	</ActionItem>
	<div class="my-1 border-t border-neutral-100 dark:border-neutral-800"></div>
	<ActionItem role="menuitem" danger onclick={close}>
		{#snippet leading()}
			<Trash2 size={16} />
		{/snippet}
		Delete
	</ActionItem>
</Overlay>
