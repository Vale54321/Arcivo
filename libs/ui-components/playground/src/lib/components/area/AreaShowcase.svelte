<script lang="ts">
  import AreaAccountDetails from "./examples/AreaAccountDetails.svelte";
  import AreaEmpty from "./examples/AreaEmpty.svelte";
  import CodePreview from "../../shared/CodePreview.svelte";
  import { exampleCode } from "../../shared/exampleCode";
</script>

<div class="space-y-5">
  <div>
    <AreaAccountDetails />
    <CodePreview code={exampleCode("AreaAccountDetails.svelte")} />
  </div>

  <div>
    <AreaEmpty />
    <CodePreview code={exampleCode("AreaEmpty.svelte")} />
  </div>
</div>
