<script lang="ts">
	import './layout.css';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	let { children } = $props();
</script>

<SiteHeader />
{@render children()}
<SiteFooter />
