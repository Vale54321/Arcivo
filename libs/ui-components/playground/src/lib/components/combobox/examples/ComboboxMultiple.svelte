<script lang="ts">
	import { Combobox, type ComboboxGroup } from '../../../../../../src';
	let value = $state<string[]>(['finance']);
	const groups: ComboboxGroup[] = [{ items: [{ id: 'finance', label: 'Finance' }, { id: 'legal', label: 'Legal' }, { id: 'personal', label: 'Personal' }] }];
</script>

<Combobox {groups} {value} onChange={(next) => (value = next as string[])} multiple placeholder="Choose tags" />
