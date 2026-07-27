<script lang="ts">
	import { Upload } from '@lucide/svelte';
	import { fade } from 'svelte/transition';

	let {
		visible,
		onFilesDropped,
		onClose
	}: {
		visible: boolean;
		onFilesDropped: (files: FileList) => void;
		onClose: () => void;
	} = $props();

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		onClose();
		const files = e.dataTransfer?.files;
		if (files?.length) onFilesDropped(files);
	}

	function handleDragLeave(e: DragEvent) {
		if ((e.target as HTMLElement)?.nodeName === 'HTML' || (e.clientX === 0 && e.clientY === 0)) {
			onClose();
		}
	}
</script>

{#if visible}
	<div
		transition:fade={{ duration: 120 }}
		class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-neutral-950/80"
		ondragover={(e) => e.preventDefault()}
		ondrop={handleDrop}
		ondragleave={handleDragLeave}
		role="presentation"
	>
		<div
			class="pointer-events-none flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-red-400 bg-red-50 px-16 py-14 dark:border-red-700 dark:bg-red-950/20"
		>
			<span class="rounded-full bg-red-100 p-4 text-red-500 dark:bg-red-900/40 dark:text-red-400">
				<Upload size={32} />
			</span>
			<p class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
				Dateien hier ablegen
			</p>
			<p class="text-sm text-neutral-500">Mehrere Dateien werden unterstützt</p>
		</div>
	</div>
{/if}
