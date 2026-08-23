<script lang="ts">
	import { Button } from '../../../../../../src';
</script>

<div class="flex flex-wrap items-center gap-3">
	<Button variant="primary">
		{#snippet leading()}<span class="text-base leading-none">＋</span>{/snippet}
		New document
	</Button>
	<Button variant="outline">
		Export
		{#snippet trailing()}<span class="text-base leading-none">↓</span>{/snippet}
	</Button>
	<Button variant="ghost">
		Continue
		{#snippet trailing()}<span class="text-base leading-none">→</span>{/snippet}
	</Button>
</div>
