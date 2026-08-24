<script lang="ts">
	import { Input } from '../../../../../../src';
	import { Mail } from '@lucide/svelte';
</script>

<Input label="Email address" placeholder="name@example.com">
	{#snippet leading()}
		<Mail size={16} strokeWidth={2} />
	{/snippet}
</Input>
