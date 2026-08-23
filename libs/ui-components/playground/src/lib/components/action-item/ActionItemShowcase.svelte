<script lang="ts">
	import ActionItemContextMenu from './examples/ActionItemContextMenu.svelte';
	import ActionItemSearchResult from './examples/ActionItemSearchResult.svelte';
	import { exampleCode } from '../../shared/exampleCode';
	import Section from '../../shared/Section.svelte';
</script>

<div class="grid gap-5 lg:grid-cols-2">
	<Section
		title="Search result"
		description="Use rich child content and a trailing snippet for document metadata and search-match status."
		code={exampleCode('ActionItemSearchResult.svelte')}
	>
		<ActionItemSearchResult />
	</Section>

	<Section
		title="Context menu actions"
		description="Use the same row treatment for menu actions, including a destructive option."
		code={exampleCode('ActionItemContextMenu.svelte')}
	>
		<ActionItemContextMenu />
	</Section>
</div>
