<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'class' | 'disabled' | 'type'> {
		/** Plain label used when no custom child content is supplied. */
		label?: string;
		/** Applies the selected or keyboard-highlighted state. */
		active?: boolean;
		/** Applies a destructive visual treatment. */
		danger?: boolean;
		disabled?: boolean;
		class?: string;
		/** Content before the label, usually an icon. */
		leading?: Snippet;
		/** Content after the label, such as metadata or a status badge. */
		trailing?: Snippet;
		/** Primary row content. Use this for rich text such as highlighted search matches. */
		children?: Snippet;
	}

	let {
		label,
		active = false,
		danger = false,
		disabled = false,
		class: className = '',
		leading,
		trailing,
		children,
		...restProps
	}: Props = $props();

	let stateClass = $derived(
		danger
			? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
			: active
				? 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100'
				: 'text-neutral-800 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800'
	);
</script>

<button
	{...restProps}
	type="button"
	{disabled}
	class="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 {stateClass} {className}"
>
	{#if leading}
		<span class="flex shrink-0 {danger ? 'text-current' : 'text-neutral-400'}" aria-hidden="true">
			{@render leading()}
		</span>
	{/if}
	<span class="min-w-0 flex-1 truncate">
		{#if children}
			{@render children()}
		{:else}
			{label}
		{/if}
	</span>
	{#if trailing}
		<span class="flex shrink-0 items-center gap-2">{@render trailing()}</span>
	{/if}
</button>
