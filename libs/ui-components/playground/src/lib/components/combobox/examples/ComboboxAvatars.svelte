<script lang="ts">
	import { Combobox, type ComboboxGroup } from '../../../../../../src';
	let value = $state<string | null>('marie');
	const groups: ComboboxGroup[] = [{ items: [
		{ id: 'marie', label: 'Marie Curie', subtitle: 'Administrator', imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"%3E%3Crect width="32" height="32" fill="%23fee2e2"/%3E%3Ctext x="16" y="21" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="%23b91c1c"%3EMC%3C/text%3E%3C/svg%3E' },
		{ id: 'ada', label: 'Ada Lovelace', subtitle: 'Editor', initials: 'AL' },
		{ id: 'grace', label: 'Grace Hopper', subtitle: 'Viewer', initials: 'GH' }
	] }];
</script>

<Combobox {groups} {value} onChange={(next) => (value = next as string | null)} />
