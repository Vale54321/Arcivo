<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import { ApiError, api, type User } from "$lib/api";
  import { clearAccessToken } from "$lib/auth";
  import { Area, Button, Header, Input, Spinner } from "@arcivo/ui-components";
  import { setCurrentUser } from "$lib/state/current-user";
  import AdminUserManagement from "$lib/components/users/AdminUserManagement.svelte";
  import { LogOut } from "@lucide/svelte";

  let user = $state<User | null>(null);
  let email = $state("");
  let displayName = $state("");
  let loading = $state(true);
  let saving = $state(false);
  let error = $state("");
  let success = $state("");

  onMount(() => {
    void loadUser();
  });

  async function loadUser() {
    loading = true;
    error = "";
    try {
      user = await api.getCurrentUser();
      setCurrentUser(user);
      email = user.email;
      displayName = user.displayName;
    } catch (cause) {
      error =
        cause instanceof ApiError
          ? cause.message
          : "Kontodaten konnten nicht geladen werden.";
    } finally {
      loading = false;
    }
  }

  async function save() {
    if (!user || saving) return;
    error = "";
    success = "";
    saving = true;

    try {
      user = await api.updateUser(user.id, {
        email: email.trim(),
        displayName: displayName.trim(),
      });
      setCurrentUser(user);
      email = user.email;
      displayName = user.displayName;
      success = "Deine Kontodaten wurden gespeichert.";
    } catch (cause) {
      error =
        cause instanceof ApiError
          ? cause.message
          : "Kontodaten konnten nicht gespeichert werden.";
    } finally {
      saving = false;
    }
  }

  async function logout() {
    clearAccessToken();
    await goto(resolve("/login"), { replaceState: true });
  }
</script>

<svelte:head>
  <title>Konto · Arcivo</title>
</svelte:head>

<div class="mx-auto w-full max-w-xl">
  <Header
    level={1}
    title="Mein Konto"
    description="Verwalte deine persönlichen Kontodaten."
  />

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
    <Area title="Kontodaten">
      <form
        onsubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <div class="space-y-5">
          <Input
            bind:value={displayName}
            label="Anzeigename"
            type="text"
            autocomplete="name"
            required
            maxlength={100}
          />

          <Input
            bind:value={email}
            label="E-Mail-Adresse"
            type="email"
            autocomplete="email"
            required
            maxlength={320}
          />
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
          <Button
            type="button"
            variant="ghost"
            size="md"
            onclick={() => void logout()}
          >
            {#snippet leading()}<LogOut size={16} />{/snippet}
            Abmelden
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            loadingLabel="Änderungen werden gespeichert"
          >
            Änderungen speichern
          </Button>
        </div>
      </form>
    </Area>

    {#if user.isAdmin}
      <AdminUserManagement />
    {/if}
  {/if}
</div>
