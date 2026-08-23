<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
	}

	let { size = 16, class: className = '' }: Props = $props();
</script>

<span
	class="inline-block animate-spin rounded-full border-2 border-current border-r-transparent {className}"
	style="width: {size}px; height: {size}px"
	aria-label="Wird geladen"
></span>
