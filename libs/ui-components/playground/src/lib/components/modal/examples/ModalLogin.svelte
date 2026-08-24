<script lang="ts">
	import { Button, Input, Modal } from '../../../../../../src';

	let open = $state(false);
	let email = $state('');
	let password = $state('');
	let submitting = $state(false);

	function close(): void {
		if (!submitting) open = false;
	}

	function submit(): void {
		if (submitting) return;
		submitting = true;
		window.setTimeout(() => {
			submitting = false;
			open = false;
		}, 1000);
	}
</script>

<Button variant="outline" onclick={() => (open = true)}>Open login dialog</Button>

<Modal
	{open}
	onClose={close}
	title="Sign in"
	size="sm"
	dismissOnEscape={!submitting}
	dismissOnBackdrop={!submitting}
>
	<form
		id="modal-login-form"
		class="space-y-4"
		onsubmit={(event) => {
			event.preventDefault();
			submit();
		}}
	>
		<Input
			bind:value={email}
			label="Email address"
			type="email"
			autocomplete="email"
			required
			placeholder="name@example.com"
		/>
		<Input
			bind:value={password}
			label="Password"
			type="password"
			autocomplete="current-password"
			required
		/>
	</form>

	{#snippet footer()}
		<Button variant="secondary" onclick={close} disabled={submitting}>Cancel</Button>
		<Button form="modal-login-form" type="submit" variant="primary" loading={submitting}>
			Sign in
		</Button>
	{/snippet}
</Modal>
