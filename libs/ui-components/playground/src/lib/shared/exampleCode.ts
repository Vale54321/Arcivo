const exampleSources = import.meta.glob('../components/*/examples/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export function exampleCode(fileName: string): string {
	const source = Object.entries(exampleSources).find(([path]) => path.endsWith(`/${fileName}`))?.[1];
	if (!source) throw new Error(`Example source not found: ${fileName}`);
	return source;
}
