<script lang="ts">
	import ArcivoLogo from './ArcivoLogo.svelte';
	import { getSidebarContext } from '$lib/state/sidebar.svelte';
	import { Files, X, type LucideIcon } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import NavButton from './NavButton.svelte';

	const sidebar = getSidebarContext();

	type MenuItem = {
		name: string;
		href: string;
		icon: LucideIcon;
	};

	const navItems: MenuItem[] = [
		{
			name: 'Dokumente',
			icon: Files,
			href: '/'
		}
	];

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && sidebar.isOpen) {
			sidebar.close();
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if sidebar.isOpen}
	<div
		class="fixed inset-0 z-20 bg-black/30 lg:hidden"
		role="presentation"
		onclick={() => sidebar.close()}
	></div>
{/if}

<nav
	class="fixed inset-y-0 left-0 z-30 flex h-full w-56 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 py-4 transition-transform duration-200 lg:relative lg:flex lg:translate-x-0 dark:border-neutral-800 dark:bg-neutral-950 {sidebar.isOpen
		? 'translate-x-0'
		: '-translate-x-full lg:translate-x-0'}"
>
	<div class="mb-6 flex items-center justify-between px-4">
		<a href={resolve('/')}>
			<ArcivoLogo height="30px" />
		</a>
		<button
			onclick={() => sidebar.close()}
			aria-label="Close sidebar"
			class="flex items-center justify-center rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 lg:hidden dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
		>
			<X size={16} />
		</button>
	</div>

	<ul class="flex flex-1 flex-col gap-0.5 px-2">
		{#each navItems as { name, href, icon } (href)}
			<NavButton {name} {href} {icon} />
		{/each}
	</ul>
</nav>
