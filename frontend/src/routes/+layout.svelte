<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';

	let { children } = $props();

	onMount(() => {
		const splash = document.getElementById('arcivo-splash');
		if (!splash) return;

		requestAnimationFrame(() => {
			splash.classList.add('opacity-0', 'pointer-events-none');
			window.setTimeout(() => splash.remove(), 250);
		});
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<title>Arcivo</title>
</svelte:head>
{@render children()}
