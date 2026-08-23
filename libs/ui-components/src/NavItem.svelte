<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Primary navigation label. */
		label: string;
		/** Optional supporting text shown below the label. */
		description?: string;
		/** Makes the item a link. Routing stays with the consuming application. */
		href?: string;
		/** Applies the selected state. */
		active?: boolean;
		/** Renders a non-interactive item for unavailable destinations. */
		disabled?: boolean;
		/** Optional compact label, such as "Soon". */
		badge?: string;
		/** Native tooltip text. */
		title?: string;
		class?: string;
		/** Content before the label, usually an icon. */
		leading?: Snippet;
		/** Short text rendered in a leading tile when no custom leading content is supplied. */
		initial?: string;
		/** Content after the label and badge. */
		trailing?: Snippet;
		/** Action for selectable items that are not links. */
		onclick?: (event: MouseEvent) => void;
	}

	let {
		label,
		description,
		href,
		active = false,
		disabled = false,
		badge,
		title,
		class: className = '',
		leading,
		initial,
		trailing,
		onclick
	}: Props = $props();

	const styles = {
		layout: 'rounded-lg px-3 py-2',
		active: 'bg-neutral-200 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
		idle: 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200',
		disabled: 'cursor-default text-neutral-400 select-none dark:text-neutral-600'
	};

	let itemClass = $derived(
		`flex w-full min-w-0 items-center gap-3 text-left text-sm transition-colors ${styles.layout} ${disabled ? styles.disabled : active ? styles.active : styles.idle} ${className}`
	);
</script>

{#snippet content()}
	{#if leading}
		<span class="flex shrink-0" aria-hidden="true">{@render leading()}</span>
	{:else if initial}
		<span
			class="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold {disabled
				? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
				: active
					? 'bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900'
					: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'}"
			aria-hidden="true"
		>
			{initial}
		</span>
	{/if}
	<span class="min-w-0 flex-1">
		<span class="block truncate {description ? 'font-semibold' : ''}">{label}</span>
		{#if description}
			<span class="block truncate text-xs opacity-70">{description}</span>
		{/if}
	</span>
	{#if badge}
		<span
			class="rounded-md border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wide text-amber-600 uppercase dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
		>
			{badge}
		</span>
	{/if}
	{#if trailing}
		<span class="flex shrink-0" aria-hidden="true">{@render trailing()}</span>
	{/if}
{/snippet}

{#if disabled}
	<span {title} class={itemClass} aria-disabled="true">
		{@render content()}
	</span>
{:else if href}
	<a {href} {title} class={itemClass} aria-current={active ? 'page' : undefined}>
		{@render content()}
	</a>
{:else}
	<button type="button" {title} class={itemClass} {onclick} aria-current={active ? 'page' : undefined}>
		{@render content()}
	</button>
{/if}
