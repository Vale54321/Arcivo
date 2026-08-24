<script lang="ts">
	import { FileText } from '@lucide/svelte';
	import { ActionItem } from '../../../../../../src';

	let active = $state(true);
</script>

<div class="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
	<ActionItem {active} aria-pressed={active} onclick={() => (active = !active)}>
		{#snippet leading()}
			<FileText size={16} />
		{/snippet}
		Quarterly <span class="font-semibold text-red-600 dark:text-red-400">report</span>.pdf
		{#snippet trailing()}
			<span
				class="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs text-red-600 dark:bg-red-950 dark:text-red-400"
			>
				Inhalt
			</span>
			<span class="text-xs text-neutral-400">1.2 MB</span>
		{/snippet}
	</ActionItem>
</div>

<p class="mt-3 text-xs text-neutral-500 dark:text-neutral-400">Click the row to toggle its active state.</p>
