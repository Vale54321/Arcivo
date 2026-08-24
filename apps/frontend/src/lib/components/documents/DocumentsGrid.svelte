<script lang="ts">
	import { Archive, Download, Trash2, File as FileIcon } from '@lucide/svelte';
	import type { Document } from '$lib/api';
	import { Button, Spinner } from '@arcivo/ui-components';
	import DocumentThumbnail from './DocumentThumbnail.svelte';

	let {
		docs,
		loading,
		activeSearch,
		mimeIcon,
		formatSize,
		truncateFilename,
		thumbnailStatus,
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
		thumbnailStatus: (id: string) => 'pending' | 'failed' | null;
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
				<div
					class="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
				>
					<div
						class="mb-3 aspect-square w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800"
					></div>
					<div
						class="mb-2 h-3.5 w-3/4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
					></div>
					<div class="h-3 w-1/2 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"></div>
				</div>
			{/each}
		</div>
	{:else if docs.length === 0}
		<div
			class="rounded-xl border border-neutral-200 bg-white px-4 py-16 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
		>
			{activeSearch ? `Keine Ergebnisse für „${activeSearch}".` : 'Noch keine Dokumente vorhanden.'}
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{#each docs as doc (doc.id)}
				{@const status = thumbnailStatus(doc.id)}
				<div
					role="listitem"
					class="group relative rounded-xl border border-neutral-200 bg-white p-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60"
					oncontextmenu={(e) => onOpenContextMenu(e, doc)}
				>
					<button
						class="mb-3 block w-full cursor-pointer overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800"
						onclick={() => onOpenArchive(doc)}
						title="Archivversion öffnen"
					>
						{#if doc.hasThumbnail}
							<DocumentThumbnail documentId={doc.id} class="aspect-square w-full object-cover" />
						{:else if status === 'pending'}
							<div
								class="flex aspect-square w-full items-center justify-center text-neutral-400 dark:text-neutral-500"
								title="Vorschau wird erstellt"
							>
								<Spinner size={24} />
							</div>
						{:else if status === 'failed'}
							<div
								class="flex aspect-square w-full items-center justify-center"
								title="Vorschau konnte nicht erstellt werden"
							>
								<span
									class="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-base font-bold text-red-600 dark:bg-red-950 dark:text-red-400"
									aria-label="Vorschau konnte nicht erstellt werden">!</span
								>
							</div>
						{:else}
							{@const Icon = mimeIcon(doc.mimeType)}
							<div
								class="flex aspect-square w-full items-center justify-center text-neutral-300 dark:text-neutral-600"
							>
								<Icon size={36} />
							</div>
						{/if}
					</button>
					<p class="text-sm font-medium text-neutral-800 dark:text-neutral-200" title={doc.name}>
						{truncateFilename(doc.name)}
					</p>
					<p class="mt-0.5 text-xs text-neutral-400">
						{formatSize(doc.size)} · {new Date(doc.fileCreatedAt).toLocaleDateString('de-DE')}
					</p>
					<div
						class="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
					>
						<Button
							variant="ghost"
							iconOnly
							size="sm"
							onclick={() => onDownloadArchive(doc)}
							title="Archivversion herunterladen"
						>
							<Archive size={13} />
						</Button>
						<Button
							variant="ghost"
							iconOnly
							size="sm"
							onclick={() => onDownloadOriginal(doc)}
							title="Original herunterladen"
						>
							<Download size={13} />
						</Button>
						<Button
							variant="danger-hint"
							iconOnly
							size="sm"
							onclick={(e) => onDelete(doc, e)}
							title="Löschen"
						>
							<Trash2 size={13} />
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
