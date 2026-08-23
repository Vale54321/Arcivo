<script lang="ts">
	import type { Document, MatchType } from '$lib/api';
	import { formatSize, mimeIcon } from '$lib/components/documents/document-formatters';

	interface Props {
		doc: Document;
		matchType?: MatchType;
		searchTerm?: string;
		highlighted?: boolean;
		onSelect: (doc: Document) => void;
	}

	let { doc, matchType, searchTerm = '', highlighted = false, onSelect }: Props = $props();

	let Icon = $derived(mimeIcon(doc.mimeType));
	let showContentBadge = $derived(matchType === 'content' || matchType === 'both');
	let titleParts = $derived.by(() => {
		const term = searchTerm.trim();
		if (!term) return [{ text: doc.name, highlighted: false }];

		const parts: { text: string; highlighted: boolean }[] = [];
		const expression = new RegExp(escapeRegExp(term), 'gi');
		let lastIndex = 0;
		let match: RegExpExecArray | null;

		while ((match = expression.exec(doc.name))) {
			if (match.index > lastIndex) {
				parts.push({ text: doc.name.slice(lastIndex, match.index), highlighted: false });
			}
			parts.push({ text: match[0], highlighted: true });
			lastIndex = match.index + match[0].length;
		}

		if (lastIndex < doc.name.length) {
			parts.push({ text: doc.name.slice(lastIndex), highlighted: false });
		}

		return parts.length ? parts : [{ text: doc.name, highlighted: false }];
	});

	function escapeRegExp(value: string): string {
		return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
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
		<span class="flex-1 truncate text-sm text-neutral-800 dark:text-neutral-100">
			{#each titleParts as part, index (index)}
				{#if part.highlighted}
					<span class="font-semibold text-red-600 dark:text-red-400">{part.text}</span>
				{:else}
					{part.text}
				{/if}
			{/each}
		</span>
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
