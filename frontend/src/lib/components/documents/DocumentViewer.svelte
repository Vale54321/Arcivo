<script lang="ts">
	import { onMount } from 'svelte';
	import { ExternalLink, FileText, X } from '@lucide/svelte';
	import type { Document } from '$lib/api';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { getThemeContext } from '$lib/state/theme.svelte';

	let {
		doc,
		src,
		onClose
	}: {
		doc: Document;
		src: string;
		onClose: () => void;
	} = $props();

	const theme = getThemeContext();
	let PDFViewer = $state<typeof import('@embedpdf/svelte-pdf-viewer').PDFViewer>();
	let viewerReady = $state(false);
	let loadFailed = $state(false);

	let config = $derived({
		src,
		tabBar: 'never' as const,
		theme: { preference: theme.current },
		disabledCategories: [
			'document-open',
			'document-close',
			'annotation',
			'redaction',
			'signature',
			'stamp'
		]
	});

	onMount(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		import('@embedpdf/svelte-pdf-viewer')
			.then((module) => {
				PDFViewer = module.PDFViewer;
			})
			.catch(() => {
				loadFailed = true;
			});

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onClose();
	}

	function openInNewTab() {
		window.open(src, '_blank', 'noopener,noreferrer');
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
		<header
			class="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 px-3 sm:px-4 dark:border-neutral-800"
		>
			<span
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
			>
				<FileText size={17} />
			</span>

			<div class="min-w-0 flex-1">
				<h2 class="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
					{doc.name}
				</h2>
				<p class="text-xs text-neutral-500 dark:text-neutral-400">PDF-Archivversion</p>
			</div>

			<button
				type="button"
				onclick={openInNewTab}
				title="In neuem Tab öffnen"
				aria-label="In neuem Tab öffnen"
				class="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
			>
				<ExternalLink size={17} />
			</button>
			<button
				type="button"
				onclick={onClose}
				title="Viewer schließen"
				aria-label="Viewer schließen"
				class="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
			>
				<X size={19} />
			</button>
		</header>

		<div class="relative min-h-0 flex-1 bg-neutral-100 dark:bg-neutral-950">
			{#if loadFailed}
				<div class="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
					<FileText size={32} class="text-neutral-400" />
					<div>
						<p class="font-medium text-neutral-800 dark:text-neutral-200">
							Der PDF-Viewer konnte nicht geladen werden.
						</p>
						<button
							type="button"
							onclick={openInNewTab}
							class="mt-1 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
						>
							Archivversion im Browser öffnen
						</button>
					</div>
				</div>
			{:else}
				{#if !viewerReady}
					<div
						class="absolute inset-0 z-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-950"
					>
						<div class="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
							<Spinner size={18} />
							<span>PDF-Viewer wird geladen …</span>
						</div>
					</div>
				{/if}

				{#if PDFViewer}
					{#key theme.current}
						<PDFViewer
							{config}
							onready={() => (viewerReady = true)}
							style="width: 100%; height: 100%;"
						/>
					{/key}
				{/if}
			{/if}
		</div>
	</div>
</div>
