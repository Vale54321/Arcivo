<script lang="ts">
	import { Combobox, type ComboboxGroup } from '../../../../../../src';
	let value = $state<string | null>('pdf');
	const groups: ComboboxGroup[] = [
		{ heading: 'Documents', items: [{ id: 'pdf', label: 'PDF' }, { id: 'docx', label: 'Word document' }] },
		{ heading: 'Images', items: [{ id: 'jpg', label: 'JPEG image' }, { id: 'png', label: 'PNG image' }] }
	];
</script>

<Combobox {groups} {value} onChange={(next) => (value = next as string | null)} />
