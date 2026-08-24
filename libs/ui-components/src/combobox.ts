export type ComboboxItem = {
	id: string;
	label: string;
	subtitle?: string;
	imageUrl?: string;
	initials?: string;
};

export type ComboboxGroup = {
	heading?: string;
	items: ComboboxItem[];
};
