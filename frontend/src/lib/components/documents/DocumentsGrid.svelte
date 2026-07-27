<script lang="ts">
	import { Archive, Download, Trash2, File as FileIcon } from '@lucide/svelte';
	import type { Document } from '$lib/api';

	let {
		docs,
		loading,
		activeSearch,
		mimeIcon,
		formatSize,
		truncateFilename,
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
		formatSize: (bytes: number) => string;
		truncateFilename: (name: string, maxLength?: number) => string;
		thumbnailUrl: (id: string) => string;
		onOpenArchive: (doc: Document) => void;
		onOpenContextMenu: (e: MouseEvent, doc: Document) => void;
		onDownloadArchive: (doc: Document) => void;
		onDownloadOriginal: (doc: Document) => void;
		onDelete: (doc: Document, e: MouseEvent) => void;
	} = $props();
</script>

<div class="flex-1 overflow-y-auto">
	{#if loading}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{#each [1, 2, 3, 4, 5, 6, 7, 8] as card (card)}
				<div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3">
					<div class="mb-3 aspect-square w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
					<div class="mb-2 h-3.5 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
					<div class="h-3 w-1/2 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
				</div>
			{/each}
		</div>
	{:else if docs.length === 0}
		<div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-16 text-center text-sm text-neutral-400">
			{activeSearch ? `Keine Ergebnisse für „${activeSearch}".` : 'Noch keine Dokumente vorhanden.'}
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{#each docs as doc (doc.id)}
				<div
					role="listitem"
					class="group relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 transition-colors hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
					oncontextmenu={(e) => onOpenContextMenu(e, doc)}
				>
					<button
						class="mb-3 block w-full cursor-pointer overflow-hidden rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800"
						onclick={() => onOpenArchive(doc)}
						title="Archivversion öffnen"
					>
						{#if doc.hasThumbnail}
							<img
								src={thumbnailUrl(doc.id)}
								alt="Vorschau"
								class="aspect-square w-full object-cover"
								loading="lazy"
							/>
						{:else}
							{@const Icon = mimeIcon(doc.mimeType)}
							<div class="flex aspect-square w-full items-center justify-center text-neutral-300 dark:text-neutral-600">
								<Icon size={36} />
							</div>
						{/if}
					</button>
					<p class="text-sm font-medium text-neutral-800 dark:text-neutral-200" title={doc.name}>{truncateFilename(doc.name)}</p>
					<p class="mt-0.5 text-xs text-neutral-400">{formatSize(doc.size)} · {new Date(doc.fileCreatedAt).toLocaleDateString('de-DE')}</p>
					<div class="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
						<button
							onclick={() => onDownloadArchive(doc)}
							title="Archivversion herunterladen"
							class="flex items-center justify-center rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-100 transition-colors"
						>
							<Archive size={13} />
						</button>
						<button
							onclick={() => onDownloadOriginal(doc)}
							title="Original herunterladen"
							class="flex items-center justify-center rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-100 transition-colors"
						>
							<Download size={13} />
						</button>
						<button
							onclick={(e) => onDelete(doc, e)}
							title="Löschen"
							class="flex items-center justify-center rounded-md p-1.5 text-neutral-400 hover:bg-red-100 dark:hover:bg-red-900/60 hover:text-red-600 dark:hover:text-red-400 transition-colors"
						>
							<Trash2 size={13} />
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
