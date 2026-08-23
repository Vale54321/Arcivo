<script lang="ts">
	import { File as FileIcon } from '@lucide/svelte';
	import type { Document, DocumentDetails } from '$lib/api';
	import { Button, Modal } from '@arcivo/ui-components';

	let {
		infoDoc,
		mimeIcon,
		mimeLabel,
		formatSize,
		onClose
	}: {
		infoDoc: Document | DocumentDetails | null;
		mimeIcon: (mimeType: string) => typeof FileIcon;
		mimeLabel: (mimeType: string) => string;
		formatSize: (bytes: number) => string;
		onClose: () => void;
	} = $props();

	let Icon = $derived(infoDoc ? mimeIcon(infoDoc.mimeType) : null);

	function checksumToHex(doc: Document | DocumentDetails): string {
		if (!('checksum' in doc)) return '–';
		return `sha256:${Array.from(doc.checksum.data)
			.map((byte) => byte.toString(16).padStart(2, '0'))
			.join('')}`;
	}
</script>

<Modal open={infoDoc !== null} title="Dokumentinformationen" {onClose}>
	{#snippet header()}
		{#if infoDoc && Icon}
			<span
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
			>
				<Icon size={18} />
			</span>
			<p class="min-w-0 flex-1 truncate font-semibold text-neutral-900 dark:text-neutral-100">
				{infoDoc.name}
			</p>
		{/if}
	{/snippet}

	{#if infoDoc}
		<dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
			<dt class="font-medium whitespace-nowrap text-neutral-500 dark:text-neutral-400">
				Dateiname
			</dt>
			<dd class="break-all text-neutral-900 dark:text-neutral-100">{infoDoc.name}</dd>

			<dt class="font-medium text-neutral-500 dark:text-neutral-400">Typ</dt>
			<dd>
				<span
					class="rounded bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
					title={infoDoc.mimeType}
				>
					{mimeLabel(infoDoc.mimeType)}
				</span>
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

			<dt class="font-medium text-neutral-500 dark:text-neutral-400">Prüfsumme</dt>
			<dd class="font-mono text-xs break-all text-neutral-500 dark:text-neutral-400">
				{checksumToHex(infoDoc)}
			</dd>
		</dl>

		<div class="flex flex-col gap-1.5">
			<label for="info-text" class="text-sm font-medium text-neutral-500 dark:text-neutral-400">
				Textinhalt
			</label>
			<textarea
				id="info-text"
				readonly
				value={'textContent' in infoDoc ? (infoDoc.textContent ?? '') : ''}
				placeholder="Kein Textinhalt verfügbar."
				rows="6"
				class="min-h-24 w-full cursor-default resize-y rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-sm leading-relaxed text-neutral-700 placeholder-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:placeholder-neutral-500"
			></textarea>
		</div>
	{/if}

	{#snippet footer()}
		<Button variant="ghost" onclick={onClose}>Schließen</Button>
	{/snippet}
</Modal>
