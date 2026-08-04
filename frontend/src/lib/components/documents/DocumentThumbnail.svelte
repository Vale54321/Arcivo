<script lang="ts">
	import { api } from '$lib/api';

	interface Props {
		documentId: string;
		alt?: string;
		class?: string;
		width?: number;
		height?: number;
	}

	let { documentId, alt = 'Vorschau', class: className = '', width, height }: Props = $props();
	let luminance = $state<'unknown' | 'light' | 'dark'>('unknown');
	let src = $state<string | null>(null);
	let imageElement = $state<HTMLImageElement>();
	let shouldLoad = $state(false);

	const sampleSize = 48;
	const requiredAverageLuminance = 0.68;
	const requiredMedianLuminance = 0.72;

	function cacheKey() {
		return `arcivo:thumbnail-luminance:v1:${documentId}`;
	}

	function restoreLuminance() {
		try {
			const cached = localStorage.getItem(cacheKey());
			if (cached === 'light' || cached === 'dark') luminance = cached;
		} catch {
			// Storage can be unavailable in privacy modes; analysis still works.
		}
	}

	$effect(() => {
		if (!imageElement || shouldLoad) return;
		if (typeof IntersectionObserver === 'undefined') {
			shouldLoad = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				shouldLoad = true;
				observer.disconnect();
			},
			{ rootMargin: '300px 0px' }
		);
		observer.observe(imageElement);

		return () => observer.disconnect();
	});

	$effect(() => {
		if (!shouldLoad) return;

		let disposed = false;
		let objectUrl: string | null = null;
		const controller = new AbortController();
		src = null;
		luminance = 'unknown';

		void api
			.getThumbnail(documentId, controller.signal)
			.then((blob) => {
				objectUrl = URL.createObjectURL(blob);
				if (disposed) {
					URL.revokeObjectURL(objectUrl);
					return;
				}
				src = objectUrl;
				restoreLuminance();
			})
			.catch(() => {
				if (!disposed) setLuminance('dark', false);
			});

		return () => {
			disposed = true;
			controller.abort();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
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
			const luminances: number[] = [];
			let luminanceTotal = 0;

			for (let index = 0; index < pixels.length; index += 4) {
				if (pixels[index + 3] < 32) continue;

				const pixelLuminance =
					(0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2]) / 255;
				luminances.push(pixelLuminance);
				luminanceTotal += pixelLuminance;
			}

			luminances.sort((left, right) => left - right);
			const medianIndex = Math.floor(luminances.length / 2);
			const medianLuminance = luminances[medianIndex] ?? 0;
			const averageLuminance = luminances.length ? luminanceTotal / luminances.length : 0;
			const isMostlyLight =
				averageLuminance >= requiredAverageLuminance && medianLuminance >= requiredMedianLuminance;
			setLuminance(isMostlyLight ? 'light' : 'dark');
		} catch {
			setLuminance('dark', false);
		}
	}
</script>

<img
	bind:this={imageElement}
	src={src ?? undefined}
	{alt}
	{width}
	{height}
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
