<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Area } from '../../../../src';
	import CodePreview from './CodePreview.svelte';

	interface Props {
		title: string;
		description?: string;
		code?: string;
		children: Snippet;
	}

	let { title, description, code, children }: Props = $props();
</script>

<Area {title} {description}>
	{@render children()}
	{#if code}
		<CodePreview {code} />
	{/if}
</Area>
