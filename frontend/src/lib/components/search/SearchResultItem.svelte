<script lang="ts">
	import type { Document, MatchType } from '$lib/api';
	import { formatSize, mimeIcon } from '$lib/components/documents/document-formatters';

	interface Props {
		doc: Document;
		matchType?: MatchType;
		highlighted?: boolean;
		onSelect: (doc: Document) => void;
	}

	let { doc, matchType, highlighted = false, onSelect }: Props = $props();

	let Icon = $derived(mimeIcon(doc.mimeType));
	let showContentBadge = $derived(matchType === 'content' || matchType === 'both');
</script>

<li>
	<button
		type="button"
		onclick={() => onSelect(doc)}
		class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors {highlighted
			? 'bg-neutral-100 dark:bg-neutral-800'
			: 'hover:bg-neutral-50 dark:hover:bg-neutral-800'}"
	>
		<span class="shrink-0 text-neutral-400">
			<Icon size={16} />
		</span>
		<span class="flex-1 truncate text-sm text-neutral-800 dark:text-neutral-100">{doc.name}</span>
		{#if showContentBadge}
			<span
				class="shrink-0 rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs text-red-600 dark:bg-red-950 dark:text-red-400"
			>
				Inhalt
			</span>
		{/if}
		<span class="shrink-0 text-xs text-neutral-400">{formatSize(doc.size)}</span>
	</button>
</li>
