<script lang="ts">
	import { ThemeToggle, type ThemePreference } from '../../../../../../src';

	let binaryTheme = $state<ThemePreference>('light');
	let systemTheme = $state<ThemePreference>('system');
</script>

<div class="grid gap-6 sm:grid-cols-2">
	<div>
		<p class="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Without system setting</p>
		<div class="flex items-center gap-3">
			<ThemeToggle theme={binaryTheme} onchange={(theme) => (binaryTheme = theme)} />
			<code class="text-xs text-neutral-500 dark:text-neutral-400">{binaryTheme}</code>
		</div>
	</div>
	<div>
		<p class="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">With system setting</p>
		<div class="flex items-center gap-3">
			<ThemeToggle theme={systemTheme} system onchange={(theme) => (systemTheme = theme)} />
			<code class="text-xs text-neutral-500 dark:text-neutral-400">{systemTheme}</code>
		</div>
	</div>
</div>
