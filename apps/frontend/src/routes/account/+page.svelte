<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { ApiError, api, type User } from '$lib/api';
	import { clearAccessToken } from '$lib/auth';
	import { Spinner } from '@arcivo/ui-components';
	import { setCurrentUser } from '$lib/state/current-user';
	import AdminUserManagement from '$lib/components/users/AdminUserManagement.svelte';
	import { LogOut } from '@lucide/svelte';

	let user = $state<User | null>(null);
	let email = $state('');
	let displayName = $state('');
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(() => {
		void loadUser();
	});

	async function loadUser() {
		loading = true;
		error = '';
		try {
			user = await api.getCurrentUser();
			setCurrentUser(user);
			email = user.email;
			displayName = user.displayName;
		} catch (cause) {
			error =
				cause instanceof ApiError ? cause.message : 'Kontodaten konnten nicht geladen werden.';
		} finally {
			loading = false;
		}
	}

	async function save() {
		if (!user || saving) return;
		error = '';
		success = '';
		saving = true;

		try {
			user = await api.updateUser(user.id, {
				email: email.trim(),
				displayName: displayName.trim()
			});
			setCurrentUser(user);
			email = user.email;
			displayName = user.displayName;
			success = 'Deine Kontodaten wurden gespeichert.';
		} catch (cause) {
			error =
				cause instanceof ApiError ? cause.message : 'Kontodaten konnten nicht gespeichert werden.';
		} finally {
			saving = false;
		}
	}

	async function logout() {
		clearAccessToken();
		await goto(resolve('/login'), { replaceState: true });
	}
</script>

<svelte:head>
	<title>Konto · Arcivo</title>
</svelte:head>

<div class="mx-auto w-full max-w-xl">
	<div class="mb-7">
		<h1 class="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Mein Konto</h1>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			Verwalte deine persönlichen Kontodaten.
		</p>
	</div>

	{#if loading}
		<div
			class="flex min-h-48 items-center justify-center rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
		>
			<Spinner size={24} class="text-neutral-400" />
		</div>
	{:else if error && !user}
		<div
			role="alert"
			class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
		>
			{error}
		</div>
	{:else if user}
		<form
			onsubmit={(event) => {
				event.preventDefault();
				void save();
			}}
			class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
		>
			<div class="space-y-5">
				<label class="block">
					<span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
						>Anzeigename</span
					>
					<input
						bind:value={displayName}
						type="text"
						autocomplete="name"
						required
						maxlength="100"
						class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm transition-colors outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
					/>
				</label>

				<label class="block">
					<span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
						>E-Mail-Adresse</span
					>
					<input
						bind:value={email}
						type="email"
						autocomplete="email"
						required
						maxlength="320"
						class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm transition-colors outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
					/>
				</label>
			</div>

			{#if error}
				<p
					role="alert"
					class="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
				>
					{error}
				</p>
			{/if}
			{#if success}
				<p
					role="status"
					class="mt-5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
				>
					{success}
				</p>
			{/if}

			<div
				class="mt-6 flex items-center justify-between border-t border-neutral-200 pt-5 dark:border-neutral-800"
			>
				<button
					type="button"
					onclick={() => void logout()}
					class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
				>
					<LogOut size={16} />
					Abmelden
				</button>

				<button
					type="submit"
					disabled={saving}
					class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-700 dark:hover:bg-red-600"
				>
					{#if saving}<Spinner size={15} />{/if}
					Änderungen speichern
				</button>
			</div>
		</form>

		{#if user.isAdmin}
			<AdminUserManagement />
		{/if}
	{/if}
</div>
