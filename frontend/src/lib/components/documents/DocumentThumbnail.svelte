<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		src: string;
		alt?: string;
		class?: string;
		width?: number;
		height?: number;
	}

	let { src, alt = 'Vorschau', class: className = '', width, height }: Props = $props();
	let luminance = $state<'unknown' | 'light' | 'dark'>('unknown');

	const sampleSize = 32;
	const lightPixelThreshold = 0.82;
	const requiredLightPixelRatio = 0.66;
	const requiredAverageLuminance = 0.72;

	function cacheKey() {
		return `arcivo:thumbnail-luminance:v1:${src}`;
	}

	onMount(() => {
		try {
			const cached = localStorage.getItem(cacheKey());
			if (cached === 'light' || cached === 'dark') luminance = cached;
		} catch {
			// Storage can be unavailable in privacy modes; analysis still works.
		}
	});

	function setLuminance(value: 'light' | 'dark', cache = true) {
		luminance = value;
		if (!cache) return;

		try {
			localStorage.setItem(cacheKey(), value);
		} catch {
			// Treat caching as an optional performance enhancement.
		}
	}

	function analyzeLuminance(event: Event) {
		if (luminance !== 'unknown') return;

		const image = event.currentTarget as HTMLImageElement;
		const canvas = document.createElement('canvas');
		canvas.width = Math.min(sampleSize, image.naturalWidth);
		canvas.height = Math.min(sampleSize, image.naturalHeight);
		const context = canvas.getContext('2d', { willReadFrequently: true });
		if (!context || canvas.width === 0 || canvas.height === 0) {
			setLuminance('dark', false);
			return;
		}

		try {
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
			let visiblePixels = 0;
			let lightPixels = 0;
			let luminanceTotal = 0;

			for (let index = 0; index < pixels.length; index += 4) {
				if (pixels[index + 3] < 32) continue;

				const luminance =
					(0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2]) / 255;
				visiblePixels += 1;
				luminanceTotal += luminance;
				if (luminance >= lightPixelThreshold) lightPixels += 1;
			}

			const isMostlyLight =
				visiblePixels > 0 &&
				lightPixels / visiblePixels >= requiredLightPixelRatio &&
				luminanceTotal / visiblePixels >= requiredAverageLuminance;
			setLuminance(isMostlyLight ? 'light' : 'dark');
		} catch {
			setLuminance('dark', false);
		}
	}
</script>

<img
	{src}
	{alt}
	{width}
	{height}
	crossorigin="anonymous"
	class="{className} thumbnail-image {luminance === 'light' ? 'mostly-light' : ''} {luminance ===
	'unknown'
		? 'awaiting-analysis'
		: ''}"
	loading="lazy"
	onload={analyzeLuminance}
	onerror={() => setLuminance('dark', false)}
/>

<style>
	.thumbnail-image {
		transition: filter 120ms ease;
	}

	:global(.dark) .awaiting-analysis,
	:global(.dark) .mostly-light {
		filter: invert(0.9) hue-rotate(180deg) brightness(0.9) contrast(0.92);
	}
</style>
