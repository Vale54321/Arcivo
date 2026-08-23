<script lang="ts">
	import { Input } from '../../../../src';
	import { components, type ComponentId } from './components';

	interface Props {
		selected: ComponentId;
		onSelect: (component: ComponentId) => void;
	}

	let { selected, onSelect }: Props = $props();
	let query = $state('');
	let filteredComponents = $derived(
		components.filter((component) => {
			const searchTerm = query.trim().toLocaleLowerCase();
			return (
				!searchTerm ||
				component.name.toLocaleLowerCase().includes(searchTerm) ||
				component.description.toLocaleLowerCase().includes(searchTerm)
			);
		})
	);
</script>

<nav aria-label="Components" class="w-full lg:w-60 lg:shrink-0">
	<p class="mb-2 px-3 text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
		Components
	</p>
	<Input
		bind:value={query}
		variant="search"
		containerClass="mb-3"
		placeholder="Search components"
		aria-label="Search components"
	/>
	<ul class="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
		{#each filteredComponents as component (component.id)}
			<li class="min-w-44 lg:min-w-0">
				<button
					type="button"
					onclick={() => onSelect(component.id)}
					aria-current={selected === component.id ? 'page' : undefined}
					class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors {selected ===
						component.id
						? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
						: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'}"
				>
					<span
						class="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold {selected ===
							component.id
							? 'bg-red-600 text-white dark:bg-red-700'
							: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'}"
					>
						{component.name.slice(0, 1)}
					</span>
					<span class="min-w-0">
						<span class="block text-sm font-semibold">{component.name}</span>
						<span class="block truncate text-xs opacity-70">{component.description}</span>
					</span>
				</button>
			</li>
		{/each}
		{#if filteredComponents.length === 0}
			<li class="px-3 py-4 text-sm text-neutral-500 dark:text-neutral-400">
				No components found.
			</li>
		{/if}
	</ul>
</nav>
