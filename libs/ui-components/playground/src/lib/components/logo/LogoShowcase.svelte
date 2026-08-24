<script lang="ts">
	import LogoVariants from './examples/LogoVariants.svelte';
	import { exampleCode } from '../../shared/exampleCode';
	import Section from '../../shared/Section.svelte';
</script>

<Section title="Variants and sizes" description="Use the full lockup by default, the mark in compact spaces, and the wordmark when the symbol is already present." code={exampleCode('LogoVariants.svelte')}>
	<LogoVariants />
</Section>
