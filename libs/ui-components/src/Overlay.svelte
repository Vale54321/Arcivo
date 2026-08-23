<script module lang="ts">
	export type OverlayBackdrop = 'dim' | 'transparent';
	export type OverlayRole = 'dialog' | 'menu';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props
		extends Omit<HTMLAttributes<HTMLDivElement>, 'aria-label' | 'children' | 'class' | 'role' | 'style'> {
		open: boolean;
		onClose: () => void;
		/** Semantic role of the overlay surface. */
		role?: OverlayRole;
		/** Accessible name for the overlay surface and its dismiss layer. */
		ariaLabel: string;
		/** Marks dialog overlays as modal for assistive technology. */
		modal?: boolean;
		/** Controls whether the dismiss layer is dimmed or transparent. */
		backdrop?: OverlayBackdrop;
		/** Enables Escape-to-close while the overlay is visible. */
		dismissOnEscape?: boolean;
		/** Enables outside-click dismissal. */
		dismissOnBackdrop?: boolean;
		/** Prevents the browser context menu and dismisses when right-clicking outside the surface. */
		dismissOnContextMenu?: boolean;
		/** Fixed-position placement, dimensions, and intentional surface overrides. */
		surfaceClass?: string;
		style?: string;
		children: Snippet;
	}

	let {
		open,
		onClose,
		role = 'dialog',
		ariaLabel,
		modal = false,
		backdrop = 'dim',
		dismissOnEscape = true,
		dismissOnBackdrop = true,
		dismissOnContextMenu = false,
		surfaceClass = '',
		style,
		children,
		...restProps
	}: Props = $props();

	const backdropClasses: Record<OverlayBackdrop, string> = {
		dim: 'bg-black/20 backdrop-blur-sm',
		transparent: 'bg-transparent'
	};

	function handleWindowKeydown(event: KeyboardEvent): void {
		if (open && dismissOnEscape && event.key === 'Escape') onClose();
	}

	function handleBackdropContextMenu(event: MouseEvent): void {
		if (!dismissOnContextMenu) return;
		event.preventDefault();
		onClose();
	}

	function handleBackdropClick(): void {
		if (dismissOnBackdrop) onClose();
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if open}
	<button
		type="button"
		tabindex="-1"
		class="fixed inset-0 z-40 cursor-default {backdropClasses[backdrop]}"
		onclick={handleBackdropClick}
		oncontextmenu={handleBackdropContextMenu}
		aria-label={ariaLabel}
	></button>

	<div
		{...restProps}
		{style}
		{role}
		aria-modal={modal ? 'true' : undefined}
		aria-label={ariaLabel}
		class="fixed z-50 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900 {surfaceClass}"
	>
		{@render children()}
	</div>
{/if}
