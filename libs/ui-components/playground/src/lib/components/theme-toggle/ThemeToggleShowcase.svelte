<script lang="ts">
	import ThemeToggleVariants from './examples/ThemeToggleVariants.svelte';
	import { exampleCode } from '../../shared/exampleCode';
	import Section from '../../shared/Section.svelte';
</script>

<Section title="Variants" description="Use the binary control where only light and dark are stored. Enable system mode when the application supports an inherited preference." code={exampleCode('ThemeToggleVariants.svelte')}>
	<ThemeToggleVariants />
</Section>
