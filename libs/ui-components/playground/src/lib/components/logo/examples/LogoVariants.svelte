<script lang="ts">
	import { ArcivoLogo, type ArcivoLogoSize, type ArcivoLogoVariant } from '../../../../../../src';

	const variants: ArcivoLogoVariant[] = ['full', 'mark', 'wordmark'];
	const sizes: ArcivoLogoSize[] = ['sm', 'md', 'lg'];
</script>

<div class="overflow-x-auto">
	<table class="w-full min-w-lg text-left text-sm">
		<thead>
			<tr class="border-b border-neutral-200 dark:border-neutral-800">
				<th class="px-3 py-2 font-medium text-neutral-500 dark:text-neutral-400">Variant</th>
				{#each sizes as size}<th class="px-3 py-2 font-medium text-neutral-500 capitalize dark:text-neutral-400">{size}</th>{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
			{#each variants as variant}
				<tr>
					<th class="px-3 py-5 font-mono text-xs font-medium text-neutral-500 dark:text-neutral-400">{variant}</th>
					{#each sizes as size}<td class="px-3 py-5 text-neutral-900 dark:text-neutral-100"><ArcivoLogo {variant} {size} /></td>{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
