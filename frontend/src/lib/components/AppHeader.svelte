<script lang="ts">
	import { getSidebarContext } from '$lib/state/sidebar.svelte';

	const sidebar = getSidebarContext();
</script>

<header
	class="flex h-14 shrink-0 items-center border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950"
>
	<!-- Burger menu -->
	<button
		onclick={() => sidebar.toggle()}
		class="mr-3 flex items-center justify-center rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 lg:hidden dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
		aria-label="Open sidebar"
	>
		<Menu size={20} />
	</button>
</header>
