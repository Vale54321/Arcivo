<script lang="ts">
	import { FileText } from '@lucide/svelte';

	let { message, onOpenInNewTab }: { message: string; onOpenInNewTab: () => void } = $props();
</script>

<div
	class="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 bg-neutral-100 px-6 text-center dark:bg-neutral-950"
>
	<FileText size={32} class="text-neutral-400" />
	<div>
		<p class="font-medium text-neutral-800 dark:text-neutral-200">
			Die PDF konnte nicht geladen werden.
		</p>
		<p class="mt-1 max-w-lg text-xs text-neutral-500 dark:text-neutral-400">{message}</p>
		<button
			type="button"
			onclick={onOpenInNewTab}
			class="mt-2 text-sm text-red-600 hover:underline dark:text-red-400"
		>
			Archivversion im Browser öffnen
		</button>
	</div>
</div>
