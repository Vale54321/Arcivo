<script lang="ts">
  import ButtonFullWidth from "./examples/ButtonFullWidth.svelte";
  import ButtonIconOnly from "./examples/ButtonIconOnly.svelte";
  import ButtonIcons from "./examples/ButtonIcons.svelte";
  import ButtonSizes from "./examples/ButtonSizes.svelte";
  import ButtonStates from "./examples/ButtonStates.svelte";
  import ButtonVariants from "./examples/ButtonVariants.svelte";
  import { exampleCode } from "../../shared/exampleCode";
  import Section from "../../shared/Section.svelte";
</script>

<div class="space-y-5">
  <Section
    title="Variants"
    description="The neutral secondary variant is the default. Use stronger emphasis only when the action calls for it."
    code={exampleCode("ButtonVariants.svelte")}
  >
    <ButtonVariants />
  </Section>

  <div class="grid gap-5 lg:grid-cols-2">
    <Section
      title="Sizes"
      description="Three sizes cover compact controls through primary form actions."
      code={exampleCode("ButtonSizes.svelte")}
    >
      <ButtonSizes />
    </Section>

    <Section
      title="States"
      description="The loading state prevents duplicate submissions and announces progress."
      code={exampleCode("ButtonStates.svelte")}
    >
      <ButtonStates />
    </Section>

    <Section
      title="Icons"
      description="Use snippets to place an icon before or after a label."
      code={exampleCode("ButtonIcons.svelte")}
    >
      <ButtonIcons />
    </Section>

    <Section
      title="Icon-only"
      description="Always give icon-only buttons an accessible label."
      code={exampleCode("ButtonIconOnly.svelte")}
    >
      <ButtonIconOnly />
    </Section>
  </div>

  <Section
    title="Full width"
    description="Use this for primary actions in narrow layouts and forms."
    code={exampleCode("ButtonFullWidth.svelte")}
  >
    <ButtonFullWidth />
  </Section>
</div>
