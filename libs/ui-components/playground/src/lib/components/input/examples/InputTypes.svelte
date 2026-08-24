<script lang="ts">
	import { Input } from '../../../../../../src';
</script>

<div class="grid max-w-2xl gap-5 sm:grid-cols-2">
	<Input label="Quantity" type="number" value={1} min={1} max={99} />
	<Input label="Date" type="date" value="2026-08-23" />
</div>
