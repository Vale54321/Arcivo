<script lang="ts">
	import { Combobox, type ComboboxGroup } from '../../../../../../src';
	let value = $state<string | null>('may');
	const groups: ComboboxGroup[] = [{ items: ['January', 'February', 'March', 'April', 'May', 'June'].map((label) => ({ id: label.toLowerCase(), label })) }];
</script>

<Combobox {groups} {value} onChange={(next) => (value = next as string | null)} maxVisibleItems={3} searchable />
