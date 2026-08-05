<script lang="ts">
	import { onMount } from 'svelte';
	import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
	import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
	import type { Document } from '$lib/api';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import PdfPage from './pdf-viewer/PdfPage.svelte';
	import PdfSearchPanel from './pdf-viewer/PdfSearchPanel.svelte';
	import PdfViewerError from './pdf-viewer/PdfViewerError.svelte';
	import PdfViewerHeader from './pdf-viewer/PdfViewerHeader.svelte';
	import PdfViewerToolbar from './pdf-viewer/PdfViewerToolbar.svelte';
	import { PdfSearchController } from './pdf-viewer/pdf-search.svelte';
	import type { PdfJs } from './pdf-viewer/pdf-viewer-types';
	import './pdf-viewer/pdf-viewer.css';

	let {
		doc,
		src,
		searchQuery,
		onClose
	}: {
		doc: Document;
		src: string;
		searchQuery?: string;
		onClose: () => void;
	} = $props();

	let pdfjs = $state<PdfJs>();
	let pdfDocument = $state<PDFDocumentProxy>();
	let loadingTask: PDFDocumentLoadingTask | undefined;

	let pageNumber = $state(1);
	let pageCount = $state(0);
	let zoom = $state(100);
	let rotation = $state(0);
	let fitMode = $state<'height' | 'width' | 'custom'>('height');
	let searchOpen = $state(false);
	let loadFailed = $state(false);
	let errorMessage = $state('');

	const search = new PdfSearchController((page) => {
		pageNumber = page;
	});

	onMount(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		window.addEventListener('wheel', onWheel, { passive: false });
		void loadDocument();

		return () => {
			search.destroy();
			void loadingTask?.destroy();
			window.removeEventListener('wheel', onWheel);
			document.body.style.overflow = previousOverflow;
		};
	});

	async function loadDocument(): Promise<void> {
		try {
			const loadedPdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
			loadedPdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
			loadingTask = loadedPdfjs.getDocument({ url: src });
			const loadedDocument = await loadingTask.promise;

			pdfjs = loadedPdfjs;
			pdfDocument = loadedDocument;
			pageCount = loadedDocument.numPages;

			const initialSearch = searchQuery?.trim() ?? '';
			if (initialSearch) {
				searchOpen = true;
				search.input = initialSearch;
				await search.run(loadedDocument, initialSearch);
			}
		} catch (error) {
			showError(error instanceof Error ? error.message : 'Unbekannter Fehler');
		}
	}

	function setPage(value: number): void {
		pageNumber = Math.min(pageCount, Math.max(1, Math.round(value) || 1));
	}

	function changeZoom(delta: number): void {
		fitMode = 'custom';
		zoom = Math.min(300, Math.max(25, zoom + delta));
	}

	function resetZoom(): void {
		fitMode = 'custom';
		zoom = 100;
	}

	function toggleSearch(): void {
		searchOpen = !searchOpen;
		if (!searchOpen) search.clear();
	}

	function onKeydown(event: KeyboardEvent): void {
		const hasZoomModifier = event.ctrlKey || event.metaKey;
		if (hasZoomModifier && event.key.toLocaleLowerCase() === 'f') {
			event.preventDefault();
			searchOpen = true;
			requestAnimationFrame(() => document.getElementById('arcivo-pdf-search')?.focus());
			return;
		}

		if (hasZoomModifier && (event.key === '+' || event.key === '=')) {
			event.preventDefault();
			changeZoom(25);
			return;
		}

		if (hasZoomModifier && (event.key === '-' || event.key === '_')) {
			event.preventDefault();
			changeZoom(-25);
			return;
		}

		if (hasZoomModifier && event.key === '0') {
			event.preventDefault();
			resetZoom();
			return;
		}

		if (event.key === 'Escape') {
			if (searchOpen) toggleSearch();
			else onClose();
		}
	}

	function onWheel(event: WheelEvent): void {
		if (!(event.ctrlKey || event.metaKey) || event.deltaY === 0) return;
		event.preventDefault();
		changeZoom(event.deltaY < 0 ? 10 : -10);
	}

	function openInNewTab(): void {
		window.open(`/documents/${encodeURIComponent(doc.id)}/`, '_blank', 'noopener,noreferrer');
	}

	function download(): void {
		const anchor = document.createElement('a');
		anchor.href = src;
		anchor.download = doc.name;
		anchor.rel = 'noopener';
		anchor.click();
	}

	function showError(message: string): void {
		loadFailed = true;
		errorMessage = message;
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="fixed inset-0 z-50 bg-black/70 p-2 backdrop-blur-sm sm:p-4">
	<div
		role="dialog"
		aria-modal="true"
		aria-label={`Dokument ${doc.name}`}
		class="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
	>
		<header class="shrink-0 border-b border-neutral-200 dark:border-neutral-800">
			<PdfViewerHeader
				documentName={doc.name}
				onOpenInNewTab={openInNewTab}
				onDownload={download}
				{onClose}
			/>
			<PdfViewerToolbar
				{pageNumber}
				{pageCount}
				{zoom}
				fitToWidth={fitMode === 'width'}
				fitToHeight={fitMode === 'height'}
				{searchOpen}
				onSetPage={setPage}
				onChangeZoom={changeZoom}
				onResetZoom={resetZoom}
				onFitToWidth={() => (fitMode = 'width')}
				onRotate={() => (rotation = (rotation + 90) % 360)}
				onToggleSearch={toggleSearch}
			/>
		</header>

		<div class="relative flex min-h-0 flex-1 overflow-hidden">
			{#if loadFailed}
				<PdfViewerError message={errorMessage} onOpenInNewTab={openInNewTab} />
			{:else if pdfjs && pdfDocument}
				<PdfPage
					{pdfjs}
					document={pdfDocument}
					{pageNumber}
					{zoom}
					{rotation}
					{fitMode}
					query={search.query}
					pageTextCache={search.pageTextCache}
					onError={showError}
				/>
			{:else}
				<div
					class="flex min-w-0 flex-1 items-center justify-center bg-neutral-100 dark:bg-neutral-950"
				>
					<div class="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
						<Spinner size={18} /><span>PDF wird geladen …</span>
					</div>
				</div>
			{/if}

			{#if searchOpen}
				<PdfSearchPanel
					bind:input={search.input}
					status={search.status}
					results={search.results}
					currentIndex={search.currentIndex}
					onSearch={() => search.schedule(pdfDocument)}
					onClose={toggleSearch}
					onMove={(direction) => search.move(direction)}
					onSelect={(index) => search.select(index)}
				/>
			{/if}
		</div>
	</div>
</div>
