<script lang="ts">
	import ModalDeleteConfirmation from './examples/ModalDeleteConfirmation.svelte';
	import ModalLogin from './examples/ModalLogin.svelte';
	import { exampleCode } from '../../shared/exampleCode';
	import Section from '../../shared/Section.svelte';
</script>

<div class="grid gap-5 lg:grid-cols-2">
	<Section
		title="Delete confirmation"
		description="Use a small modal with a clear destructive action. Dismissal can be disabled while work is in progress."
		code={exampleCode('ModalDeleteConfirmation.svelte')}
	>
		<ModalDeleteConfirmation />
	</Section>

	<Section
		title="Login form"
		description="A login dialog composes the same Modal with shared Input and Button components; the app’s login route uses this pattern."
		code={exampleCode('ModalLogin.svelte')}
	>
		<ModalLogin />
	</Section>
</div>
