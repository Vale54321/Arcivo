<script lang="ts">
	import { getSidebarContext } from '$lib/state/sidebar.svelte';
	import { getThemeContext } from '$lib/state/theme.svelte';
	import { uploadOpen } from '$lib/stores';
	import { Menu, Moon, Search, Sun, SunMoon, Upload } from '@lucide/svelte';
	import SearchModal from './SearchModal.svelte';

	const sidebar = getSidebarContext();
	const theme = getThemeContext();
	let searchModal = $state<SearchModal | null>(null);
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

	<div class="flex flex-1 items-center justify-center">
		<button
			type="button"
			onclick={() => searchModal?.open()}
			class="flex w-full max-w-md cursor-text items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:border-red-400 hover:text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-red-800 dark:hover:text-neutral-300"
			aria-label="Dokumente suchen"
		>
			<Search size={14} />
			<span class="flex-1 text-left">Suchen</span>
			<kbd
				class="hidden items-center rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-400 sm:inline-flex dark:border-neutral-600 dark:bg-neutral-800"
			>
				Ctrl K
			</kbd>
		</button>
	</div>

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

	<button
		type="button"
		onclick={() => uploadOpen.set(true)}
		class="ml-2 flex shrink-0 items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600"
	>
		<Upload size={15} />
		<span class="hidden sm:inline">Hochladen</span>
	</button>
</header>

<SearchModal bind:this={searchModal} />
