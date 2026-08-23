<script lang="ts">
	import {
		ArrowRight,
		Boxes,
		FileStack,
		Grid2X2,
		Moon,
		Search,
		ShieldCheck,
		Sun,
		Upload
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { Button } from '@arcivo/ui-components';
	import ArcivoLogo from '$lib/components/ArcivoLogo.svelte';
	import DocumentListPreview from '$lib/components/DocumentListPreview.svelte';
	import GitHubIcon from '$lib/components/GitHubIcon.svelte';

	const repositoryUrl = 'https://github.com/Vale54321/Arcivo';
	const demoUrl = 'https://arcivo.heiserer.de';
	const playbookUrl = 'https://playbook.arcivo.de';

	const features = [
		{
			title: 'Full-text search',
			description: 'Instantly search across all your document content. Open the search palette with Ctrl K from anywhere in the app.',
			icon: Search
		},
		{
			title: 'Drag & drop upload',
			description: 'Drop files directly onto the page or use the upload button. SHA-256 checksums are computed client-side before transfer.',
			icon: Upload
		},
		{
			title: 'All file types',
			description: 'PDFs, Word documents, spreadsheets, images, archives and more. Each file gets a smart icon and type detection.',
			icon: FileStack
		},
		{
			title: 'List & grid views',
			description: 'Switch between a compact list and a spacious grid layout. Your preference is remembered between sessions.',
			icon: Grid2X2
		},
		{
			title: 'Self-hosted privacy',
			description: 'Your data never leaves your server. Run Arcivo on your own hardware — full control, no subscriptions.',
			icon: ShieldCheck
		},
		{
			title: 'Light & dark mode',
			description: 'Seamless theme switching with an instant toggle in the header. Theme preference is persisted across reloads.',
			icon: Moon
		}
	];

	let darkMode = $state(false);

	onMount(() => {
		darkMode = document.documentElement.classList.contains('dark');
	});

	function toggleTheme() {
		darkMode = !darkMode;
		document.documentElement.classList.toggle('dark', darkMode);
		localStorage.setItem('arcivo:theme', darkMode ? 'dark' : 'light');
	}
</script>

<svelte:head>
	<title>Arcivo — Your Documents, Organised.</title>
	<meta
		name="description"
		content="Arcivo is a self-hosted document management system for uploading, searching, and organising your files."
	/>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<header
	class="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur sm:px-6 dark:border-neutral-800 dark:bg-neutral-950/95"
>
	<a href="#top" class="text-neutral-900 dark:text-neutral-100" aria-label="Arcivo home">
		<ArcivoLogo />
	</a>

	<nav class="ml-auto hidden items-center gap-1 sm:flex" aria-label="Primary navigation">
		<a class="nav-link" href="#features">Features</a>
		<a class="nav-link" href="#interface">Interface</a>
	</nav>

	<Button
		variant="ghost"
		iconOnly
		size="sm"
		onclick={toggleTheme}
		aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
		title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
	>
		{#if darkMode}
			<Sun size={17} />
		{:else}
			<Moon size={17} />
		{/if}
	</Button>

	<a class="header-link" href={repositoryUrl} target="_blank" rel="noreferrer">
		<GitHubIcon size={15} />
		<span>GitHub</span>
	</a>
</header>

<main id="top">
	<section class="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-28">
		<div class="hero-badge">
			<Boxes size={13} />
			Open source · Self-hosted
		</div>
		<h1 class="text-4xl font-extrabold tracking-[-0.03em] text-neutral-900 sm:text-6xl dark:text-neutral-100">
			Your documents,<br /><span class="text-red-600 dark:text-red-500">organised.</span>
		</h1>
		<p class="max-w-xl text-lg leading-7 text-neutral-500 dark:text-neutral-400">
			Arcivo is a self-hosted document management system. Upload, search, and organise all your files in one clean interface.
		</p>
		<div class="flex flex-wrap justify-center gap-3 pt-2">
			<a class="primary-link" href={repositoryUrl} target="_blank" rel="noreferrer">
				<GitHubIcon size={16} />
				View on GitHub
			</a>
			<a class="outline-link" href={demoUrl} target="_blank" rel="noreferrer">
				Open tech demo
				<ArrowRight size={16} />
			</a>
		</div>
	</section>

	<section class="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40" aria-label="Arcivo at a glance">
		<div class="mx-auto grid max-w-4xl grid-cols-2 divide-x divide-y divide-neutral-200 dark:divide-neutral-800 sm:grid-cols-4 sm:divide-y-0">
			<div class="stat"><span class="stat-value">100<span>%</span></span><span>Self-hosted & private</span></div>
			<div class="stat"><span class="stat-value">0<span>$</span></span><span>Free & open source</span></div>
			<div class="stat"><span class="stat-value">∞</span><span>Documents supported</span></div>
			<div class="stat"><span class="stat-value">1<span>s</span></span><span>Full-text search</span></div>
		</div>
	</section>

	<section id="features" class="site-section">
		<p class="section-label">Features</p>
		<h2 class="section-title">Everything you need, nothing you don't.</h2>
		<p class="section-subtitle">A focused set of tools to keep your documents under control.</p>

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each features as feature (feature.title)}
				{@const Icon = feature.icon}
				<article class="feature-card">
					<div class="feature-icon"><Icon size={20} /></div>
					<h3 class="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">{feature.title}</h3>
					<p class="mt-1.5 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{feature.description}</p>
				</article>
			{/each}
		</div>
	</section>

	<section id="interface" class="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40">
		<div class="site-section grid items-center gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
			<div>
				<p class="section-label">Interface</p>
				<h2 class="section-title">Clean by design.</h2>
				<p class="section-subtitle mb-6">
					A distraction-free interface built to keep you focused on your documents, not the tool.
				</p>
				<a class="primary-link" href={demoUrl} target="_blank" rel="noreferrer">
					Open tech demo
					<ArrowRight size={16} />
				</a>
			</div>

			<div class="min-w-0 overflow-x-auto rounded-xl shadow-[0_8px_32px_rgb(0_0_0_/_0.08)] dark:shadow-[0_8px_40px_rgb(0_0_0_/_0.5)]">
				<div class="min-w-190">
					<DocumentListPreview />
				</div>
			</div>
		</div>
	</section>

	<section class="site-section py-20 text-center">
		<div class="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 dark:border-red-950 dark:bg-red-950/30 sm:px-10">
			<h2 class="section-title mb-3">Ready to organise your documents?</h2>
			<p class="mx-auto mb-8 max-w-lg text-base text-neutral-500 dark:text-neutral-400">
				Arcivo is free, open source, and ready to self-host. Get started in minutes.
			</p>
			<div class="flex flex-wrap justify-center gap-3">
				<a class="primary-link" href={repositoryUrl} target="_blank" rel="noreferrer">
					<GitHubIcon size={16} />
					View on GitHub
				</a>
				<a class="outline-link" href={playbookUrl} target="_blank" rel="noreferrer">
					View the UI playbook
					<ArrowRight size={16} />
				</a>
			</div>
		</div>
	</section>
</main>

<footer class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-6 py-6 text-sm text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
	<span>© 2026 Arcivo · MIT License</span>
	<div class="flex gap-4">
		<a href={repositoryUrl} target="_blank" rel="noreferrer" class="hover:text-neutral-600 dark:hover:text-neutral-300">GitHub</a>
		<a href={playbookUrl} target="_blank" rel="noreferrer" class="hover:text-neutral-600 dark:hover:text-neutral-300">UI playbook</a>
	</div>
</footer>
