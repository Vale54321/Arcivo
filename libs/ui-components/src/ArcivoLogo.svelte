<script module lang="ts">
	export type ArcivoLogoVariant = 'full' | 'mark' | 'wordmark';
	export type ArcivoLogoSize = 'sm' | 'md' | 'lg';
</script>

<script lang="ts">
	interface Props {
		/** Full lockup, standalone symbol, or text-only wordmark. */
		variant?: ArcivoLogoVariant;
		/** Standard logo height: 24, 32, or 40 pixels. */
		size?: ArcivoLogoSize;
		/** Removes the logo from the accessibility tree when its surrounding control is already labelled. */
		decorative?: boolean;
		class?: string;
	}

	let {
		variant = 'full',
		size = 'md',
		decorative = false,
		class: className = ''
	}: Props = $props();

	const sizes: Record<ArcivoLogoSize, string> = {
		sm: 'h-6',
		md: 'h-8',
		lg: 'h-10'
	};
</script>

{#if variant === 'mark'}
	<svg
		class="block w-auto {sizes[size]} {className}"
		viewBox="0 0 44 48"
		fill="none"
		role={decorative ? undefined : 'img'}
		aria-label={decorative ? undefined : 'Arcivo'}
		aria-hidden={decorative ? 'true' : undefined}
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M22 4 L6 44" stroke="currentColor" stroke-width="7" stroke-linecap="round" />
		<path d="M22 4 L38 44" stroke="#dc2626" stroke-width="7" stroke-linecap="round" />
		<path d="M12 31 L32 31" stroke="#dc2626" stroke-width="7" stroke-linecap="round" />
	</svg>
{:else if variant === 'wordmark'}
	<svg
		class="block w-auto {sizes[size]} {className}"
		viewBox="0 0 88 44"
		fill="none"
		role={decorative ? undefined : 'img'}
		aria-label={decorative ? undefined : 'Arcivo'}
		aria-hidden={decorative ? 'true' : undefined}
		xmlns="http://www.w3.org/2000/svg"
	>
		<text x="0" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="800" fill="currentColor" letter-spacing="-0.5">rc<tspan fill="#dc2626">i</tspan>vo</text>
	</svg>
{:else}
	<svg
		class="block w-auto {sizes[size]} {className}"
		viewBox="0 0 132 48"
		fill="none"
		role={decorative ? undefined : 'img'}
		aria-label={decorative ? undefined : 'Arcivo'}
		aria-hidden={decorative ? 'true' : undefined}
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M22 4 L6 44" stroke="currentColor" stroke-width="7" stroke-linecap="round" />
		<path d="M22 4 L38 44" stroke="#dc2626" stroke-width="7" stroke-linecap="round" />
		<path d="M12 31 L32 31" stroke="#dc2626" stroke-width="7" stroke-linecap="round" />
		<text x="44" y="36" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="800" fill="currentColor" letter-spacing="-0.5">rc<tspan fill="#dc2626">i</tspan>vo</text>
	</svg>
{/if}
