<script lang="ts">
  import InputBare from "./examples/InputBare.svelte";
	import InputLeading from './examples/InputLeading.svelte';
	import InputLabeledFields from "./examples/InputLabeledFields.svelte";
	import InputSearch from './examples/InputSearch.svelte';
	import InputStates from './examples/InputStates.svelte';
	import InputTypes from './examples/InputTypes.svelte';
	import InputTrailing from './examples/InputTrailing.svelte';
  import InputValidation from "./examples/InputValidation.svelte";
  import { exampleCode } from "../../shared/exampleCode";
  import Section from "../../shared/Section.svelte";
</script>

<div class="space-y-5">
  <Section
    title="Labeled fields"
    description="Use the default field variant for form controls that need a label, hint, or validation message."
    code={exampleCode("InputLabeledFields.svelte")}
  >
    <InputLabeledFields />
  </Section>

  <div class="grid gap-5 lg:grid-cols-2">
    <Section
      title="Validation"
      description="Error messaging takes precedence over a regular hint."
      code={exampleCode("InputValidation.svelte")}
    >
      <InputValidation />
    </Section>

    <Section
      title="Leading content"
      description="Use the leading snippet for contextual, non-interactive content."
      code={exampleCode("InputLeading.svelte")}
    >
      <InputLeading />
    </Section>

    <Section
      title="Trailing content"
      description="Use the trailing snippet for contextual, non-interactive content at the end of the field."
      code={exampleCode("InputTrailing.svelte")}
    >
      <InputTrailing />
    </Section>

    <Section
      title="States"
      description="Disabled fields cannot be edited; read-only fields retain their normal appearance."
      code={exampleCode("InputStates.svelte")}
    >
      <InputStates />
    </Section>

    <Section
      title="Bare input"
      description="Use the bare variant for compact controls without labels or extra content."
      code={exampleCode("InputBare.svelte")}
    >
      <InputBare />
    </Section>

    <Section
      title="Search input"
      description="Use the search variant for search controls with a built-in icon and native search behavior."
      code={exampleCode("InputSearch.svelte")}
    >
      <InputSearch />
    </Section>
  </div>

  <Section
    title="Native input types"
    description="The component forwards native input attributes for date, number, URL, and other standard input types."
    code={exampleCode("InputTypes.svelte")}
  >
    <InputTypes />
  </Section>
</div>
