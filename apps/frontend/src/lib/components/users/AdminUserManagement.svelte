<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus } from '@lucide/svelte';
	import { ApiError, api, type User } from '$lib/api';
	import { Button, Header, Input, Modal, Spinner } from '@arcivo/ui-components';

	let users = $state<User[]>([]);
	let loading = $state(true);
	let creating = $state(false);
	let createDialogOpen = $state(false);
	let saving = $state(false);
	let resettingPassword = $state(false);
	let editingUserId = $state<string | null>(null);
	let error = $state('');
	let createError = $state('');
	let editError = $state('');
	let editSuccess = $state('');
	let success = $state('');

	let newEmail = $state('');
	let newDisplayName = $state('');
	let newPassword = $state('');
	let editEmail = $state('');
	let editDisplayName = $state('');
	let resetPassword = $state('');
	let editingBusy = $derived(saving || resettingPassword);

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
		createError = '';
		success = '';
		creating = true;
		try {
			const user = await api.createUser({
				email: newEmail.trim(),
				displayName: newDisplayName.trim(),
				password: newPassword
			});
			users = [...users, user];
			resetCreateForm();
			createDialogOpen = false;
			success = `${user.displayName} wurde erstellt.`;
		} catch (cause) {
			createError = message(cause, 'Benutzer konnte nicht erstellt werden.');
		} finally {
			creating = false;
		}
	}

	function resetCreateForm() {
		newEmail = '';
		newDisplayName = '';
		newPassword = '';
		createError = '';
	}

	function openCreateDialog() {
		if (creating) return;
		resetCreateForm();
		createDialogOpen = true;
	}

	function closeCreateDialog() {
		if (creating) return;
		createDialogOpen = false;
		resetCreateForm();
	}

	function beginEdit(user: User) {
		if (editingBusy) return;
		editingUserId = user.id;
		editEmail = user.email;
		editDisplayName = user.displayName;
		resetPassword = '';
		editError = '';
		editSuccess = '';
		error = '';
		success = '';
	}

	function resetEditForm() {
		editEmail = '';
		editDisplayName = '';
		resetPassword = '';
		editError = '';
		editSuccess = '';
	}

	function cancelEdit() {
		if (editingBusy) return;
		editingUserId = null;
		resetEditForm();
	}

	async function saveUser() {
		if (!editingUserId || editingBusy) return;
		editError = '';
		editSuccess = '';
		success = '';
		saving = true;
		try {
			const updated = await api.updateUser(editingUserId, {
				email: editEmail.trim(),
				displayName: editDisplayName.trim()
			});
			users = users.map((user) => (user.id === updated.id ? updated : user));
			editingUserId = null;
			resetEditForm();
			success = `${updated.displayName} wurde gespeichert.`;
		} catch (cause) {
			editError = message(cause, 'Benutzer konnte nicht gespeichert werden.');
		} finally {
			saving = false;
		}
	}

	async function submitPasswordReset() {
		if (!editingUserId || editingBusy) return;
		editError = '';
		editSuccess = '';
		success = '';
		resettingPassword = true;
		try {
			await api.resetUserPassword(editingUserId, { password: resetPassword });
			resetPassword = '';
			editSuccess = 'Passwort wurde zurückgesetzt.';
			success = 'Passwort wurde zurückgesetzt.';
		} catch (cause) {
			editError = message(cause, 'Passwort konnte nicht zurückgesetzt werden.');
		} finally {
			resettingPassword = false;
		}
	}
</script>

<section class="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
	<div class="mb-5 flex flex-wrap items-start justify-between gap-4">
		<Header
			title="Benutzerverwaltung"
			description="Erstelle Benutzer, aktualisiere ihre Kontodaten oder setze ein neues Passwort."
			class="!mb-0"
		/>
		<Button variant="primary" onclick={openCreateDialog}>
			{#snippet leading()}<Plus size={16} />{/snippet}
			Benutzer hinzufügen
		</Button>
	</div>

	<Modal
		open={createDialogOpen}
		onClose={closeCreateDialog}
		title="Benutzer erstellen"
		size="md"
		dismissOnEscape={!creating}
		dismissOnBackdrop={!creating}
	>
		<form
			id="create-user-form"
			onsubmit={(event) => {
				event.preventDefault();
				void createUser();
			}}
			class="space-y-4"
		>
			<div class="grid gap-4 sm:grid-cols-2">
				<Input bind:value={newDisplayName} label="Anzeigename" required maxlength={100} />
				<Input bind:value={newEmail} label="E-Mail-Adresse" type="email" required maxlength={320} />
			</div>
			<Input
				label="Initiales Passwort"
				bind:value={newPassword}
				type="password"
				required
				minlength={8}
				maxlength={128}
			/>
			{#if createError}
				<p
					role="alert"
					class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
				>
					{createError}
				</p>
			{/if}
		</form>

		{#snippet footer()}
			<Button variant="secondary" onclick={closeCreateDialog} disabled={creating}>Abbrechen</Button>
			<Button
				type="submit"
				form="create-user-form"
				variant="primary"
				loading={creating}
				loadingLabel="Benutzer wird erstellt"
			>
				Benutzer erstellen
			</Button>
		{/snippet}
	</Modal>

	<Modal
		open={editingUserId !== null}
		onClose={cancelEdit}
		title="Benutzer bearbeiten"
		size="md"
		dismissOnEscape={!editingBusy}
		dismissOnBackdrop={!editingBusy}
	>
		{#if editError}
			<p
				role="alert"
				class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
			>
				{editError}
			</p>
		{:else if editSuccess}
			<p
				role="status"
				class="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
			>
				{editSuccess}
			</p>
		{/if}

		<form
			id="edit-user-form"
			onsubmit={(event) => {
				event.preventDefault();
				void saveUser();
			}}
			class="space-y-4"
		>
			<div class="grid gap-4 sm:grid-cols-2">
				<Input
					bind:value={editDisplayName}
					label="Anzeigename"
					required
					maxlength={100}
					disabled={editingBusy}
				/>
				<Input
					bind:value={editEmail}
					label="E-Mail-Adresse"
					type="email"
					required
					maxlength={320}
					disabled={editingBusy}
				/>
			</div>
		</form>

		<form
			onsubmit={(event) => {
				event.preventDefault();
				void submitPasswordReset();
			}}
			class="border-t border-neutral-200 pt-5 dark:border-neutral-800"
		>
			<div class="mb-4">
				<h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
					Passwort zurücksetzen
				</h3>
				<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
					Lege ein neues Passwort für diesen Benutzer fest.
				</p>
			</div>
			<Input
				bind:value={resetPassword}
				label="Neues Passwort"
				type="password"
				required
				minlength={8}
				maxlength={128}
				disabled={editingBusy}
			/>
			<div class="mt-3 flex justify-end">
				<Button
					type="submit"
					variant="outline"
					loading={resettingPassword}
					disabled={saving}
					loadingLabel="Passwort wird zurückgesetzt"
				>
					Passwort zurücksetzen
				</Button>
			</div>
		</form>

		{#snippet footer()}
			<Button variant="secondary" onclick={cancelEdit} disabled={editingBusy}>Abbrechen</Button>
			<Button
				type="submit"
				form="edit-user-form"
				variant="primary"
				loading={saving}
				disabled={resettingPassword}
				loadingLabel="Änderungen werden gespeichert"
			>
				Speichern
			</Button>
		{/snippet}
	</Modal>

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
