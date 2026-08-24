<script lang="ts">
	import { getSidebarContext } from '$lib/state/sidebar.svelte';
	import { Files, FolderOpen, Settings, Tag, Trash2, X, type LucideIcon } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { currentUser } from '$lib/state/current-user';
	import { ArcivoLogo, Button, NavItem } from '@arcivo/ui-components';

	const sidebar = getSidebarContext();

	type MenuItem = {
		name: string;
		href?: '/documents/' | '/settings';
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

	function initials(name: string): string {
		const words = name.trim().split(/\s+/).filter(Boolean);
		if (words.length > 1) {
			return `${words[0][0]}${words[1][0]}`.toUpperCase();
		}
		return name.trim().slice(0, 2).toUpperCase();
	}

	const accountName = $derived($currentUser?.displayName || 'Konto');
	const accountInitials = $derived(initials(accountName));
	const accountIsActive = $derived(page.url.pathname.startsWith('/account'));
	const settingsIsActive = $derived(page.url.pathname.startsWith('/settings'));

	function isActive(href?: string, soon = false): boolean {
		if (soon || !href) return false;
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
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
			<ArcivoLogo size="md" />
		</a>
		<Button
			variant="ghost"
			iconOnly
			size="sm"
			onclick={() => sidebar.close()}
			aria-label="Close sidebar"
			class="lg:hidden"
		>
			<X size={16} />
		</Button>
	</div>

	<ul class="flex flex-1 flex-col gap-0.5 px-2">
		{#each navItems as item (item.name)}
			{@const Icon = item.icon}
			<li>
				<NavItem
					label={item.name}
					href={item.href ? resolve(item.href) : undefined}
					active={isActive(item.href, item.soon)}
					disabled={item.soon}
					badge={item.soon ? 'Soon' : undefined}
					title={item.soon ? 'Demnächst verfügbar' : undefined}
				>
					{#snippet leading()}
						<Icon size={18} />
					{/snippet}
				</NavItem>
			</li>
		{/each}
	</ul>

	<ul class="flex flex-col gap-0.5 border-t border-neutral-200 px-2 pt-4 dark:border-neutral-800">
		<li>
			<NavItem label="Einstellungen" href={resolve('/settings')} active={settingsIsActive}>
				{#snippet leading()}
					<Settings size={18} />
				{/snippet}
			</NavItem>
		</li>
		<li class="mt-2 min-w-0">
			<a
				href={resolve('/account')}
				class="flex min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors {accountIsActive
					? 'bg-neutral-200 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
					: 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'}"
			>
				<span
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300"
					aria-hidden="true"
				>
					{accountInitials}
				</span>
				<span class="min-w-0 flex-1 truncate" title={accountName}>{accountName}</span>
			</a>
		</li>
	</ul>
</nav>
