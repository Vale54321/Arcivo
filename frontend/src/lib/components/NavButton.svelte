<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { LucideIcon } from '@lucide/svelte';

	let {
		name,
		href,
		icon: Icon,
		soon = false
	} = $props<{
		name: string;
		href?: string;
		icon: LucideIcon;
		soon?: boolean;
	}>();

	const isActive = $derived(
		!soon && href
			? href === '/'
				? page.url.pathname === '/'
				: page.url.pathname.startsWith(href)
			: false
	);
</script>

<li>
	{#if soon}
		<span
			class="flex cursor-default items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 select-none dark:text-neutral-600"
			title="Demnächst verfügbar"
		>
			<Icon size={18} />
			<span class="flex-1">{name}</span>
			<span
				class="rounded-md border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wide text-amber-600 uppercase dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
			>
				Soon
			</span>
		</span>
	{:else if href}
		<a
			href={resolve(href)}
			class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors {isActive
				? 'bg-neutral-200 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
				: 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'}"
		>
			<Icon size={18} />
			{name}
		</a>
	{/if}
</li>
