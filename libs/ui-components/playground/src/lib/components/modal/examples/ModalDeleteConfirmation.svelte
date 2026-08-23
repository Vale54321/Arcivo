<script lang="ts">
	import { Button, Modal } from '../../../../../../src';

	let open = $state(false);
	let deleting = $state(false);

	function close(): void {
		if (!deleting) open = false;
	}

	function confirmDelete(): void {
		if (deleting) return;
		deleting = true;
		window.setTimeout(() => {
			deleting = false;
			open = false;
		}, 1000);
	}
</script>

<Button variant="danger" onclick={() => (open = true)}>Delete document</Button>

<Modal
	{open}
	onClose={close}
	title="Delete document"
	size="sm"
	dismissOnEscape={!deleting}
	dismissOnBackdrop={!deleting}
>
	<p class="text-sm text-neutral-500 dark:text-neutral-400">
		“Quarterly report.pdf” will be permanently deleted.
	</p>

	{#snippet footer()}
		<Button variant="secondary" onclick={close} disabled={deleting}>Cancel</Button>
		<Button variant="danger" onclick={confirmDelete} loading={deleting}>Delete</Button>
	{/snippet}
</Modal>
