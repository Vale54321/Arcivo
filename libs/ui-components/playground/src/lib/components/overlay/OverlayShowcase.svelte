<script lang="ts">
	import OverlayContextMenu from './examples/OverlayContextMenu.svelte';
	import OverlaySearchDialog from './examples/OverlaySearchDialog.svelte';
	import { exampleCode } from '../../shared/exampleCode';
	import Section from '../../shared/Section.svelte';
</script>

<div class="grid gap-5 lg:grid-cols-2">
	<Section
		title="Search dialog"
		description="The dimmed backdrop, dialog surface, outside click, and Escape dismissal come from one shared wrapper."
		code={exampleCode('OverlaySearchDialog.svelte')}
	>
		<OverlaySearchDialog />
	</Section>

	<Section
		title="Positioned context menu"
		description="The same wrapper supports a transparent dismiss layer and a surface positioned at the right-click coordinates."
		code={exampleCode('OverlayContextMenu.svelte')}
	>
		<OverlayContextMenu />
	</Section>
</div>
