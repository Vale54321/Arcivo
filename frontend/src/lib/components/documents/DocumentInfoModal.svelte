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
		return `sha256:${Array.from(doc.checksum.data)
			.map((byte) => byte.toString(16).padStart(2, '0'))
			.join('')}`;
	}
</script>

{#if infoDoc}
	{@const InfoIcon = mimeIcon(infoDoc.mimeType)}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) onClose();
		}}
	>
		<div
			class="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
		>
			<div
				class="flex shrink-0 items-center gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800"
			>
				<span
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
				>
					<InfoIcon size={18} />
				</span>
				<div class="min-w-0 flex-1">
					<p class="truncate font-semibold text-neutral-900 dark:text-neutral-100">
						{infoDoc.name}
					</p>
				</div>
			</div>
			<div class="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
				<dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
					<dt class="font-medium whitespace-nowrap text-neutral-500 dark:text-neutral-400">
						Dateiname
					</dt>
					<dd class="break-all text-neutral-900 dark:text-neutral-100">{infoDoc.name}</dd>

					<dt class="font-medium text-neutral-500 dark:text-neutral-400">Typ</dt>
					<dd>
						<span
							class="rounded bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
							title={infoDoc.mimeType}>{mimeLabel(infoDoc.mimeType)}</span
						>
					</dd>

					<dt class="font-medium text-neutral-500 dark:text-neutral-400">Größe</dt>
					<dd class="text-neutral-900 dark:text-neutral-100">{formatSize(infoDoc.size)}</dd>

					<dt class="font-medium text-neutral-500 dark:text-neutral-400">Datei erstellt</dt>
					<dd class="text-neutral-900 dark:text-neutral-100">
						{new Date(infoDoc.fileCreatedAt).toLocaleString('de-DE')}
					</dd>

					<dt class="font-medium text-neutral-500 dark:text-neutral-400">Hinzugefügt am</dt>
					<dd class="text-neutral-900 dark:text-neutral-100">
						{new Date(infoDoc.createdAt).toLocaleString('de-DE')}
					</dd>

					<dt class="font-medium text-neutral-500 dark:text-neutral-400">Dokument-ID</dt>
					<dd class="font-mono text-xs break-all text-neutral-500 dark:text-neutral-400">
						{infoDoc.id}
					</dd>

					<dt class="pt-0.5 font-medium text-neutral-500 dark:text-neutral-400">Prüfsumme</dt>
					<dd class="font-mono text-xs break-all text-neutral-500 dark:text-neutral-400">
						{checksumToHex(infoDoc)}
					</dd>
				</dl>

				<div class="flex flex-col gap-1.5">
					<label for="info-text" class="text-sm font-medium text-neutral-500 dark:text-neutral-400"
						>Textinhalt</label
					>
					<textarea
						id="info-text"
						readonly
						value={infoDoc.textContent ?? ''}
						placeholder="Kein Textinhalt verfügbar."
						rows="6"
						class="min-h-24 w-full cursor-default resize-y rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-sm leading-relaxed text-neutral-700 placeholder-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:placeholder-neutral-500"
					></textarea>
				</div>
			</div>
			<div
				class="flex shrink-0 justify-end gap-2 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800"
			>
				<button
					onclick={onClose}
					class="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
					>Schließen</button
				>
			</div>
		</div>
	</div>
{/if}
