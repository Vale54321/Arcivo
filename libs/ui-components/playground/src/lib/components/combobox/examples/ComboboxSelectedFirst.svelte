<script lang="ts">
	import { Combobox, type ComboboxGroup } from '../../../../../../src';
	let value = $state<string[]>(['finance']);
	const groups: ComboboxGroup[] = [{ items: [{ id: 'personal', label: 'Personal' }, { id: 'finance', label: 'Finance' }, { id: 'legal', label: 'Legal' }] }];
</script>

<Combobox {groups} {value} onChange={(next) => (value = next as string[])} multiple selectedFirst />
