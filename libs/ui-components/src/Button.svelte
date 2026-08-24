<script module lang="ts">
	export type ButtonVariant =
		| 'primary'
		| 'secondary'
		| 'outline'
		| 'ghost'
		| 'danger'
		| 'danger-hint'
		| 'link';
	export type ButtonSize = 'sm' | 'md' | 'lg';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLButtonAttributes, 'children' | 'class' | 'disabled' | 'type'> {
		/** Visual emphasis of the button. */
		variant?: ButtonVariant;
		/** Button height and horizontal padding. */
		size?: ButtonSize;
		/** Shows a progress indicator and prevents interaction. */
		loading?: boolean;
		/** Renders a square button sized for an icon. Supply an accessible name with `aria-label`. */
		iconOnly?: boolean;
		/** Makes the button fill the available inline space. */
		fullWidth?: boolean;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		/** Accessible text announced while the button is busy. */
		loadingLabel?: string;
		class?: string;
		/** Content displayed before the label, usually an icon. */
		leading?: Snippet;
		/** Content displayed after the label, usually an icon. */
		trailing?: Snippet;
		children?: Snippet;
	}

	let {
		variant = 'secondary',
		size = 'md',
		loading = false,
		iconOnly = false,
		fullWidth = false,
		disabled = false,
		type = 'button',
		loadingLabel = 'Loading',
		class: className = '',
		leading,
		trailing,
		children,
		...restProps
	}: Props = $props();

	const variants: Record<ButtonVariant, string> = {
		primary:
			'bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 dark:active:bg-red-800',
		secondary:
			'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:active:bg-neutral-600',
		outline:
			'border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white dark:active:bg-neutral-700',
		ghost:
			'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white dark:active:bg-neutral-700',
		danger:
			'bg-red-700 text-white shadow-sm hover:bg-red-600 active:bg-red-800 dark:bg-red-700 dark:hover:bg-red-600 dark:active:bg-red-800',
		'danger-hint':
			'bg-transparent text-neutral-600 hover:bg-red-100 hover:text-red-700 active:bg-red-200 dark:text-neutral-300 dark:hover:bg-red-950/60 dark:hover:text-red-300 dark:active:bg-red-950',
		link:
			'bg-transparent text-red-600 hover:text-red-700 hover:underline dark:text-red-400 dark:hover:text-red-300'
	};

	const sizes: Record<ButtonSize, string> = {
		sm: 'min-h-6 gap-1 rounded-md px-2 text-xs',
		md: 'min-h-9 gap-2 rounded-lg px-4 text-sm',
		lg: 'min-h-11 gap-2 rounded-lg px-5 text-sm'
	};

	const iconOnlySizes: Record<ButtonSize, string> = {
		sm: 'size-6 rounded-md',
		md: 'size-9 rounded-lg',
		lg: 'size-11 rounded-lg'
	};
</script>

<button
	{...restProps}
	{type}
	disabled={disabled || loading}
	aria-busy={loading || undefined}
	data-variant={variant}
	data-size={size}
	data-loading={loading || undefined}
	class="inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap font-semibold transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-red-400 dark:focus-visible:ring-offset-neutral-950 {variants[variant]} {iconOnly ? iconOnlySizes[size] : sizes[size]} {fullWidth ? 'w-full' : ''} {variant === 'link' ? 'h-auto min-h-0 px-0 py-0 shadow-none focus-visible:rounded-sm' : ''} {className}"
>
	{#if loading}
		<span
			class="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
			aria-hidden="true"
		></span>
	{:else if leading}
		<span class="shrink-0" aria-hidden="true">{@render leading()}</span>
	{/if}
	{#if children}
		{@render children()}
	{/if}
	{#if !loading && trailing}
		<span class="shrink-0" aria-hidden="true">{@render trailing()}</span>
	{/if}
	{#if loading}
		<span class="sr-only">{loadingLabel}</span>
	{/if}
</button>
