<script lang="ts">
	import { Input } from '../../../../../../src';

	let email = $state('ada@example.com');
	let password = $state('super-secret');
</script>

<div class="grid max-w-2xl gap-5 sm:grid-cols-2">
	<Input
		bind:value={email}
		type="email"
		label="Email address"
		required
		hint="Used for account notifications."
	/>
	<Input
		bind:value={password}
		type="password"
		label="Password"
		required
		hint="Use at least 8 characters."
	/>
</div>
