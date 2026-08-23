<script lang="ts">
	import { Button } from '@arcivo/ui-components';

	export let open = false;
	export let title = 'Bestätigen';
	export let message = '';
	export let confirmLabel = 'Löschen';
	export let onConfirm: () => void = () => {};
	export let onCancel: () => void = () => {};
	export let loading = false;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) onCancel();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 z-50 cursor-default bg-black/20 backdrop-blur-sm"
		onclick={onCancel}
		aria-label="Abbrechen"
		tabindex="-1"
	></button>

	<!-- Dialog -->
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-title"
		class="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
	>
		<div class="px-6 py-5">
			<h2 id="confirm-title" class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
				{title}
			</h2>
			{#if message}
				<p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
			{/if}
		</div>
		<div
			class="flex items-center justify-end gap-2 border-t border-neutral-100 px-6 py-4 dark:border-neutral-800"
		>
			<Button variant="secondary" onclick={onCancel} disabled={loading}>Abbrechen</Button>
			<Button variant="danger" onclick={onConfirm} {loading}>
				{confirmLabel}
			</Button>
		</div>
	</div>
{/if}
