<script lang="ts">
	import { Combobox, type ComboboxGroup } from '../../../../../../src';
	let value = $state<string | null>('normal');
	const groups: ComboboxGroup[] = [{ items: [{ id: 'low', label: 'Low' }, { id: 'normal', label: 'Normal' }, { id: 'high', label: 'High' }] }];
</script>

<Combobox {groups} {value} onChange={(next) => (value = next as string | null)} placeholder="No priority" />
