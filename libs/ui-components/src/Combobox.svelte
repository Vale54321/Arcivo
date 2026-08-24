<script lang="ts">
	import { Check, ChevronsUpDown, X } from '@lucide/svelte';
	import type { ComboboxGroup, ComboboxItem } from './combobox';

	interface Props {
		id?: string;
		groups: ComboboxGroup[];
		value: string | string[] | null;
		onChange: (value: string | string[] | null) => void;
		placeholder?: string;
		/** Shows a filter field above the options. */
		searchable?: boolean;
		searchPlaceholder?: string;
		allowClear?: boolean;
		disabled?: boolean;
		multiple?: boolean;
		maxVisibleItems?: number | null;
		/** Moves selected options to the top of their group while the menu is open. */
		selectedFirst?: boolean;
	}

	let {
		id,
		groups,
		value,
		onChange,
		placeholder = 'Auswählen …',
		searchable = false,
		searchPlaceholder = 'Suchen …',
		allowClear = true,
		disabled = false,
		multiple = false,
		maxVisibleItems = null,
		selectedFirst = false
	}: Props = $props();

	let isOpen = $state(false);
	let query = $state('');
	let container = $state<HTMLDivElement | null>(null);

	const allItems = $derived(groups.flatMap((group) => group.items));
	const selectedIds = $derived(Array.isArray(value) ? value : value ? [value] : []);
	const selectedItems = $derived(allItems.filter((item) => selectedIds.includes(item.id)));
	const selected = $derived(multiple ? null : (selectedItems[0] ?? null));
	const canClear = $derived(allowClear && !disabled && selectedItems.length > 0);
	const selectionLabel = $derived(
		selectedItems.length === 0
			? placeholder
			: selectedItems.length === 1
				? selectedItems[0].label
				: `${selectedItems.length} ausgewählt`
	);
	const normalizedQuery = $derived(query.trim().toLowerCase());
	const matchingGroups = $derived(
		groups
			.map((group) => ({
				heading: group.heading,
				items: group.items.filter((item) => matches(item, normalizedQuery))
			}))
			.filter((group) => group.items.length > 0)
	);
	const filteredGroups = $derived.by(() => {
		let remaining = maxVisibleItems ?? Number.POSITIVE_INFINITY;
		return matchingGroups
			.map((group) => {
				const selectedInGroup =
					selectedFirst && !normalizedQuery
						? group.items.filter((item) => selectedIds.includes(item.id))
						: [];
				const candidates =
					selectedFirst && !normalizedQuery
						? group.items.filter((item) => !selectedIds.includes(item.id))
						: group.items;
				const items = [...selectedInGroup, ...candidates.slice(0, remaining)];
				remaining -= Math.max(items.length - selectedInGroup.length, 0);
				return { heading: group.heading, items };
			})
			.filter((group) => group.items.length > 0);
	});

	function matches(item: ComboboxItem, search: string) {
		return !search || item.label.toLowerCase().includes(search) || item.subtitle?.toLowerCase().includes(search);
	}

	function close() {
		isOpen = false;
		query = '';
	}

	function toggle() {
		if (disabled) return;
		if (isOpen) close();
		else isOpen = true;
	}

	function select(id: string) {
		if (multiple) {
			onChange(selectedIds.includes(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id]);
			return;
		}
		onChange(id);
		close();
	}

	function clear(event: MouseEvent) {
		event.stopPropagation();
		onChange(multiple ? [] : null);
		query = '';
	}

	function onDocumentPointerDown(event: PointerEvent) {
		if (container && event.target instanceof Node && !container.contains(event.target)) close();
	}

	$effect(() => {
		if (!isOpen) return;
		document.addEventListener('pointerdown', onDocumentPointerDown);
		return () => document.removeEventListener('pointerdown', onDocumentPointerDown);
	});
</script>

<div bind:this={container} class="relative">
	<button
		{id}
		type="button"
		disabled={disabled}
		aria-expanded={isOpen}
		aria-haspopup="listbox"
		onclick={toggle}
		onkeydown={(event) => event.key === 'Escape' && close()}
		class="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-left text-sm text-neutral-900 transition-colors outline-none hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-600 dark:focus-visible:ring-offset-neutral-950"
	>
		{#if multiple}
			<span class="min-w-0 flex-1 truncate {selectedItems.length === 0 ? 'text-neutral-400' : ''}">{selectionLabel}</span>
		{:else if selected}
			{#if selected.imageUrl}
				<img src={selected.imageUrl} alt="" class="size-6 shrink-0 rounded-full object-cover" />
			{:else if selected.initials}
				<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">{selected.initials}</span>
			{/if}
			<span class="min-w-0 flex-1 truncate">{selected.label}</span>
		{:else}
			<span class="min-w-0 flex-1 truncate text-neutral-400">{placeholder}</span>
		{/if}
		<ChevronsUpDown size={16} class="shrink-0 text-neutral-400" aria-hidden="true" />
	</button>

	{#if isOpen}
		<div class="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
			{#if searchable}
				<div class="border-b border-neutral-100 p-2 dark:border-neutral-800">
					<!-- svelte-ignore a11y_autofocus -->
					<input bind:value={query} type="search" placeholder={searchPlaceholder} autofocus class="w-full rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-red-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
				</div>
			{/if}
			<div class="max-h-72 overflow-y-auto" role="listbox">
				{#if filteredGroups.length === 0}
					<p class="px-3 py-4 text-center text-xs text-neutral-400">Keine Treffer</p>
				{:else}
					{#each filteredGroups as group, groupIndex (group.heading ?? groupIndex)}
						{#if group.heading}<p class="bg-neutral-50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-neutral-500 uppercase dark:bg-neutral-950/50 dark:text-neutral-400">{group.heading}</p>{/if}
						{#each group.items as item (item.id)}
							<button type="button" role="option" aria-selected={selectedIds.includes(item.id)} onclick={() => select(item.id)} class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800">
								{#if multiple}<span class="flex size-5 shrink-0 items-center justify-center rounded border {selectedIds.includes(item.id) ? 'border-red-600 bg-red-600 text-white' : 'border-neutral-300 dark:border-neutral-600'}">{#if selectedIds.includes(item.id)}<Check size={13} />{/if}</span>{/if}
								{#if item.imageUrl}<img src={item.imageUrl} alt="" class="size-7 shrink-0 rounded-full object-cover" />{:else if item.initials}<span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">{item.initials}</span>{/if}
								<span class="min-w-0 flex-1 truncate">{item.label}{#if item.subtitle}<span class="ml-1 text-xs text-neutral-400">{item.subtitle}</span>{/if}</span>
								{#if !multiple && value === item.id}<Check size={15} class="shrink-0 text-red-600 dark:text-red-400" />{/if}
							</button>
						{/each}
					{/each}
				{/if}
			</div>
			{#if multiple || allowClear}<div class="flex items-center gap-3 border-t border-neutral-100 px-3 py-2 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">{#if multiple}<span>{selectedItems.length} ausgewählt</span>{/if}{#if allowClear}<button type="button" onclick={clear} disabled={!canClear} class="ml-auto inline-flex items-center gap-1 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-white"><X size={12} />Auswahl entfernen</button>{/if}</div>{/if}
		</div>
	{/if}
</div>
