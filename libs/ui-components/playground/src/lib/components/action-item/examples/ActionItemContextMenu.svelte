<script lang="ts">
	import { Archive, Download, Info, Trash2 } from '@lucide/svelte';
	import { ActionItem } from '../../../../../../src';
</script>

<div
	role="menu"
	aria-label="Document actions"
	class="w-full max-w-xs overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
>
	<ActionItem role="menuitem">
		{#snippet leading()}
			<Archive size={16} />
		{/snippet}
		Open archive
	</ActionItem>
	<ActionItem role="menuitem">
		{#snippet leading()}
			<Download size={16} />
		{/snippet}
		Download
	</ActionItem>
	<ActionItem role="menuitem">
		{#snippet leading()}
			<Info size={16} />
		{/snippet}
		Information
	</ActionItem>
	<div class="my-1 border-t border-neutral-100 dark:border-neutral-800"></div>
	<ActionItem role="menuitem" danger>
		{#snippet leading()}
			<Trash2 size={16} />
		{/snippet}
		Delete
	</ActionItem>
</div>
