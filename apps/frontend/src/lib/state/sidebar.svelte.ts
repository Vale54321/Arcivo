import { setContext, getContext } from 'svelte';

export class SidebarState {
	isOpen = $state(false);

	open() {
		this.isOpen = true;
	}

	close() {
		this.isOpen = false;
	}

	toggle() {
		this.isOpen = !this.isOpen;
	}
}

const SIDEBAR_KEY = Symbol('sidebar');

export function setSidebarContext() {
	const sidebar = new SidebarState();
	setContext(SIDEBAR_KEY, sidebar);
	return sidebar;
}

export function getSidebarContext() {
	return getContext<SidebarState>(SIDEBAR_KEY);
}
