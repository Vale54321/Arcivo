<script lang="ts">
	import { Button, Modal } from '@arcivo/ui-components';

	export let open = false;
	export let title = 'Bestätigen';
	export let message = '';
	export let confirmLabel = 'Löschen';
	export let onConfirm: () => void = () => {};
	export let onCancel: () => void = () => {};
	export let loading = false;
</script>

<Modal
	{open}
	onClose={onCancel}
	{title}
	size="sm"
	dismissOnEscape={!loading}
	dismissOnBackdrop={!loading}
	contentClass="px-6 py-5"
>
	{#if message}
		<p class="text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
	{/if}

	{#snippet footer()}
		<Button variant="secondary" onclick={onCancel} disabled={loading}>Abbrechen</Button>
		<Button variant="danger" onclick={onConfirm} {loading}>
			{confirmLabel}
		</Button>
	{/snippet}
</Modal>
