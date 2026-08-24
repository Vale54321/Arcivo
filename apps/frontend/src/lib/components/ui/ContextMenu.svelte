<script lang="ts">
	import type { MenuItem, MenuPosition } from './menu';
	import { ActionItem, Overlay } from '@arcivo/ui-components';

	interface Props {
		position: MenuPosition | null;
		items: MenuItem[];
		heading?: string;
		onClose: () => void;
	}

	let { position, items, heading, onClose }: Props = $props();

	const WIDTH = 176;
	const ITEM_HEIGHT = 40;

	let placement = $derived.by(() => {
		if (!position) return null;
		const height = items.length * ITEM_HEIGHT + (heading ? 32 : 0) + 16;
		return {
			left: Math.max(8, Math.min(position.x, window.innerWidth - WIDTH - 8)),
			top: Math.max(8, Math.min(position.y, window.innerHeight - height - 8))
		};
	});

	function select(item: MenuItem) {
		onClose();
		item.onSelect();
	}
</script>

{#if position && placement}
	<Overlay
		open
		{onClose}
		role="menu"
		tabindex={-1}
		ariaLabel={heading ? `Aktionen für ${heading}` : 'Kontextmenü'}
		backdrop="transparent"
		dismissOnContextMenu
		style="left: {placement.left}px; top: {placement.top}px"
		surfaceClass="min-w-44 py-1 text-sm"
	>
		{#if heading}
			<p
				class="max-w-48 truncate px-3 py-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500"
			>
				{heading}
			</p>
			<div class="my-1 border-t border-neutral-100 dark:border-neutral-800"></div>
		{/if}

		{#each items as item (item.label)}
			{#if item.separated}
				<div class="my-1 border-t border-neutral-100 dark:border-neutral-800"></div>
			{/if}
			<ActionItem role="menuitem" onclick={() => select(item)} danger={item.danger}>
				{#snippet leading()}
					<item.icon size={16} />
				{/snippet}
				{item.label}
			</ActionItem>
		{/each}
	</Overlay>
{/if}
