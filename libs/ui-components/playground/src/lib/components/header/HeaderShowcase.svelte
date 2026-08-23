<script lang="ts">
  import CodePreview from "../../shared/CodePreview.svelte";
  import HeaderLevel1WithSubtitle from "./examples/HeaderLevel1WithSubtitle.svelte";
  import HeaderLevel1WithoutSubtitle from "./examples/HeaderLevel1WithoutSubtitle.svelte";
  import HeaderLevel2WithSubtitle from "./examples/HeaderLevel2WithSubtitle.svelte";
  import HeaderLevel2WithoutSubtitle from "./examples/HeaderLevel2WithoutSubtitle.svelte";
  import { exampleCode } from "../../shared/exampleCode";
</script>

<div class="space-y-5">
  <div class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
    <HeaderLevel1WithSubtitle />
    <p class="text-sm text-neutral-600 dark:text-neutral-400">Level 1 with subtitle</p>
    <CodePreview code={exampleCode("HeaderLevel1WithSubtitle.svelte")} />
  </div>

  <div class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
    <HeaderLevel1WithoutSubtitle />
    <p class="text-sm text-neutral-600 dark:text-neutral-400">Level 1 without subtitle</p>
    <CodePreview code={exampleCode("HeaderLevel1WithoutSubtitle.svelte")} />
  </div>

  <div class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
    <HeaderLevel2WithSubtitle />
    <p class="text-sm text-neutral-600 dark:text-neutral-400">Level 2 with subtitle</p>
    <CodePreview code={exampleCode("HeaderLevel2WithSubtitle.svelte")} />
  </div>

  <div class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
    <HeaderLevel2WithoutSubtitle />
    <p class="text-sm text-neutral-600 dark:text-neutral-400">Level 2 without subtitle</p>
    <CodePreview code={exampleCode("HeaderLevel2WithoutSubtitle.svelte")} />
  </div>
</div>
