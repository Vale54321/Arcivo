<script lang="ts">
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
			<button
				onclick={onCancel}
				disabled={loading}
				class="rounded-lg px-4 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
			>
				Abbrechen
			</button>
			<button
				onclick={onConfirm}
				disabled={loading}
				class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
			>
				{#if loading}
					<svg
						class="animate-spin"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M21 12a9 9 0 1 1-6.219-8.56" />
					</svg>
				{/if}
				{confirmLabel}
			</button>
		</div>
	</div>
{/if}
