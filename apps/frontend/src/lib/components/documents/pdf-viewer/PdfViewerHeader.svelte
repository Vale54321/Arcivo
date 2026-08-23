<script lang="ts">
	import { Download, ExternalLink, FileText, X } from '@lucide/svelte';

	let {
		documentName,
		onOpenInNewTab,
		onDownload,
		onClose
	}: {
		documentName: string;
		onOpenInNewTab: () => void;
		onDownload: () => void;
		onClose: () => void;
	} = $props();
</script>

<div class="flex h-14 items-center gap-3 px-3 sm:px-4">
	<span
		class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
	>
		<FileText size={17} />
	</span>
	<div class="min-w-0 flex-1">
		<h2 class="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
			{documentName}
		</h2>
		<p class="text-xs text-neutral-500 dark:text-neutral-400">PDF-Archivversion</p>
	</div>
	<button
		type="button"
		onclick={onOpenInNewTab}
		title="In neuem Tab öffnen"
		aria-label="In neuem Tab öffnen"
		class="viewer-button hidden sm:flex"
	>
		<ExternalLink size={17} />
	</button>
	<button
		type="button"
		onclick={onDownload}
		title="PDF herunterladen"
		aria-label="PDF herunterladen"
		class="viewer-button hidden sm:flex"
	>
		<Download size={17} />
	</button>
	<button
		type="button"
		onclick={onClose}
		title="Viewer schließen"
		aria-label="Viewer schließen"
		class="viewer-button"
	>
		<X size={19} />
	</button>
</div>
