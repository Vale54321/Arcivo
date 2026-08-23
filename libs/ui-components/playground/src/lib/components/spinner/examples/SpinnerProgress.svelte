<script lang="ts">
	import { Spinner } from '../../../../../../src';
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
	<div class="flex min-h-28 flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
		<Spinner size={12} />
		<span>12px</span>
	</div>
	<div class="flex min-h-28 flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
		<Spinner />
		<span>16px</span>
	</div>
	<div class="flex min-h-28 flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
		<Spinner size={24} />
		<span>24px</span>
	</div>
</div>
