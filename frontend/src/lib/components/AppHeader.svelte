<script lang="ts">
	import { getSidebarContext } from '$lib/state/sidebar.svelte';
	import { getThemeContext } from '$lib/state/theme.svelte';
	import { Menu, Moon, Sun, SunMoon } from '@lucide/svelte';

	const sidebar = getSidebarContext();
	const theme = getThemeContext();
	const NEXT_THEME_MESSAGE = {
		system: 'Switch to light theme',
		light: 'Switch to dark theme',
		dark: 'Use system theme'
	};
	const themeMessage = NEXT_THEME_MESSAGE[theme.current];
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

	<div class="flex-1"></div>

	<!-- Theme toggle -->
	<button
		onclick={theme.toggle}
		class="ml-3 flex shrink-0 items-center justify-center rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
		aria-label={themeMessage}
		title={themeMessage}
	>
		{#if theme.current === 'system'}
			<SunMoon size={18} />
		{:else if theme.current === 'light'}
			<Moon size={18} />
		{:else}
			<Sun size={18} />
		{/if}
	</button>
</header>
