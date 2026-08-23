<script module lang="ts">
	export type ModalSize = 'sm' | 'md' | 'lg';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import Overlay from './Overlay.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Accessible name and default visible heading. */
		title: string;
		ariaLabel?: string;
		size?: ModalSize;
		dismissOnEscape?: boolean;
		dismissOnBackdrop?: boolean;
		/** Replaces the default heading content. */
		header?: Snippet;
		/** Content displayed in the modal footer. */
		footer?: Snippet;
		contentClass?: string;
		surfaceClass?: string;
		children: Snippet;
	}

	let {
		open,
		onClose,
		title,
		ariaLabel = title,
		size = 'md',
		dismissOnEscape = true,
		dismissOnBackdrop = true,
		header,
		footer,
		contentClass = '',
		surfaceClass = '',
		children
	}: Props = $props();

	const sizes: Record<ModalSize, string> = {
		sm: 'max-w-sm',
		md: 'max-w-lg',
		lg: 'max-w-2xl'
	};
</script>

<Overlay
	{open}
	{onClose}
	role="dialog"
	modal
	{ariaLabel}
	dismissOnEscape={dismissOnEscape}
	dismissOnBackdrop={dismissOnBackdrop}
	surfaceClass="top-1/2 left-1/2 flex max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col {sizes[size]} {surfaceClass}"
>
	<div class="flex shrink-0 items-center gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
		{#if header}
			{@render header()}
		{:else}
			<h2 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
		{/if}
	</div>

	<div class="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4 {contentClass}">
		{@render children()}
	</div>

	{#if footer}
		<div
			class="flex shrink-0 justify-end gap-2 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800"
		>
			{@render footer()}
		</div>
	{/if}
</Overlay>
