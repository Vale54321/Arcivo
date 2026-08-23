<script lang="ts">
	let { height = '32px' }: { height?: string } = $props();
</script>

<span style="display: inline-flex; align-items: center; gap: 0px; height: {height};">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 44 48"
		fill="none"
		style="height: {height}; width: auto;"
	>
		<use href="/favicon.svg#arcivo-mark" />
	</svg>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 88 44"
		fill="none"
		style="height: {height}; width: auto;"
	>
		<use href="/favicon.svg#arcivo-wordmark" />
	</svg>
</span>
