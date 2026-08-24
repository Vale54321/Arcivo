<script lang="ts">
	import ComboboxAvatars from './examples/ComboboxAvatars.svelte';
	import ComboboxClearable from './examples/ComboboxClearable.svelte';
	import ComboboxDefault from './examples/ComboboxDefault.svelte';
	import ComboboxDisabled from './examples/ComboboxDisabled.svelte';
	import ComboboxGrouped from './examples/ComboboxGrouped.svelte';
	import ComboboxLimited from './examples/ComboboxLimited.svelte';
	import ComboboxMultiple from './examples/ComboboxMultiple.svelte';
	import ComboboxSearchable from './examples/ComboboxSearchable.svelte';
	import ComboboxSelectedFirst from './examples/ComboboxSelectedFirst.svelte';
	import { exampleCode } from '../../shared/exampleCode';
	import Section from '../../shared/Section.svelte';
</script>

<div class="space-y-5">
	<div class="grid gap-5 lg:grid-cols-2">
		<Section title="Single selection" description="The default combobox selects one item and closes after selection." code={exampleCode('ComboboxDefault.svelte')}>
			<ComboboxDefault />
		</Section>
		<Section title="Clearable selection" description="Allow a selected value to be cleared when the field is optional." code={exampleCode('ComboboxClearable.svelte')}>
			<ComboboxClearable />
		</Section>
		<Section title="Search" description="Search is opt-in. Use it for longer option lists." code={exampleCode('ComboboxSearchable.svelte')}>
			<ComboboxSearchable />
		</Section>
		<Section title="Disabled" description="Disabled comboboxes cannot be opened or changed." code={exampleCode('ComboboxDisabled.svelte')}>
			<ComboboxDisabled />
		</Section>
	</div>

	<Section title="Grouped options" description="Use groups to make a longer list easier to scan." code={exampleCode('ComboboxGrouped.svelte')}>
		<ComboboxGrouped />
	</Section>

	<div class="grid gap-5 lg:grid-cols-2">
		<Section title="Multiple selection" description="Set multiple to keep the menu open and select more than one item." code={exampleCode('ComboboxMultiple.svelte')}>
			<ComboboxMultiple />
		</Section>
		<Section title="Visible-item limit" description="Limit the number of initially displayed choices." code={exampleCode('ComboboxLimited.svelte')}>
			<ComboboxLimited />
		</Section>
		<Section title="Selected options first" description="Keep the natural option order by default; opt in to move selected options to the top." code={exampleCode('ComboboxSelectedFirst.svelte')}>
			<ComboboxSelectedFirst />
		</Section>
	</div>

	<Section title="Avatars and subtitles" description="Options can include initials or image URLs, plus supporting text." code={exampleCode('ComboboxAvatars.svelte')}>
		<ComboboxAvatars />
	</Section>
</div>
