<script module lang="ts">
	export type ThemePreference = 'light' | 'dark' | 'system';
</script>

<script lang="ts">
	import { Monitor, Moon, Sun } from '@lucide/svelte';
	import Button, { type ButtonSize, type ButtonVariant } from './Button.svelte';

	interface Props {
		/** Current theme preference. */
		theme: ThemePreference;
		/** Includes the system preference in the cycle when enabled. */
		system?: boolean;
		/** Called with the next preference after activation. */
		onchange: (theme: ThemePreference) => void;
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
	}

	let {
		theme,
		system = false,
		onchange,
		variant = 'ghost',
		size = 'md',
		class: className = ''
	}: Props = $props();

	let nextTheme = $derived.by<ThemePreference>(() => {
		if (theme === 'light') return 'dark';
		if (theme === 'dark') return system ? 'system' : 'light';
		return 'light';
	});

	let label = $derived(
		nextTheme === 'system'
			? 'Use system theme'
			: nextTheme === 'light'
				? 'Switch to light theme'
				: 'Switch to dark theme'
	);
</script>

<Button
	{variant}
	{size}
	iconOnly
	class={className}
	onclick={() => onchange(nextTheme)}
	aria-label={label}
	title={label}
>
	{#if theme === 'system' && system}
		<Monitor size={18} />
	{:else if theme === 'dark'}
		<Sun size={18} />
	{:else}
		<Moon size={18} />
	{/if}
</Button>
