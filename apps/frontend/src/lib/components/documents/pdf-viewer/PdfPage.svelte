<script lang="ts">
	import { onMount } from 'svelte';
	import type { PDFDocumentProxy, RenderTask, TextLayer } from 'pdfjs-dist';
	import { Spinner } from '@arcivo/ui-components';
	import type { PdfJs } from './pdf-viewer-types';

	let {
		pdfjs,
		document,
		pageNumber,
		zoom,
		rotation,
		fitMode,
		query,
		pageTextCache,
		onError
	}: {
		pdfjs: PdfJs;
		document: PDFDocumentProxy;
		pageNumber: number;
		zoom: number;
		rotation: number;
		fitMode: 'height' | 'width' | 'custom';
		query: string;
		pageTextCache: Map<number, string>;
		onError: (message: string) => void;
	} = $props();

	let canvasElement = $state<HTMLCanvasElement>();
	let textLayerElement = $state<HTMLDivElement>();
	let viewerElement = $state<HTMLDivElement>();
	let viewerWidth = $state(0);
	let viewerHeight = $state(0);
	let pageWidth = $state(0);
	let pageHeight = $state(0);
	let ready = $state(false);
	let renderTask: RenderTask | undefined;
	let textLayer: TextLayer | undefined;
	let renderGeneration = 0;

	onMount(() => {
		const resizeObserver = new ResizeObserver(([entry]) => {
			viewerWidth = entry.contentRect.width;
			viewerHeight = entry.contentRect.height;
		});
		if (viewerElement) resizeObserver.observe(viewerElement);

		return () => {
			resizeObserver.disconnect();
			renderTask?.cancel();
			textLayer?.cancel();
		};
	});

	$effect(() => {
		const currentPage = pageNumber;
		const currentZoom = zoom;
		const currentRotation = rotation;
		const currentFitMode = fitMode;
		const width = viewerWidth;
		const height = viewerHeight;
		const currentQuery = query;

		if (!canvasElement || !textLayerElement || width <= 0 || height <= 0) return;
		void renderPage(
			currentPage,
			currentZoom,
			currentRotation,
			currentFitMode,
			width,
			height,
			currentQuery
		);
	});

	async function renderPage(
		currentPage: number,
		currentZoom: number,
		currentRotation: number,
		currentFitMode: 'height' | 'width' | 'custom',
		width: number,
		height: number,
		currentQuery: string
	): Promise<void> {
		const canvas = canvasElement;
		const textContainer = textLayerElement;
		if (!canvas || !textContainer) return;

		const generation = ++renderGeneration;
		renderTask?.cancel();
		textLayer?.cancel();

		try {
			const page = await document.getPage(currentPage);
			if (generation !== renderGeneration) return;

			const naturalViewport = page.getViewport({ scale: 1, rotation: currentRotation });
			const scale =
				currentFitMode === 'width'
					? Math.min(3, Math.max(0.25, (width - 40) / naturalViewport.width))
					: currentFitMode === 'height'
						? Math.min(3, Math.max(0.25, (height - 40) / naturalViewport.height))
						: (currentZoom / 100) * 1.25;
			const viewport = page.getViewport({ scale, rotation: currentRotation });
			const outputScale = window.devicePixelRatio || 1;
			const context = canvas.getContext('2d', { alpha: false });
			if (!context) throw new Error('Canvas wird vom Browser nicht unterstützt.');

			pageWidth = viewport.width;
			pageHeight = viewport.height;
			canvas.width = Math.floor(viewport.width * outputScale);
			canvas.height = Math.floor(viewport.height * outputScale);
			canvas.style.width = `${viewport.width}px`;
			canvas.style.height = `${viewport.height}px`;

			renderTask = page.render({
				canvas,
				canvasContext: context,
				viewport,
				transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0]
			});
			await renderTask.promise;
			if (generation !== renderGeneration) return;

			textContainer.replaceChildren();
			textContainer.style.setProperty('--total-scale-factor', `${viewport.scale}`);
			textContainer.style.width = `${viewport.width}px`;
			textContainer.style.height = `${viewport.height}px`;

			const textContent = await page.getTextContent();
			pageTextCache.set(
				currentPage,
				textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ')
			);
			textLayer = new pdfjs.TextLayer({
				textContentSource: textContent,
				container: textContainer,
				viewport
			});
			await textLayer.render();
			if (generation !== renderGeneration) return;
			highlightText(textLayer, currentQuery);
			ready = true;
		} catch (error) {
			if (generation !== renderGeneration || isRenderCancellation(error)) return;
			onError(error instanceof Error ? error.message : 'Die Seite konnte nicht gerendert werden.');
		}
	}

	function highlightText(layer: TextLayer, value: string): void {
		const normalizedQuery = value.trim().toLocaleLowerCase();
		layer.textDivs.forEach((element, index) => {
			const text = layer.textContentItemsStr[index]?.toLocaleLowerCase() ?? '';
			element.classList.toggle(
				'arcivo-search-hit',
				Boolean(normalizedQuery && text.includes(normalizedQuery))
			);
		});
	}

	function isRenderCancellation(error: unknown): boolean {
		return error instanceof Error && error.name === 'RenderingCancelledException';
	}
</script>

<div
	bind:this={viewerElement}
	class="relative min-w-0 flex-1 overflow-auto bg-neutral-100 dark:bg-neutral-950"
>
	{#if !ready}
		<div
			class="absolute inset-0 z-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-950"
		>
			<div class="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
				<Spinner size={18} /><span>PDF wird geladen …</span>
			</div>
		</div>
	{/if}
	<div class="flex min-h-full min-w-max justify-center p-5">
		<div
			class="relative self-start overflow-hidden bg-white shadow-xl ring-1 ring-black/10"
			style:width={`${pageWidth}px`}
			style:height={`${pageHeight}px`}
		>
			<canvas bind:this={canvasElement} class="block"></canvas>
			<div bind:this={textLayerElement} class="pdf-text-layer"></div>
		</div>
	</div>
</div>
