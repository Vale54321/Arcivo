<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { api, ApiError, type Document, type DocumentDetails, type SearchResult } from '$lib/api';
	import { documentViewer, uploadOpen, searchQuery } from '$lib/stores';
	import { events } from '$lib/events';
	import { getAccessToken } from '$lib/auth';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import ActiveSearchBanner from '$lib/components/documents/ActiveSearchBanner.svelte';
	import DocumentContextMenu from '$lib/components/documents/DocumentContextMenu.svelte';
	import DocumentInfoModal from '$lib/components/documents/DocumentInfoModal.svelte';
	import DocumentsGrid from '$lib/components/documents/DocumentsGrid.svelte';
	import DocumentsList from '$lib/components/documents/DocumentsList.svelte';
	import DocumentsPageHeader from '$lib/components/documents/DocumentsPageHeader.svelte';
	import DragDropOverlay from '$lib/components/documents/DragDropOverlay.svelte';
	import UploadToastPanel from '$lib/components/documents/UploadToastPanel.svelte';
	import {
		formatSize,
		mimeIcon,
		mimeLabel,
		truncateFilename
	} from '$lib/components/documents/document-formatters';

	let fileInput = $state<HTMLInputElement | null>(null);
	let docs = $state<Document[]>([]);
	let loading = $state(true);
	let pendingFile = $state<string | null>(null);
	let checksumming = $state(false);
	let uploadProgress = $state(0);
	let uploadResults = $state<{ msg: string; type: 'success' | 'error' | 'info' }[]>([]);
	let dragOver = $state(false);
	let activeSearch = $state('');
	let searchResults = $state<SearchResult[]>([]);
	let searchLoading = $state(false);
	let viewMode = $state<'list' | 'grid'>(
		(typeof localStorage !== 'undefined'
			? (localStorage.getItem('arcivo:viewMode') as 'list' | 'grid')
			: null) ?? 'grid'
	);
	let confirmOpen = $state(false);
	let confirmDoc = $state<Document | null>(null);
	let deleteLoading = $state(false);
	let ctxMenu = $state<{ x: number; y: number; doc: Document } | null>(null);
	let infoDoc = $state<Document | DocumentDetails | null>(null);
	let thumbnailStates = $state<Record<string, 'pending' | 'failed'>>({});

	let displayDocs = $derived(activeSearch ? searchResults : docs);

	$effect(() => {
		if ($searchQuery) runSearch($searchQuery);
	});

	$effect(() => {
		if ($uploadOpen) {
			fileInput?.click();
			uploadOpen.set(false);
		}
	});

	onMount(() => {
		if (!getAccessToken()) {
			void goto(resolve('/login'), { replaceState: true });
			return;
		}
		void loadDocuments();

		const unsubscribeGenerated = events.on('document.thumbnail.generated', ({ documentId }) => {
			clearThumbnailState(documentId);
			docs = markThumbnailReady(docs, documentId);
			searchResults = markThumbnailReady(searchResults, documentId);
			if (infoDoc?.id === documentId) {
				infoDoc = { ...infoDoc, hasThumbnail: true };
			}
		});
		const unsubscribeFailed = events.on('document.thumbnail.failed', ({ documentId }) => {
			thumbnailStates = { ...thumbnailStates, [documentId]: 'failed' };
		});

		return () => {
			unsubscribeGenerated();
			unsubscribeFailed();
		};
	});

	function clearThumbnailState(documentId: string) {
		const nextStates = { ...thumbnailStates };
		delete nextStates[documentId];
		thumbnailStates = nextStates;
	}

	function markThumbnailReady<T extends Document>(documents: T[], documentId: string): T[] {
		return documents.map((document) =>
			document.id === documentId ? { ...document, hasThumbnail: true } : document
		);
	}

	async function runSearch(query: string) {
		activeSearch = query;
		searchLoading = true;
		try {
			searchResults = await api.searchDocuments(query);
		} catch {
			searchResults = [];
		} finally {
			searchLoading = false;
		}
	}

	function clearSearch() {
		activeSearch = '';
		searchResults = [];
		searchQuery.set('');
	}

	function setViewMode(mode: 'list' | 'grid') {
		viewMode = mode;
		localStorage.setItem('arcivo:viewMode', mode);
	}

	function onPageDragEnter(e: DragEvent) {
		if (e.dataTransfer?.types.includes('Files')) dragOver = true;
	}

	function onPageDragLeave(e: DragEvent) {
		if ((e.target as HTMLElement)?.nodeName === 'HTML' || (e.clientX === 0 && e.clientY === 0)) {
			dragOver = false;
		}
	}

	function onPageDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onPageDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const files = e.dataTransfer?.files;
		if (files?.length) uploadFiles(files);
	}

	async function loadDocuments(showSkeleton = true) {
		if (showSkeleton) loading = true;
		try {
			docs = await api.getDocuments();
		} catch (error) {
			console.error('Fehler beim Laden:', error);
		} finally {
			if (showSkeleton) loading = false;
		}
	}

	function saveBlob(blob: Blob, filename: string) {
		const anchor = document.createElement('a');
		anchor.href = URL.createObjectURL(blob);
		anchor.download = filename;
		anchor.click();
		URL.revokeObjectURL(anchor.href);
	}

	function openArchive(doc: Document) {
		documentViewer.set({ doc });
		if (window.location.pathname !== `/documents/${encodeURIComponent(doc.id)}/`) {
			void goto(resolve(`/documents/${encodeURIComponent(doc.id)}/`));
		}
	}

	async function downloadArchive(doc: Document) {
		try {
			saveBlob(await api.downloadArchive(doc.id), doc.name + '.pdf');
		} catch (error) {
			console.error('Archiv konnte nicht heruntergeladen werden:', error);
		}
	}

	async function downloadOriginal(doc: Document) {
		try {
			saveBlob(await api.downloadOriginal(doc.id), doc.name);
		} catch (error) {
			console.error('Original konnte nicht heruntergeladen werden:', error);
		}
	}

	function promptDelete(doc: Document, e: MouseEvent) {
		e.stopPropagation();
		confirmDoc = doc;
		confirmOpen = true;
	}

	function promptDeleteFromContext(doc: Document) {
		confirmDoc = doc;
		confirmOpen = true;
	}

	async function confirmDelete() {
		if (!confirmDoc) return;
		deleteLoading = true;
		try {
			await api.deleteDocument(confirmDoc.id);
			docs = docs.filter((doc) => doc.id !== confirmDoc!.id);
			if (activeSearch) searchResults = searchResults.filter((doc) => doc.id !== confirmDoc!.id);
			confirmOpen = false;
			confirmDoc = null;
		} catch (error) {
			console.error('Löschen fehlgeschlagen:', error);
		} finally {
			deleteLoading = false;
		}
	}

	async function uploadFiles(files: FileList) {
		uploadResults = [];
		for (const file of Array.from(files)) {
			await uploadFile(file);
		}
	}

	async function computeChecksum(file: File): Promise<string> {
		const buffer = await file.arrayBuffer();
		return new Promise<string>((resolve, reject) => {
			const worker = new Worker(new URL('$lib/checksum.worker.ts', import.meta.url), {
				type: 'module'
			});
			worker.onmessage = (e: MessageEvent<string>) => {
				worker.terminate();
				resolve(e.data);
			};
			worker.onerror = (e) => {
				worker.terminate();
				reject(e);
			};
			worker.postMessage(buffer, [buffer]);
		});
	}

	async function uploadFile(file: File) {
		pendingFile = file.name;
		uploadProgress = 0;
		checksumming = true;
		const checksum = await computeChecksum(file);
		checksumming = false;

		try {
			const result = await api.uploadDocument(file, {
				checksum,
				onProgress: (percent) => {
					uploadProgress = percent;
				}
			});
			if (result.status === 'duplicate') {
				uploadResults = [
					...uploadResults,
					{ msg: `"${file.name}" existiert bereits.`, type: 'info' }
				];
			} else {
				thumbnailStates = { ...thumbnailStates, [result.id]: 'pending' };
				uploadResults = [
					...uploadResults,
					{ msg: `"${file.name}" erfolgreich hochgeladen!`, type: 'success' }
				];
			}
			void loadDocuments(false);
		} catch (error) {
			const msg =
				error instanceof ApiError
					? `Fehler ${error.status}: ${error.message}`
					: (error as Error).message;
			uploadResults = [...uploadResults, { msg, type: 'error' }];
		} finally {
			checksumming = false;
			pendingFile = null;
			uploadProgress = 0;
		}
	}

	function onFileChange() {
		if (fileInput?.files?.length) uploadFiles(fileInput.files);
	}

	function openContextMenu(e: MouseEvent, doc: Document) {
		e.preventDefault();
		e.stopPropagation();
		ctxMenu = { x: e.clientX, y: e.clientY, doc };
	}

	function closeContextMenu() {
		ctxMenu = null;
	}

	async function openInfo(doc: Document) {
		infoDoc = doc;
		try {
			const full = await api.getDocument(doc.id);
			infoDoc = full;
		} catch {
			infoDoc = doc;
		}
	}

	function removeUploadResult(index: number) {
		uploadResults = uploadResults.filter((_, currentIndex) => currentIndex !== index);
	}
