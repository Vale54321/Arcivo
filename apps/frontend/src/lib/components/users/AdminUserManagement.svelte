<script lang="ts">
	import { onMount } from 'svelte';
	import { ApiError, api, type User } from '$lib/api';
	import { Area, Button, Header, Input, Spinner } from '@arcivo/ui-components';

	let users = $state<User[]>([]);
	let loading = $state(true);
	let creating = $state(false);
	let saving = $state(false);
	let resettingPassword = $state(false);
	let editingUserId = $state<string | null>(null);
	let error = $state('');
	let success = $state('');

	let newEmail = $state('');
	let newDisplayName = $state('');
	let newPassword = $state('');
	let editEmail = $state('');
	let editDisplayName = $state('');
	let resetPassword = $state('');

	onMount(() => {
		void loadUsers();
	});

	function message(cause: unknown, fallback: string): string {
		return cause instanceof ApiError ? cause.message : fallback;
	}

	async function loadUsers() {
		loading = true;
		error = '';
		try {
			users = await api.getUsers();
		} catch (cause) {
			error = message(cause, 'Benutzer konnten nicht geladen werden.');
		} finally {
			loading = false;
		}
	}

	async function createUser() {
		if (creating) return;
		error = '';
		success = '';
		creating = true;
		try {
			const user = await api.createUser({
				email: newEmail.trim(),
				displayName: newDisplayName.trim(),
				password: newPassword
			});
			users = [...users, user];
			newEmail = '';
			newDisplayName = '';
			newPassword = '';
			success = `${user.displayName} wurde erstellt.`;
		} catch (cause) {
			error = message(cause, 'Benutzer konnte nicht erstellt werden.');
		} finally {
			creating = false;
		}
	}

	function beginEdit(user: User) {
		editingUserId = user.id;
		editEmail = user.email;
		editDisplayName = user.displayName;
		resetPassword = '';
		error = '';
		success = '';
	}

	function cancelEdit() {
		editingUserId = null;
		resetPassword = '';
	}

	async function saveUser() {
		if (!editingUserId || saving) return;
		error = '';
		success = '';
		saving = true;
		try {
			const updated = await api.updateUser(editingUserId, {
				email: editEmail.trim(),
				displayName: editDisplayName.trim()
			});
			users = users.map((user) => (user.id === updated.id ? updated : user));
			success = `${updated.displayName} wurde gespeichert.`;
		} catch (cause) {
			error = message(cause, 'Benutzer konnte nicht gespeichert werden.');
		} finally {
			saving = false;
		}
	}

	async function submitPasswordReset() {
		if (!editingUserId || resettingPassword) return;
		error = '';
		success = '';
		resettingPassword = true;
		try {
			await api.resetUserPassword(editingUserId, { password: resetPassword });
			resetPassword = '';
			success = 'Passwort wurde zurückgesetzt.';
		} catch (cause) {
			error = message(cause, 'Passwort konnte nicht zurückgesetzt werden.');
		} finally {
			resettingPassword = false;
		}
	}
</script>

<section class="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
	<Header
		title="Benutzerverwaltung"
		description="Erstelle Benutzer, aktualisiere ihre Kontodaten oder setze ein neues Passwort."
	/>

	<Area title="Benutzer erstellen">
		<form
			onsubmit={(event) => {
				event.preventDefault();
				void createUser();
			}}
		>
			<div class="grid gap-4 sm:grid-cols-2">
				<Input bind:value={newDisplayName} label="Anzeigename" required maxlength={100} />
				<Input bind:value={newEmail} label="E-Mail-Adresse" type="email" required maxlength={320} />
			</div>
			<Input
				class="mt-4"
				label="Initiales Passwort"
				bind:value={newPassword}
				type="password"
				required
				minlength={8}
				maxlength={128}
			/>
			<div class="mt-5 flex justify-end">
				<Button
					type="submit"
					variant="primary"
					size="md"
					loading={creating}
					loadingLabel="Benutzer wird erstellt"
				>
					Benutzer erstellen
				</Button>
			</div>
		</form>
	</Area>

	{#if error}
		<p role="alert" class="notice notice-error">{error}</p>
	{/if}
	{#if success}
		<p role="status" class="notice notice-success">{success}</p>
	{/if}

	<div
		class="mt-6 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
	>
		<div class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
			<h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
				Bestehende Benutzer
			</h3>
		</div>
		{#if loading}
			<div class="flex min-h-32 items-center justify-center">
				<Spinner size={22} class="text-neutral-400" />
			</div>
		{:else if users.length === 0}
			<p class="px-5 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
				Keine Benutzer vorhanden.
			</p>
		{:else}
			<div class="divide-y divide-neutral-200 dark:divide-neutral-800">
				{#each users as user (user.id)}
					<div class="p-5">
						{#if editingUserId === user.id}
							<form
								onsubmit={(event) => {
									event.preventDefault();
									void saveUser();
								}}
								class="space-y-4"
							>
								<div class="grid gap-4 sm:grid-cols-2">
									<Input bind:value={editDisplayName} label="Anzeigename" required maxlength={100} />
									<Input bind:value={editEmail} label="E-Mail-Adresse" type="email" required maxlength={320} />
								</div>
								<div class="flex justify-end gap-2">
									<Button type="button" size="md" onclick={cancelEdit}>Abbrechen</Button>
									<Button
										type="submit"
										variant="primary"
										size="md"
										loading={saving}
										loadingLabel="Änderungen werden gespeichert"
									>
										Speichern
									</Button>
								</div>
							</form>
							<form
								onsubmit={(event) => {
									event.preventDefault();
									void submitPasswordReset();
								}}
								class="mt-5 border-t border-neutral-200 pt-5 dark:border-neutral-800"
							>
								<Input
									bind:value={resetPassword}
									label="Neues Passwort"
									type="password"
									required
									minlength={8}
									maxlength={128}
								/>
								<div class="mt-3 flex justify-end">
									<Button
										size="md"
										loading={resettingPassword}
										loadingLabel="Passwort wird zurückgesetzt"
									>
										Passwort zurücksetzen
									</Button>
								</div>
							</form>
						{:else}
							<div class="flex items-center justify-between gap-4">
								<div class="min-w-0">
									<p class="truncate font-medium text-neutral-900 dark:text-neutral-100">
										{user.displayName}
									</p>
									<p class="truncate text-sm text-neutral-500 dark:text-neutral-400">
										{user.email}
									</p>
								</div>
								<Button type="button" size="md" onclick={() => beginEdit(user)}>Bearbeiten</Button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	.notice {
		margin-top: 1rem;
		border-radius: 0.5rem;
		padding: 0.75rem;
		font-size: 0.875rem;
	}
	.notice-error {
		background: color-mix(in srgb, var(--color-red-500) 10%, transparent);
		color: var(--color-red-700);
	}
	.notice-success {
		background: color-mix(in srgb, var(--color-emerald-500) 10%, transparent);
		color: var(--color-emerald-700);
	}
</style>
