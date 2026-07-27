<script lang="ts">
	import type { MenuItem, MenuPosition } from './menu';

	interface Props {
		position: MenuPosition | null;
		items: MenuItem[];
		heading?: string;
		onClose: () => void;
	}

	let { position, items, heading, onClose }: Props = $props();

	const WIDTH = 176;
	const ITEM_HEIGHT = 38;

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
	<div
		class="fixed inset-0 z-40"
		role="presentation"
		onclick={onClose}
		oncontextmenu={(event) => {
			event.preventDefault();
			onClose();
		}}
	></div>

	<div
		role="menu"
		tabindex="-1"
		style="left: {placement.left}px; top: {placement.top}px; min-width: {WIDTH}px"
		class="fixed z-50 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 text-sm shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
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
			<button
				type="button"
				role="menuitem"
				onclick={() => select(item)}
				class="flex w-full items-center gap-2.5 px-3 py-2 transition-colors {item.danger
					? 'text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
					: 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'}"
			>
				<item.icon size={14} class="shrink-0 {item.danger ? '' : 'text-neutral-400'}" />
				{item.label}
			</button>
		{/each}
	</div>
{/if}
