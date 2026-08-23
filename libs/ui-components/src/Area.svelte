<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		children?: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<section
	class="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
>
	<div class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
		<h2 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
		{#if description}
			<p class="mt-1 max-w-2xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">
				{description}
			</p>
		{/if}
	</div>
	<div class="p-5">
		{#if children}
			{@render children()}
		{/if}
	</div>
</section>
