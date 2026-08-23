<script lang="ts">
	import { onMount } from 'svelte';
	import ArcivoLogo from './lib/shared/ArcivoLogo.svelte';
	import ComponentNav from './lib/shared/ComponentNav.svelte';
	import { components, type ComponentId } from './lib/shared/components';
	import { Header } from '../../src';

	let darkMode = $state(false);
	let selectedComponent = $state<ComponentId>('area');
	let selectedComponentDetails = $derived(
		components.find((component) => component.id === selectedComponent) ?? components[0]
	);
	let SelectedShowcase = $derived(selectedComponentDetails.showcase);
	const themeStorageKey = 'arcivo-ui-components-dark-mode';

	onMount(() => {
		darkMode = sessionStorage.getItem(themeStorageKey) === 'true';
		document.documentElement.classList.toggle('dark', darkMode);
	});

	function toggleTheme() {
		darkMode = !darkMode;
		sessionStorage.setItem(themeStorageKey, String(darkMode));
		document.documentElement.classList.toggle('dark', darkMode);
	}
</script>

<svelte:head>
	<title>Arcivo UI Components</title>
	<meta name="description" content="Interactive component playground for Arcivo UI Components." />
</svelte:head>

<main class="min-h-screen bg-neutral-50 dark:bg-neutral-950">
	<header class="border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
			<div class="flex items-center gap-3">
				<ArcivoLogo height="30px" />
				<div class="border-l border-neutral-200 pl-3 dark:border-neutral-700">
					<h1 class="text-lg font-semibold text-neutral-900 dark:text-white">UI Components</h1>
				</div>
			</div>
			<button
				type="button"
				onclick={toggleTheme}
				class="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
			>
				{darkMode ? 'Light mode' : 'Dark mode'}
			</button>
		</div>
	</header>

	<div class="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:gap-12 lg:px-8">
		<aside class="lg:sticky lg:top-8 lg:self-start">
			<ComponentNav selected={selectedComponent} onSelect={(component) => (selectedComponent = component)} />
		</aside>

		<div class="min-w-0 flex-1">
			<Header
				level={1}
				title={selectedComponentDetails.name}
				description={selectedComponentDetails.description}
			/>

			<SelectedShowcase />
		</div>
	</div>
</main>
