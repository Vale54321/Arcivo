<script lang="ts">
	import { BookOpen, GitBranch, Menu, Moon, Sun } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { Button, NavItem } from '@arcivo/ui-components';
	import ArcivoLogo from './ArcivoLogo.svelte';

	const forgejoUrl = 'https://git.heiserer.de/Arcivo/Arcivo';
	const issuesUrl = `${forgejoUrl}/issues`;
	let darkMode = $state(false);
	let menuOpen = $state(false);
	onMount(() => { darkMode = document.documentElement.classList.contains('dark'); });
	function toggleTheme() { darkMode = !darkMode; document.documentElement.classList.toggle('dark', darkMode); localStorage.setItem('arcivo:theme', darkMode ? 'dark' : 'light'); }
	function closeMenu() { menuOpen = false; }
</script>

<header class="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-950/90">
	<div class="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5 sm:px-8">
		<a href="/" class="text-neutral-900 dark:text-neutral-100" aria-label="Arcivo home"><ArcivoLogo /></a>
		<nav class="ml-7 hidden items-center gap-1 md:flex" aria-label="Primary navigation">
			<Button href="/features" variant="ghost" size="md">Features</Button><Button href="/roadmap" variant="ghost" size="md">Roadmap</Button><Button href={issuesUrl} variant="ghost" size="md" target="_blank" rel="noreferrer">Issues</Button>
		</nav>
		<div class="ml-auto flex items-center gap-1.5">
			<Button variant="ghost" iconOnly size="md" onclick={toggleTheme} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>{#if darkMode}<Sun size={17} />{:else}<Moon size={17} />{/if}</Button>
			<Button class="hidden sm:inline-flex" href={forgejoUrl} variant="secondary" size="md" target="_blank" rel="noreferrer">{#snippet leading()}<GitBranch size={16} />{/snippet}Forgejo</Button>
			<Button class="md:hidden" variant="ghost" iconOnly size="md" onclick={() => (menuOpen = !menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}><Menu size={19} /></Button>
		</div>
	</div>
	{#if menuOpen}<nav class="border-t border-neutral-200 px-5 py-3 dark:border-neutral-800 md:hidden" aria-label="Mobile navigation"><div class="grid gap-1"><NavItem label="Features" href="/features" onclick={closeMenu} /><NavItem label="Roadmap and issues" href="/roadmap" onclick={closeMenu} /><NavItem label="Forgejo repository" href={forgejoUrl}>{#snippet trailing()}<BookOpen size={15} />{/snippet}</NavItem></div></nav>{/if}
</header>
