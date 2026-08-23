<script lang="ts">
	import type { Snippet } from 'svelte';
	import Spinner from './Spinner.svelte';

	interface Props {
		onclick?: (event: MouseEvent) => void;
		variant?: 'primary' | 'ghost';
		loading?: boolean;
		disabled?: boolean;
		type?: 'button' | 'submit';
		class?: string;
		children: Snippet;
	}

	let {
		onclick,
		variant = 'primary',
		loading = false,
		disabled = false,
		type = 'button',
		class: className = '',
		children
	}: Props = $props();
</script>

<button
	{type}
	{onclick}
	disabled={disabled || loading}
	class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50 {variant ===
	'primary'
		? 'bg-red-600 font-medium text-white hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600'
		: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'} {className}"
>
	{#if loading}
		<Spinner />
	{/if}
	{@render children()}
</button>
