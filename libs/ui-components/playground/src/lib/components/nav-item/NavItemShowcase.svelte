<script lang="ts">
	import NavItemLinks from './examples/NavItemLinks.svelte';
	import NavItemInitial from './examples/NavItemInitial.svelte';
	import NavItemSelectable from './examples/NavItemSelectable.svelte';
	import NavItemUnavailable from './examples/NavItemUnavailable.svelte';
	import { exampleCode } from '../../shared/exampleCode';
	import Section from '../../shared/Section.svelte';
</script>

<div class="space-y-5">
	<div class="grid gap-5 lg:grid-cols-2">
		<Section
			title="Application navigation"
			description="Use NavItem for routed sidebar links. Keep route resolution in the consuming application."
			code={exampleCode('NavItemLinks.svelte')}
		>
			<NavItemLinks />
		</Section>

		<Section
			title="Sidebar navigation without icons"
			description="Omit the leading snippet for compact text-only component navigation, as used by this playbook sidebar."
			code={exampleCode('NavItemSelectable.svelte')}
		>
			<NavItemSelectable />
		</Section>
	</div>

	<Section
		title="Sidebar navigation with initials"
		description="Use the initial option for a compact text tile, as used by the playbook sidebar."
		code={exampleCode('NavItemInitial.svelte')}
	>
		<NavItemInitial />
	</Section>

	<Section
		title="Unavailable destinations"
		description="Use a disabled item and a badge to communicate features that are not available yet."
		code={exampleCode('NavItemUnavailable.svelte')}
	>
		<NavItemUnavailable />
	</Section>
</div>
