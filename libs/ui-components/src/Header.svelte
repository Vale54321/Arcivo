<script lang="ts">
	interface Props {
		title: string;
		description?: string;
		level?: 1 | 2;
		class?: string;
	}

	let { title, description, level = 2, class: className = '' }: Props = $props();
</script>

<div class="{level === 1 ? 'mb-7' : 'mb-5'} {className}">
	<svelte:element
		this={level === 1 ? 'h1' : 'h2'}
		class={level === 1
			? 'text-2xl font-semibold text-neutral-900 dark:text-neutral-100'
			: 'text-xl font-semibold text-neutral-900 dark:text-neutral-100'}
	>
		{title}
	</svelte:element>
	{#if description}
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
	{/if}
</div>
