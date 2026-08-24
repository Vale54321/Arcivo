<script lang="ts">
	import { Combobox, type ComboboxGroup } from '../../../../../../src';
	let value = $state<string | null>(null);
	const groups: ComboboxGroup[] = [{ items: [{ id: 'grid', label: 'Grid view' }, { id: 'list', label: 'List view' }] }];
</script>

<Combobox {groups} {value} onChange={(next) => (value = next as string | null)} placeholder="Choose a view" allowClear={false} />
