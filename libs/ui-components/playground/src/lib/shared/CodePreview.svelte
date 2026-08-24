<script module lang="ts">
  let highlighterPromise: ReturnType<typeof loadHighlighter> | undefined;

  async function loadHighlighter() {
    const [core, engine, language, theme] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
      import("@shikijs/langs/svelte"),
      import("@shikijs/themes/plastic"),
    ]);

    return core.createHighlighterCore({
      langs: [language.default],
      themes: [theme.default],
      engine: engine.createJavaScriptRegexEngine(),
    });
  }

  function getHighlighter() {
    highlighterPromise ??= loadHighlighter();
    return highlighterPromise;
  }
</script>

<script lang="ts">
  import { Check, ChevronDown, Copy } from "@lucide/svelte";
  import { Button } from "../../../../src";

  interface Props {
    code: string;
  }

  function withoutScriptBlock(source: string): string {
    return source.replace(/<script\b[^>]*>[\s\S]*?<\/script>\s*/gi, "").trim();
  }

  let { code }: Props = $props();

  type HighlightToken = {
    content: string;
    color?: string;
    fontStyle?: number;
  };

  const displayCode = $derived(withoutScriptBlock(code));
  const plainLines = $derived(
    displayCode.split("\n").map((content) => [{ content, color: "#e5e5e5" }]),
  );
  let highlightedLines = $state<HighlightToken[][]>([]);
  let highlightedSource = $state("");
  let copied = $state(false);
  let expanded = $state(false);
  let renderedLines = $derived(
    highlightedSource === displayCode ? highlightedLines : plainLines,
  );

  $effect(() => {
    if (!expanded || highlightedSource === displayCode) return;

    let cancelled = false;
    void getHighlighter().then((highlighter) => {
      const { tokens } = highlighter.codeToTokens(displayCode, {
        lang: "svelte",
        theme: "plastic",
      });
      if (cancelled) return;
      highlightedLines = tokens;
      highlightedSource = displayCode;
    });

    return () => {
      cancelled = true;
    };
  });

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(displayCode);
      copied = true;
      window.setTimeout(() => (copied = false), 1600);
    } catch {
      copied = false;
    }
  }
</script>

<div
  class="mt-5 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700"
>
  <div
    class="flex items-center justify-between gap-3 bg-neutral-50 px-4 py-2 dark:bg-neutral-800"
  >
    <button
      type="button"
      onclick={() => (expanded = !expanded)}
      class="flex min-h-8 flex-1 cursor-pointer items-center gap-2 text-left text-sm font-semibold text-neutral-700 transition-colors hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none dark:text-neutral-200 dark:hover:text-white dark:focus-visible:ring-red-400"
      aria-expanded={expanded}
    >
      <ChevronDown
        size={16}
        aria-hidden="true"
        class="shrink-0 transition-transform {expanded ? '' : '-rotate-90'}"
      />
      Code
    </button>
    <Button
      type="button"
      variant="outline"
      size="sm"
      class="min-h-8 px-2.5"
      onclick={() => void copyCode()}
      aria-label="Copy code"
    >
      {#snippet leading()}
        {#if copied}
          <Check size={14} strokeWidth={2} />
        {:else}
          <Copy size={14} strokeWidth={2} />
        {/if}
      {/snippet}
      {copied ? "Copied" : "Copy code"}
    </Button>
  </div>
  {#if expanded}
    <pre
      class="overflow-x-auto border-t border-neutral-200 bg-neutral-950 p-4 text-sm leading-6 text-neutral-100 dark:border-neutral-700"><code
        class="block min-w-max"
        >{#each renderedLines as line, index}<span
            class="grid grid-cols-[2.5rem_1fr]"
            ><span
              class="pointer-events-none select-none pr-4 text-right text-neutral-600"
              aria-hidden="true">{index + 1}</span
            ><span class="select-text"
              >{#each line as token}<span
                  style:color={token.color}
                  class:italic={Boolean(token.fontStyle && token.fontStyle & 1)}
                  class:font-bold={Boolean(
                    token.fontStyle && token.fontStyle & 2,
                  )}
                  class:underline={Boolean(
                    token.fontStyle && token.fontStyle & 4,
                  )}>{token.content}</span
                >{/each}</span
            ></span
          >{/each}</code
      ></pre>
  {/if}
</div>
