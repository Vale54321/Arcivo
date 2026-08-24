<script lang="ts">
	import { onMount } from 'svelte';
	import { Area, Combobox, Header, type ComboboxGroup } from '@arcivo/ui-components';
	import { getThemeContext } from '$lib/state/theme.svelte';

	type ViewMode = 'grid' | 'list';

	const theme = getThemeContext();
	let viewMode = $state<ViewMode>('grid');
	const themeOptions: ComboboxGroup[] = [
		{
			items: [
				{ id: 'system', label: 'System', subtitle: 'Systemeinstellung verwenden' },
				{ id: 'light', label: 'Hell', subtitle: 'Helle Darstellung' },
				{ id: 'dark', label: 'Dunkel', subtitle: 'Dunkle Darstellung' }
			]
		}
	];
	const viewOptions: ComboboxGroup[] = [
		{
			items: [
				{ id: 'grid', label: 'Raster', subtitle: 'Dokumente mit Vorschauen anzeigen' },
				{ id: 'list', label: 'Liste', subtitle: 'Dokumente kompakt auflisten' }
			]
		}
	];

	onMount(() => {
		const stored = localStorage.getItem('arcivo:viewMode');
		if (stored === 'grid' || stored === 'list') viewMode = stored;
	});

	function setTheme(value: string | string[] | null) {
		if (value === 'system' || value === 'light' || value === 'dark') theme.set(value);
	}

	function setViewMode(value: string | string[] | null) {
		if (value !== 'grid' && value !== 'list') return;
		viewMode = value;
		localStorage.setItem('arcivo:viewMode', value);
	}
</script>

<svelte:head>
	<title>Einstellungen · Arcivo</title>
</svelte:head>

<div class="mx-auto w-full max-w-3xl">
	<Header level={1} title="Einstellungen" description="Passe Arcivo an deine Arbeitsweise an." />

	<div class="space-y-6">
		<Area title="Darstellung" description="Wähle, wie Arcivo auf diesem Gerät dargestellt wird.">
			<label
				class="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
				for="theme-preference">Erscheinungsbild</label
			>
			<div class="mt-2">
				<Combobox
					id="theme-preference"
					groups={themeOptions}
					value={theme.current}
					onChange={setTheme}
					allowClear={false}
					searchPlaceholder="Darstellung suchen …"
				/>
			</div>
		</Area>

		<Area
			title="Dokumente"
			description="Lege fest, wie deine Dokumente beim Öffnen angezeigt werden."
		>
			<label
				class="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
				for="document-view">Standardansicht</label
			>
			<div class="mt-2">
				<Combobox
					id="document-view"
					groups={viewOptions}
					value={viewMode}
					onChange={setViewMode}
					allowClear={false}
					searchPlaceholder="Ansicht suchen …"
				/>
			</div>
		</Area>
	</div>
</div>