</script>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Dokument löschen"
	message={confirmDoc ? `„${confirmDoc.name}" wird unwiderruflich gelöscht.` : ''}
	confirmLabel="Löschen"
	loading={deleteLoading}
	onConfirm={confirmDelete}
	onCancel={() => {
		confirmOpen = false;
		confirmDoc = null;
	}}
/>

<DocumentsPageHeader
	{activeSearch}
	documentCount={docs.length}
	resultCount={searchResults.length}
	{viewMode}
	onSetViewMode={setViewMode}
/>

<input type="file" multiple bind:this={fileInput} onchange={onFileChange} class="sr-only" />

<ActiveSearchBanner {activeSearch} {searchLoading} onClear={clearSearch} />

<svelte:window
	ondragenter={onPageDragEnter}
	ondragleave={onPageDragLeave}
	ondragover={onPageDragOver}
	ondrop={onPageDrop}
/>

<div class="flex min-h-0 flex-col {viewMode === 'list' ? 'flex-1' : ''}">
	<DragDropOverlay
		visible={dragOver}
		onFilesDropped={uploadFiles}
		onClose={() => (dragOver = false)}
	/>

	{#if viewMode === 'list'}
		<DocumentsList
			docs={displayDocs}
			{loading}
			{activeSearch}
			{mimeIcon}
			{mimeLabel}
			{formatSize}
			thumbnailStatus={(id) => thumbnailStates[id] ?? null}
			onOpenArchive={openArchive}
			onOpenContextMenu={openContextMenu}
			onDownloadArchive={downloadArchive}
			onDownloadOriginal={downloadOriginal}
			onDelete={promptDelete}
		/>
	{:else}
		<DocumentsGrid
			docs={displayDocs}
			{loading}
			{activeSearch}
			{mimeIcon}
			{formatSize}
			{truncateFilename}
			thumbnailStatus={(id) => thumbnailStates[id] ?? null}
			onOpenArchive={openArchive}
			onOpenContextMenu={openContextMenu}
			onDownloadArchive={downloadArchive}
			onDownloadOriginal={downloadOriginal}
			onDelete={promptDelete}
		/>
	{/if}
</div>

<DocumentContextMenu
	state={ctxMenu}
	onClose={closeContextMenu}
	onOpenArchive={openArchive}
	onDownloadOriginal={downloadOriginal}
	onOpenInfo={openInfo}
	onDelete={promptDeleteFromContext}
/>

<UploadToastPanel
	{pendingFile}
	{checksumming}
	{uploadProgress}
	{uploadResults}
	onDismiss={removeUploadResult}
/>

<DocumentInfoModal {infoDoc} {mimeIcon} {mimeLabel} {formatSize} onClose={() => (infoDoc = null)} />
