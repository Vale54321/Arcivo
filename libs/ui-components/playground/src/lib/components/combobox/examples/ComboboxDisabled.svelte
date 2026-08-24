<script lang="ts">
	import { Combobox, type ComboboxGroup } from '../../../../../../src';
	const groups: ComboboxGroup[] = [{ items: [{ id: 'archive', label: 'Archive' }] }];
</script>

<Combobox {groups} value="archive" onChange={() => {}} disabled />
