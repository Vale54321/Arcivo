<script lang="ts">
	import { Input } from '../../../../../../src';

	let query = $state('');
</script>

<Input
	bind:value={query}
	variant="search"
	placeholder="Search documents"
	aria-label="Search documents"
/>
