<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		title: string;
		size?: 'sm' | 'md' | 'lg';
		header?: Snippet;
		footer?: Snippet;
		children: Snippet;
	}

	let { open, onClose, title, size = 'md', header, footer, children }: Props = $props();

	function onKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') onClose();
	}

	function onBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) onClose();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
		onclick={onBackdropClick}
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-label={title}
			class="flex max-h-[90vh] w-full flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 {size ===
			'sm'
				? 'max-w-sm'
				: size === 'lg'
					? 'max-w-2xl'
					: 'max-w-lg'}"
		>
			{#if header}
				<div
					class="flex shrink-0 items-center gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800"
				>
					{@render header()}
				</div>
			{/if}

			<div class="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
				{@render children()}
			</div>

			{#if footer}
				<div
					class="flex shrink-0 justify-end gap-2 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800"
				>
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
