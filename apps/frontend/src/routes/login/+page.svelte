<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { ArcivoLogo, Button, Input, Modal } from '@arcivo/ui-components';
	import { ApiError, api } from '$lib/api';
	import { getAccessToken, setAccessToken } from '$lib/auth';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let submitting = $state(false);

	onMount(() => {
		if (getAccessToken()) void goto(resolve('/'), { replaceState: true });
	});

	async function submit() {
		if (submitting) return;
		error = '';
		submitting = true;

		try {
			const response = await api.login(email.trim(), password);
			setAccessToken(response.accessToken);
			await goto(resolve('/'), { replaceState: true });
		} catch (cause) {
			error =
				cause instanceof ApiError
					? cause.status === 401
						? 'E-Mail-Adresse oder Passwort ist falsch.'
						: cause.message
					: 'Die Anmeldung ist derzeit nicht verfügbar.';
		} finally {
			submitting = false;
		}
	}

	function keepLoginOpen(): void {}
</script>

<svelte:head>
	<title>Anmelden · Arcivo</title>
</svelte:head>

<div class="min-h-screen bg-neutral-50 dark:bg-neutral-950" aria-hidden="true"></div>

<Modal
	open={true}
	onClose={keepLoginOpen}
	title="Anmelden"
	ariaLabel="Bei Arcivo anmelden"
	size="sm"
	dismissOnEscape={false}
	dismissOnBackdrop={false}
>
	{#snippet header()}
		<div class="flex w-full flex-col items-center gap-4 text-center">
			<ArcivoLogo size="lg" />
			<div>
				<h1 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
					Willkommen zurück
				</h1>
				<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Melde dich bei Arcivo an.</p>
			</div>
		</div>
	{/snippet}

	<form
		onsubmit={(event) => {
			event.preventDefault();
			void submit();
		}}
		class="space-y-4"
	>
		<Input
			bind:value={email}
			label="E-Mail-Adresse"
			type="email"
			autocomplete="email"
			required
			maxlength={320}
			placeholder="name@example.com"
		/>

		<Input
			bind:value={password}
			label="Passwort"
			type="password"
			autocomplete="current-password"
			required
			minlength={8}
			maxlength={128}
		/>

		{#if error}
			<p
				role="alert"
				class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
			>
				{error}
			</p>
		{/if}

		<Button
			type="submit"
			variant="primary"
			size="lg"
			fullWidth
			loading={submitting}
			loadingLabel="Anmeldung wird verarbeitet"
		>
			Anmelden
		</Button>
	</form>
</Modal>
