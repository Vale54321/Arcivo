import { getContext, setContext } from 'svelte';

type Theme = 'light' | 'dark' | 'system';

class ThemeState {
	current = $state<Theme>('system');

	constructor() {
		this.current = this.getStoredTheme();
		this.syncDocumentTheme(this.current);
		// Listen for system theme changes if in system mode
		if (typeof window !== 'undefined') {
			window
				.matchMedia('(prefers-color-scheme: dark)')
				.addEventListener('change', this.handleSystemChange);
		}
	}

	set(value: Theme) {
		this.current = value;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('arcivo:theme', value);
		}
		this.syncDocumentTheme(value);
	}

	toggle = () => {
		// Cycle: system -> light -> dark -> system
		if (this.current === 'system') {
			this.set('light');
		} else if (this.current === 'light') {
			this.set('dark');
		} else {
			this.set('system');
		}
	};

	private getStoredTheme(): Theme {
		if (typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem('arcivo:theme');
			if (stored === 'dark' || stored === 'light' || stored === 'system') {
				return stored as Theme;
			}
		}
		return 'system';
	}

	private syncDocumentTheme(value: Theme) {
		if (typeof document !== 'undefined') {
			const dark =
				value === 'system'
					? window.matchMedia('(prefers-color-scheme: dark)').matches
					: value === 'dark';
			document.documentElement.classList.toggle('dark', dark);
		}
	}

	private handleSystemChange = () => {
		if (this.current === 'system') {
			this.syncDocumentTheme('system');
		}
	};
}

const THEME_KEY = Symbol('theme');

export function setThemeContext() {
	const theme = new ThemeState();
	setContext(THEME_KEY, theme);
	return theme;
}

export function getThemeContext() {
	return getContext<ThemeState>(THEME_KEY);
}
