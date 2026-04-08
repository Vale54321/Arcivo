<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { LucideIcon } from '@lucide/svelte';

	let {
		name,
		href,
		icon: Icon
	} = $props<{
		name: string;
		href: string;
		icon: LucideIcon;
	}>();

	const isActive = $derived(
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href)
	);
</script>

<li>
	<a
		href={resolve(href)}
		class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors {isActive
			? 'bg-neutral-200 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
			: 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'}"
	>
		<Icon size={18} />
		{name}
	</a>
</li>
