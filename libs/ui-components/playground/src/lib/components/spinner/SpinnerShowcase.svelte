<script lang="ts">
  import SpinnerProgress from "./examples/SpinnerProgress.svelte";
  import { exampleCode } from "../../shared/exampleCode";
  import Section from "../../shared/Section.svelte";
</script>

<Section
  title="Progress indicators"
  description="The spinner inherits the current text color, making it easy to use on surfaces and inside buttons."
  code={exampleCode("SpinnerProgress.svelte")}
>
  <SpinnerProgress />
</Section>
