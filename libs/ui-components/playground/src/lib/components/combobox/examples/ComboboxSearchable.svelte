<script lang="ts">
	import { Combobox, type ComboboxGroup } from '../../../../../../src';
	let value = $state<string | null>(null);
	const groups: ComboboxGroup[] = [{ items: ['Berlin', 'Hamburg', 'Köln', 'München', 'Stuttgart', 'Wien'].map((label) => ({ id: label.toLowerCase(), label })) }];
</script>

<Combobox {groups} {value} onChange={(next) => (value = next as string | null)} placeholder="Choose a city" searchable searchPlaceholder="Search cities …" />
