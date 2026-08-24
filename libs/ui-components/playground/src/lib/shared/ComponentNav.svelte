<script lang="ts">
	import { Input, NavItem } from '../../../../src';
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
				<NavItem
					label={component.name}
					description={component.description}
					initial={component.name.slice(0, 1)}
					active={selected === component.id}
					onclick={() => onSelect(component.id)}
				/>
			</li>
		{/each}
		{#if filteredComponents.length === 0}
			<li class="px-3 py-4 text-sm text-neutral-500 dark:text-neutral-400">
				No components found.
			</li>
		{/if}
	</ul>
</nav>
