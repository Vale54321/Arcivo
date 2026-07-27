import type { LucideIcon } from '@lucide/svelte';

export interface MenuItem {
	label: string;
	icon: LucideIcon;
	onSelect: () => void;
	danger?: boolean;
	separated?: boolean;
}

export interface MenuPosition {
	x: number;
	y: number;
}
