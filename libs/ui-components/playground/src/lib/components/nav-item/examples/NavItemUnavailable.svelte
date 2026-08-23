<script lang="ts">
	import { FolderOpen } from '@lucide/svelte';
	import { NavItem } from '../../../../../../src';
</script>

<div class="w-full max-w-xs rounded-xl border border-neutral-200 p-2 dark:border-neutral-800">
	<NavItem label="Collections" disabled badge="Soon" title="Coming soon">
		{#snippet leading()}
			<FolderOpen size={18} />
		{/snippet}
	</NavItem>
</div>
