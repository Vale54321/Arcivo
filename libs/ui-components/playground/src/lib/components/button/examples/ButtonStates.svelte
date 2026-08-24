<script lang="ts">
	import { Button } from '../../../../../../src';

	let loading = $state(false);

	function demonstrateLoading() {
		if (loading) return;
		loading = true;
		window.setTimeout(() => (loading = false), 1400);
	}
</script>

<div class="flex flex-wrap items-center gap-3">
	<Button disabled>Disabled</Button>
	<Button variant="primary" {loading} onclick={demonstrateLoading}>Try loading</Button>
	<Button variant="outline" disabled>Unavailable</Button>
</div>
