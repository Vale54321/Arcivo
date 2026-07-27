<script lang="ts">
	import { File as FileIcon } from '@lucide/svelte';
	import type { Document } from '$lib/api';

	let {
		infoDoc,
		mimeIcon,
		mimeLabel,
		formatSize,
		onClose
	}: {
		infoDoc: Document | null;
		mimeIcon: (mimeType: string) => typeof FileIcon;
		mimeLabel: (mimeType: string) => string;
		formatSize: (bytes: number) => string;
		onClose: () => void;
	} = $props();

	function checksumToHex(doc: Document): string {
		if (!doc.checksum) return '–';
		return `sha256:${Array.from(doc.checksum.data).map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
	}
</script>

{#if infoDoc}
	{@const InfoIcon = mimeIcon(infoDoc.mimeType)}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
		role="presentation"
		onclick={(e) => { if (e.target === e.currentTarget) onClose(); }}
	>
		<div class="w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl flex flex-col max-h-[90vh]">
			<div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 px-5 py-4 shrink-0">
				<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
					<InfoIcon size={18} />
				</span>
				<div class="flex-1 min-w-0">
					<p class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{infoDoc.name}</p>
				</div>
			</div>
			<div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
				<dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
					<dt class="text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">Dateiname</dt>
					<dd class="text-neutral-900 dark:text-neutral-100 break-all">{infoDoc.name}</dd>

					<dt class="text-neutral-500 dark:text-neutral-400 font-medium">Typ</dt>
					<dd><span class="font-mono text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded" title={infoDoc.mimeType}>{mimeLabel(infoDoc.mimeType)}</span></dd>

					<dt class="text-neutral-500 dark:text-neutral-400 font-medium">Größe</dt>
					<dd class="text-neutral-900 dark:text-neutral-100">{formatSize(infoDoc.size)}</dd>

					<dt class="text-neutral-500 dark:text-neutral-400 font-medium">Datei erstellt</dt>
					<dd class="text-neutral-900 dark:text-neutral-100">{new Date(infoDoc.fileCreatedAt).toLocaleString('de-DE')}</dd>

					<dt class="text-neutral-500 dark:text-neutral-400 font-medium">Hinzugefügt am</dt>
					<dd class="text-neutral-900 dark:text-neutral-100">{new Date(infoDoc.createdAt).toLocaleString('de-DE')}</dd>

					<dt class="text-neutral-500 dark:text-neutral-400 font-medium">Dokument-ID</dt>
					<dd class="font-mono text-xs text-neutral-500 dark:text-neutral-400 break-all">{infoDoc.id}</dd>

					<dt class="text-neutral-500 dark:text-neutral-400 font-medium pt-0.5">Prüfsumme</dt>
					<dd class="font-mono text-xs text-neutral-500 dark:text-neutral-400 break-all">{checksumToHex(infoDoc)}</dd>
				</dl>

				<div class="flex flex-col gap-1.5">
					<label for="info-text" class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Textinhalt</label>
					<textarea
						id="info-text"
						readonly
						value={infoDoc.textContent ?? ''}
						placeholder="Kein Textinhalt verfügbar."
						rows="6"
						class="w-full resize-y rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none font-mono leading-relaxed min-h-24 cursor-default"
					></textarea>
				</div>
			</div>
			<div class="flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800 px-5 py-3 shrink-0">
				<button
					onclick={onClose}
					class="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
				>Schließen</button>
			</div>
		</div>
	</div>
{/if}
