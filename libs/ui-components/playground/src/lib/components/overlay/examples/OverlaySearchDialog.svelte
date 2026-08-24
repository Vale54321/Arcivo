<script lang="ts">
	import { FileText } from '@lucide/svelte';
	import { ActionItem, Button, Input, Overlay } from '../../../../../../src';

	let open = $state(false);

	function close(): void {
		open = false;
	}
</script>

<Button variant="outline" onclick={() => (open = true)}>Open search</Button>

<Overlay
	{open}
	onClose={close}
	role="dialog"
	modal
	ariaLabel="Search documents"
	backdrop="dim"
	surfaceClass="top-1/4 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 border-red-300 shadow-2xl dark:border-red-900"
>
	<div class="border-b border-neutral-200 p-4 dark:border-neutral-700">
		<Input variant="search" value="report" placeholder="Search documents" aria-label="Search documents" />
	</div>
	<ul class="py-2">
		<li>
			<ActionItem onclick={close}>
				{#snippet leading()}
					<FileText size={16} />
				{/snippet}
				Quarterly report.pdf
				{#snippet trailing()}
					<span class="text-xs text-neutral-400">1.2 MB</span>
				{/snippet}
			</ActionItem>
		</li>
	</ul>
</Overlay>
