import type { Component } from 'svelte';
import AreaShowcase from '../components/area/AreaShowcase.svelte';
import ButtonShowcase from '../components/button/ButtonShowcase.svelte';
import HeaderShowcase from '../components/header/HeaderShowcase.svelte';
import InputShowcase from '../components/input/InputShowcase.svelte';
import SpinnerShowcase from '../components/spinner/SpinnerShowcase.svelte';

export type ComponentId = 'area' | 'button' | 'header' | 'input' | 'spinner';

export interface ComponentDefinition {
	id: ComponentId;
	name: string;
	description: string;
	showcase: Component;
}

export const components: ComponentDefinition[] = [
	{
		id: 'area',
		name: 'Area',
		description: 'Groups related content in a titled, bordered section.',
		showcase: AreaShowcase
	},
	{
		id: 'button',
		name: 'Button',
		description: 'Triggers actions with consistent variants, sizes, and states.',
		showcase: ButtonShowcase
	},
	{
		id: 'header',
		name: 'Header',
		description: 'Creates consistent headings for pages and content sections.',
		showcase: HeaderShowcase
	},
	{
		id: 'input',
		name: 'Input',
		description: 'Collects user input with labels, validation, and helpful states.',
		showcase: InputShowcase
	},
	{
		id: 'spinner',
		name: 'Spinner',
		description: 'Indicates loading or pending work without interrupting the flow.',
		showcase: SpinnerShowcase
	}
];
