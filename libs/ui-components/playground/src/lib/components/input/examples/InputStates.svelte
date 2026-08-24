<script lang="ts">
	import { Input } from '../../../../../../src';
</script>

<div class="grid max-w-2xl gap-5 sm:grid-cols-2">
	<Input label="Disabled" value="Unavailable" disabled hint="This field cannot be changed." />
	<Input label="Read-only" value="account@arcivo.app" readonly hint="Managed by your identity provider." />
</div>
