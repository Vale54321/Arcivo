<script module lang="ts">
	export type InputVariant = 'field' | 'bare' | 'search';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Eye, EyeOff, Search } from '@lucide/svelte';

	interface Props
		extends Omit<
			HTMLInputAttributes,
			'children' | 'class' | 'disabled' | 'required' | 'type' | 'value'
		> {
		variant?: InputVariant;
		label?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		type?: HTMLInputAttributes['type'];
		passwordToggle?: boolean;
		class?: string;
		containerClass?: string;
		leading?: Snippet;
		trailing?: Snippet;
		value?: string | number | undefined;
	}

	const generatedId = $props.id();

	let {
		variant = 'field',
		id = generatedId,
		label,
		hint,
		error,
		required = false,
		disabled = false,
		type = 'text',
		passwordToggle = true,
		class: className = '',
		containerClass = '',
		leading,
		trailing,
		value = $bindable<string | number | undefined>(),
		...restProps
	}: Props = $props();

	let passwordVisible = $state(false);
	let inputType = $derived(
		type === 'password' && passwordVisible ? 'text' : variant === 'search' && type === 'text' ? 'search' : type
	);
	let hasLeadingContent = $derived(Boolean(leading) || variant === 'search');
	let hasTrailingContent = $derived(Boolean(trailing) || (type === 'password' && passwordToggle));
</script>

<div class="{variant === 'field' ? 'block' : 'min-w-0'} {containerClass}">
	{#if variant === 'field' && label}
		<label for={id} class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
			{label}{#if required}<span class="text-red-600 dark:text-red-400" aria-hidden="true"> *</span>{/if}
		</label>
	{/if}

	<div class="relative flex w-full items-center">
		{#if variant === 'search'}
			<span class="pointer-events-none absolute left-3 flex shrink-0 text-neutral-400" aria-hidden="true">
				<Search size={16} strokeWidth={2} />
			</span>
		{:else if leading}
			<span class="pointer-events-none absolute left-3 flex shrink-0 text-neutral-400" aria-hidden="true">
				{@render leading()}
			</span>
		{/if}
		<input
			{...restProps}
			{id}
			{required}
			{disabled}
			type={inputType}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			class="h-10 w-full rounded-lg border bg-white px-3 text-sm text-neutral-900 outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-950 dark:text-neutral-100 {error
				? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500 dark:focus:ring-red-500/30'
				: 'border-neutral-300 focus:border-red-500 focus:ring-red-500/20 dark:border-neutral-700 dark:focus:border-red-400 dark:focus:ring-red-400/20'} {hasLeadingContent ? 'pl-9' : ''} {hasTrailingContent ? 'pr-10' : ''} {className}"
		/>
		{#if trailing}
			<span class="pointer-events-none absolute right-3 flex shrink-0 text-neutral-400" aria-hidden="true">
				{@render trailing()}
			</span>
		{/if}
		{#if type === 'password' && passwordToggle}
			<button
				type="button"
				onclick={() => (passwordVisible = !passwordVisible)}
				class="absolute right-2 cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
				aria-label={passwordVisible ? 'Hide password' : 'Show password'}
			>
				{#if passwordVisible}
					<EyeOff size={16} strokeWidth={2} aria-hidden="true" />
				{:else}
					<Eye size={16} strokeWidth={2} aria-hidden="true" />
				{/if}
			</button>
		{/if}
	</div>

	{#if variant === 'field' && error}
		<p class="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
	{:else if variant === 'field' && hint}
		<p class="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">{hint}</p>
	{/if}
</div>
