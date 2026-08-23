<script lang="ts">
	import { FileText } from '@lucide/svelte';
	import { NavItem } from '../../../../../../src';
</script>

<nav aria-label="Application navigation example" class="w-full max-w-xs rounded-xl border border-neutral-200 p-2 dark:border-neutral-800">
	<ul>
		<li>
			<NavItem label="Documents" href="#documents" active>
				{#snippet leading()}
					<FileText size={18} />
				{/snippet}
			</NavItem>
		</li>
	</ul>
</nav>
