<script lang="ts">
	import { AlertCircle, CheckCircle, Info, Upload } from '@lucide/svelte';
	import { fade } from 'svelte/transition';

	type UploadMessage = { msg: string; type: 'success' | 'error' | 'info' };

	let {
		pendingFile,
		checksumming,
		uploadProgress,
		uploadResults,
		onDismiss
	}: {
		pendingFile: string | null;
		checksumming: boolean;
		uploadProgress: number;
		uploadResults: UploadMessage[];
		onDismiss: (index: number) => void;
	} = $props();
</script>

{#if uploadResults.length > 0 || pendingFile}
	<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80" transition:fade={{ duration: 150 }}>
		{#if pendingFile}
			<div class="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg">
				<div class="flex items-center gap-3 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">
					{#if checksumming}
						<svg class="shrink-0 animate-spin text-neutral-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 12a9 9 0 1 1-6.219-8.56" />
						</svg>
					{:else}
						<Upload size={15} class="shrink-0 text-neutral-400" />
					{/if}
					<span class="flex-1 truncate">
						{#if checksumming}Prüfsumme wird berechnet…{:else}"{pendingFile}" wird hochgeladen…{/if}
					</span>
					{#if !checksumming}
						<span class="shrink-0 font-mono text-xs tabular-nums text-neutral-400">{uploadProgress}%</span>
					{/if}
				</div>
				<div class="h-0.5 w-full bg-neutral-100 dark:bg-neutral-800">
					{#if checksumming}
						<div class="h-full w-full animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>
					{:else}
						<div class="h-full bg-red-500 dark:bg-red-600 transition-[width] duration-150 ease-out rounded-full" style="width: {uploadProgress}%"></div>
					{/if}
				</div>
			</div>
		{/if}
		{#each uploadResults as result, index (index)}
			<div class="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg
				{result.type === 'success' ? 'border-green-200 dark:border-green-800 bg-white dark:bg-neutral-900 text-green-700 dark:text-green-400' :
				 result.type === 'error' ? 'border-red-200 dark:border-red-800 bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400' :
				 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300'}">
				{#if result.type === 'success'}
					<CheckCircle size={15} class="shrink-0 mt-px" />
				{:else if result.type === 'error'}
					<AlertCircle size={15} class="shrink-0 mt-px" />
				{:else}
					<Info size={15} class="shrink-0 mt-px" />
				{/if}
				<span class="flex-1">{result.msg}</span>
				<button
					onclick={() => onDismiss(index)}
					class="shrink-0 -mr-1 rounded p-0.5 text-current opacity-50 hover:opacity-100 transition-opacity"
					aria-label="Schließen"
				>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
				</button>
			</div>
		{/each}
	</div>
{/if}
