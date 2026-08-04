<script lang="ts">
	import ArcivoLogo from './ArcivoLogo.svelte';
	import { getSidebarContext } from '$lib/state/sidebar.svelte';
	import { Files, FolderOpen, Settings, Tag, Trash2, X, type LucideIcon } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import NavButton from './NavButton.svelte';

	const sidebar = getSidebarContext();

	type MenuItem = {
		name: string;
		href?: string;
		icon: LucideIcon;
		soon?: boolean;
	};

	const navItems: MenuItem[] = [
		{
			name: 'Dokumente',
			icon: Files,
			href: '/documents/'
		},
		{ name: 'Sammlungen', icon: FolderOpen, soon: true },
		{ name: 'Tags', icon: Tag, soon: true },
		{ name: 'Papierkorb', icon: Trash2, soon: true }
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
		<a href={resolve('/documents/')}>
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
		{#each navItems as item (item.name)}
			<NavButton {...item} />
		{/each}
	</ul>

	<ul class="flex flex-col gap-0.5 border-t border-neutral-200 px-2 pt-4 dark:border-neutral-800">
		<NavButton name="Einstellungen" icon={Settings} soon />
		<li class="mt-2 flex items-center gap-3 rounded-lg px-3 py-2">
			<span
				class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-200"
				aria-hidden="true"
			>
				AD
			</span>
			<span class="text-sm text-neutral-500 dark:text-neutral-400">Admin</span>
		</li>
	</ul>
</nav>
