<script lang="ts">
	import { ArrowRight, FileSearch, GitBranch, LockKeyhole, Upload } from '@lucide/svelte';
	import { Area, Button, Header, NavItem } from '@arcivo/ui-components';
	import DocumentListPreview from '$lib/components/DocumentListPreview.svelte';

	const forgejoUrl = 'https://git.heiserer.de/Arcivo/Arcivo';
	const demoUrl = 'https://arcivo.heiserer.de';
</script>

<svelte:head>
	<title>Arcivo — Self-hosted document management</title>
	<meta name="description" content="Upload, process, search, and manage documents on your own server with Arcivo." />
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<main>
	<section class="hero-grid border-b border-neutral-200 dark:border-neutral-800">
		<div class="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:py-20">
			<div>
				<p class="section-kicker">Self-hosted document management</p>
				<h1 class="mt-4 max-w-lg text-4xl font-semibold tracking-[-0.035em] text-neutral-950 sm:text-5xl dark:text-neutral-100">Upload, search, and manage your documents.</h1>
				<p class="mt-5 max-w-lg text-base leading-7 text-neutral-600 dark:text-neutral-400">Arcivo stores documents on your own infrastructure, extracts searchable text, and keeps the original files together with their generated previews.</p>
				<div class="mt-7 flex flex-wrap gap-3">
					<Button href={demoUrl} variant="primary" size="lg" target="_blank" rel="noreferrer">
						Open demo
						{#snippet trailing()}<ArrowRight size={16} />{/snippet}
					</Button>
					<Button href={forgejoUrl} variant="outline" size="lg" target="_blank" rel="noreferrer">
						{#snippet leading()}<GitBranch size={16} />{/snippet}
						Source code
					</Button>
				</div>
			</div>

			<div class="min-w-0 overflow-x-auto rounded-xl shadow-lg">
				<div class="min-w-180"><DocumentListPreview /></div>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-6xl px-5 py-16 sm:px-8">
		<Header level={1} title="What Arcivo does" description="The main document workflow is available in one consistent interface." />
		<div class="grid gap-4 md:grid-cols-3">
			<Area title="Upload" description="Add documents with the file picker or drag and drop.">
				<div class="area-icon"><Upload size={20} /></div>
				<p class="area-copy">Arcivo calculates checksums before transfer and keeps the uploaded original.</p>
			</Area>
			<Area title="Process" description="Create previews and searchable document text.">
				<div class="area-icon"><FileSearch size={20} /></div>
				<p class="area-copy">Background jobs handle text extraction, thumbnails, and PDF/A conversion.</p>
			</Area>
			<Area title="Self-host" description="Keep control of storage and access.">
				<div class="area-icon"><LockKeyhole size={20} /></div>
				<p class="area-copy">Run Arcivo on your own server without an external document provider.</p>
			</Area>
		</div>
		<div class="mt-6"><Button href="/features" variant="link">View all features {#snippet trailing()}<ArrowRight size={15} />{/snippet}</Button></div>
	</section>

	<section class="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40">
		<div class="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.42fr_0.58fr]">
			<Header title="Development is public" description="Bugs, planned features, and longer-term ideas are tracked in the Arcivo Forgejo repository." />
			<Area title="Project links" description="Follow development or contribute to the project.">
				<div class="space-y-1">
					<NavItem label="Roadmap and selected issues" description="Overview of current work and planned features" href="/roadmap" initial="R" />
					<NavItem label="All Forgejo issues" description="Complete issue list and discussions" href={`${forgejoUrl}/issues`} initial="I" />
					<NavItem label="Source repository" description="Code, releases, and contribution history" href={forgejoUrl} initial="G" />
				</div>
			</Area>
		</div>
	</section>
</main>
