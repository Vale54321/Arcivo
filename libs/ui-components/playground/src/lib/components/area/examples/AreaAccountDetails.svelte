<script lang="ts">
	import { Area, Button, Input } from '../../../../../../src';
</script>

<Area title="Account details">
	<div class="grid max-w-2xl gap-4 sm:grid-cols-2">
		<Input label="Display name" value="Ada Lovelace" />
		<Input label="Email address" value="ada@example.com" type="email" />
	</div>
	<div class="mt-5 flex justify-end">
		<Button variant="primary">Save changes</Button>
	</div>
</Area>
