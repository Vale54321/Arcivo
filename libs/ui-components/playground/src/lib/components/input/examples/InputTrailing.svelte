<script lang="ts">
	import { Input } from '../../../../../../src';
	import { ExternalLink } from '@lucide/svelte';
</script>

<Input label="Website" value="arcivo.app">
	{#snippet trailing()}
		<ExternalLink size={16} strokeWidth={2} />
	{/snippet}
</Input>
