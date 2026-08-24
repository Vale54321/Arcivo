<script lang="ts">
	import { Input } from '../../../../../../src';

let filter = $state('');
</script>

<Input
	bind:value={filter}
	variant="bare"
	placeholder="Filter by tag"
	aria-label="Filter by tag"
/>
