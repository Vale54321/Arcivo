<script lang="ts">
	import { Archive, Download, Trash2, File as FileIcon } from '@lucide/svelte';
	import type { Document } from '$lib/api';

	let {
		docs,
		loading,
		activeSearch,
		mimeIcon,
		mimeLabel,
		formatSize,
		thumbnailUrl,
		onOpenArchive,
		onOpenContextMenu,
		onDownloadArchive,
		onDownloadOriginal,
		onDelete
	}: {
		docs: Document[];
		loading: boolean;
		activeSearch: string;
		mimeIcon: (mimeType: string) => typeof FileIcon;
		mimeLabel: (mimeType: string) => string;
		formatSize: (bytes: number) => string;
		thumbnailUrl: (id: string) => string;
		onOpenArchive: (doc: Document) => void;
		onOpenContextMenu: (e: MouseEvent, doc: Document) => void;
		onDownloadArchive: (doc: Document) => void;
		onDownloadOriginal: (doc: Document) => void;
		onDelete: (doc: Document, e: MouseEvent) => void;
	} = $props();
</script>

<div
	class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
>
	<table class="flex min-h-0 w-full flex-1 table-fixed flex-col text-sm">
		<thead class="block w-full">
			<tr
				class="flex border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
			>
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
			{#if loading}
				{#each [1, 2, 3] as row (row)}
					<tr class="flex items-center border-b border-neutral-100 dark:border-neutral-800/60">
						<td class="w-14 shrink-0 px-4 py-3"
							><div
								class="h-9 w-9 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800"
							></div></td
						>
						<td class="min-w-0 flex-1 px-4 py-3"
							><div
								class="h-3.5 w-48 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
							></div></td
						>
						<td class="w-28 shrink-0 px-4 py-3"
							><div
								class="h-3.5 w-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
							></div></td
						>
						<td class="w-24 shrink-0 px-4 py-3"
							><div
								class="h-3.5 w-14 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
							></div></td
						>
						<td class="w-36 shrink-0 px-4 py-3"
							><div
								class="h-3.5 w-20 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
							></div></td
						>
						<td class="w-24 shrink-0 px-4 py-3"></td>
					</tr>
				{/each}
			{:else if docs.length === 0}
				<tr class="flex">
					<td class="flex-1 px-4 py-16 text-center text-sm text-neutral-400">
						{activeSearch
							? `Keine Ergebnisse für „${activeSearch}".`
							: 'Noch keine Dokumente vorhanden.'}
					</td>
				</tr>
			{:else}
				{#each docs as doc (doc.id)}
					<tr
						class="group flex cursor-pointer items-center border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-800/60 dark:hover:bg-neutral-800/40"
						onclick={() => onOpenArchive(doc)}
						oncontextmenu={(e) => onOpenContextMenu(e, doc)}
					>
						<td class="w-14 shrink-0 px-4 py-3">
							{#if doc.hasThumbnail}
								<img
									src={thumbnailUrl(doc.id)}
									alt="Vorschau"
									width="36"
									height="36"
									class="h-9 w-9 shrink-0 rounded-md border border-neutral-200 object-cover dark:border-neutral-700"
									loading="lazy"
								/>
							{:else}
								{@const Icon = mimeIcon(doc.mimeType)}
								<span
									class="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
								>
									<Icon size={16} />
								</span>
							{/if}
						</td>
						<td
							class="min-w-0 flex-1 truncate px-4 py-3 font-medium text-neutral-800 dark:text-neutral-200"
							>{doc.name}</td
						>
						<td class="w-28 shrink-0 px-4 py-3">
							<span
								class="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
							>
								{mimeLabel(doc.mimeType)}
							</span>
						</td>
						<td class="w-24 shrink-0 px-4 py-3 text-neutral-500">{formatSize(doc.size)}</td>
						<td class="w-36 shrink-0 px-4 py-3 text-neutral-500"
							>{new Date(doc.fileCreatedAt).toLocaleDateString('de-DE')}</td
						>
						<td class="w-24 shrink-0 px-4 py-3">
							<div
								class="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100"
							>
								<button
									onclick={(e) => {
										e.stopPropagation();
										onDownloadArchive(doc);
									}}
									title="Archivversion herunterladen"
									class="flex items-center justify-center rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
								>
									<Archive size={14} />
								</button>
								<button
									onclick={(e) => {
										e.stopPropagation();
										onDownloadOriginal(doc);
									}}
									title="Original herunterladen"
									class="flex items-center justify-center rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
								>
									<Download size={14} />
								</button>
								<button
									onclick={(e) => onDelete(doc, e)}
									title="Löschen"
									class="flex items-center justify-center rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/60 dark:hover:text-red-400"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
