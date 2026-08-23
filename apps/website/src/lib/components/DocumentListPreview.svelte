<script lang="ts">
	import { Archive, Download, File as FileIcon, FileImage, FileSpreadsheet, FileText, Trash2 } from '@lucide/svelte';
	import { Button } from '@arcivo/ui-components';

	type DemoDocument = {
		id: string;
		name: string;
		mimeType: string;
		size: number;
		fileCreatedAt: string;
	};

	const documents: DemoDocument[] = [
		{
			id: 'q4-report',
			name: 'Q4 Financial Report 2025.pdf',
			mimeType: 'application/pdf',
			size: 2_516_582,
			fileCreatedAt: '2025-12-14'
		},
		{
			id: 'project-proposal',
			name: 'Project Proposal — Arcivo.docx',
			mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			size: 188_416,
			fileCreatedAt: '2026-01-08'
		},
		{
			id: 'budget-overview',
			name: 'Budget Overview 2026.xlsx',
			mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			size: 99_328,
			fileCreatedAt: '2026-01-11'
		},
		{
			id: 'architecture-diagram',
			name: 'Architecture Diagram v3.png',
			mimeType: 'image/png',
			size: 1_153_434,
			fileCreatedAt: '2026-01-16'
		},
		{
			id: 'employee-handbook',
			name: 'Employee Handbook 2025.pdf',
			mimeType: 'application/pdf',
			size: 5_872_026,
			fileCreatedAt: '2026-01-22'
		}
	];

	let openedDocument = $state<string | null>(null);

	function mimeIcon(mimeType: string) {
		if (mimeType.startsWith('image/')) return FileImage;
		if (mimeType.includes('pdf')) return FileText;
		if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileSpreadsheet;
		return FileIcon;
	}

	function mimeLabel(mimeType: string): string {
		const map: Record<string, string> = {
			'application/pdf': 'PDF',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel'
		};

		return map[mimeType] ?? mimeType.split('/')[1]?.toUpperCase() ?? 'UNKNOWN';
	}

	function formatSize(bytes: number): string {
		if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + ' MB';
		if (bytes >= 1_024) return (bytes / 1024).toFixed(0) + ' KB';
		return bytes + ' B';
	}

	function openArchive(document: DemoDocument) {
		openedDocument = document.name;
	}

	function stopAction(event: MouseEvent) {
		event.stopPropagation();
	}
</script>

<div
	class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
>
	<table class="flex min-h-0 w-full flex-1 table-fixed flex-col text-sm">
		<thead class="block w-full">
			<tr class="flex border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
				<th
					class="w-14 shrink-0 px-4 py-3 text-left text-xs font-medium tracking-wider text-neutral-400 uppercase dark:text-neutral-500"
				></th>
				<th
					class="min-w-0 flex-1 px-4 py-3 text-left text-xs font-medium tracking-wider text-neutral-400 uppercase dark:text-neutral-500"
					>Name</th
				>
				<th
					class="w-28 shrink-0 px-4 py-3 text-left text-xs font-medium tracking-wider text-neutral-400 uppercase dark:text-neutral-500"
					>Typ</th
				>
				<th
					class="w-24 shrink-0 px-4 py-3 text-left text-xs font-medium tracking-wider text-neutral-400 uppercase dark:text-neutral-500"
					>Größe</th
				>
				<th
					class="w-36 shrink-0 px-4 py-3 text-left text-xs font-medium tracking-wider text-neutral-400 uppercase dark:text-neutral-500"
					>Erstellt am</th
				>
				<th class="w-24 shrink-0 px-4 py-3"></th>
			</tr>
		</thead>
		<tbody class="block min-h-0 w-full flex-1 overflow-y-auto">
			{#each documents as document (document.id)}
				{@const Icon = mimeIcon(document.mimeType)}
				<tr
					class="group flex cursor-pointer items-center border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-800/60 dark:hover:bg-neutral-800/40"
					onclick={() => openArchive(document)}
				>
					<td class="w-14 shrink-0 px-4 py-3">
						<span
							class="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
						>
							<Icon size={16} />
						</span>
					</td>
					<td class="min-w-0 flex-1 truncate px-4 py-3 font-medium text-neutral-800 dark:text-neutral-200">
						{document.name}
					</td>
					<td class="w-28 shrink-0 px-4 py-3">
						<span
							class="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
						>
							{mimeLabel(document.mimeType)}
						</span>
					</td>
					<td class="w-24 shrink-0 px-4 py-3 text-neutral-500">{formatSize(document.size)}</td>
					<td class="w-36 shrink-0 px-4 py-3 text-neutral-500">
						{new Date(document.fileCreatedAt).toLocaleDateString('de-DE')}
					</td>
					<td class="w-24 shrink-0 px-4 py-3">
						<div
							class="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<Button
								variant="ghost"
								iconOnly
								size="sm"
								onclick={stopAction}
								title="Archivversion herunterladen"
								aria-label="Archivversion herunterladen"
							>
								<Archive size={14} />
							</Button>
							<Button
								variant="ghost"
								iconOnly
								size="sm"
								onclick={stopAction}
								title="Original herunterladen"
								aria-label="Original herunterladen"
							>
								<Download size={14} />
							</Button>
							<Button
								variant="danger-hint"
								iconOnly
								size="sm"
								onclick={stopAction}
								title="Löschen"
								aria-label="Löschen"
							>
								<Trash2 size={14} />
							</Button>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if openedDocument}
	<span class="sr-only" aria-live="polite">Preview selected: {openedDocument}</span>
{/if}
