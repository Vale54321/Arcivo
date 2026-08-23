import type { Component } from 'svelte';
import ActionItemShowcase from '../components/action-item/ActionItemShowcase.svelte';
import AreaShowcase from '../components/area/AreaShowcase.svelte';
import ButtonShowcase from '../components/button/ButtonShowcase.svelte';
import HeaderShowcase from '../components/header/HeaderShowcase.svelte';
import InputShowcase from '../components/input/InputShowcase.svelte';
import ModalShowcase from '../components/modal/ModalShowcase.svelte';
import NavItemShowcase from '../components/nav-item/NavItemShowcase.svelte';
import OverlayShowcase from '../components/overlay/OverlayShowcase.svelte';
import SpinnerShowcase from '../components/spinner/SpinnerShowcase.svelte';

export type ComponentId =
	| 'action-item'
	| 'area'
	| 'button'
	| 'header'
	| 'input'
	| 'modal'
	| 'nav-item'
	| 'overlay'
	| 'spinner';

export interface ComponentDefinition {
  id: ComponentId;
  name: string;
  description: string;
  showcase: Component;
}

export const components: ComponentDefinition[] = [
	{
		id: 'action-item',
		name: 'ActionItem',
		description: 'Builds consistent clickable rows for search results and context-menu actions.',
		showcase: ActionItemShowcase
	},
	{
    id: 'area',
    name: 'Area',
    description: 'Groups related content in a titled, bordered section.',
    showcase: AreaShowcase,
  },
  {
    id: 'button',
    name: 'Button',
    description: 'Triggers actions with consistent variants, sizes, and states.',
    showcase: ButtonShowcase,
  },
  {
    id: 'header',
    name: 'Header',
    description: 'Creates consistent headings for pages and content sections.',
    showcase: HeaderShowcase,
  },
  {
    id: 'input',
    name: 'Input',
    description: 'Collects user input with labels, validation, and helpful states.',
    showcase: InputShowcase,
  },
  {
    id: 'modal',
    name: 'Modal',
    description: 'Creates centered dialogs with shared headers, content, footers, and dismissal behavior.',
    showcase: ModalShowcase,
  },
  {
    id: 'nav-item',
    name: 'NavItem',
    description: 'Builds consistent links, selectable views, and unavailable sidebar destinations.',
    showcase: NavItemShowcase,
  },
  {
    id: 'overlay',
    name: 'Overlay',
    description: 'Wraps dialogs and positioned menus with shared dismissal and surface behavior.',
    showcase: OverlayShowcase,
  },
  {
    id: 'spinner',
    name: 'Spinner',
    description: 'Indicates loading or pending work without interrupting the flow.',
    showcase: SpinnerShowcase,
  },
];
