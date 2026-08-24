<script lang="ts">
	import { NavItem } from '../../../../../../src';

	const items = [
		{ id: 'button', name: 'Button', description: 'Triggers actions and submissions.' },
		{ id: 'input', name: 'Input', description: 'Collects text and form values.' },
		{ id: 'spinner', name: 'Spinner', description: 'Communicates loading progress.' }
	] as const;

	let selected = $state<(typeof items)[number]['id']>('button');
</script>

<nav
	aria-label="Sidebar navigation with initials"
	class="w-full max-w-xs rounded-xl border border-neutral-200 p-2 dark:border-neutral-800"
>
	<ul>
		{#each items as item (item.id)}
			<li>
				<NavItem
					label={item.name}
					description={item.description}
					initial={item.name.slice(0, 1)}
					active={selected === item.id}
					onclick={() => (selected = item.id)}
				/>
			</li>
		{/each}
	</ul>
</nav>
