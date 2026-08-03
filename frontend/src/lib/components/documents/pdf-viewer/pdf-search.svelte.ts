import type { PDFDocumentProxy } from 'pdfjs-dist';
import { SvelteMap } from 'svelte/reactivity';
import type { PdfSearchResult } from './pdf-viewer-types';

export class PdfSearchController {
	input = $state('');
	query = $state('');
	results = $state<PdfSearchResult[]>([]);
	currentIndex = $state(-1);
	pending = $state(false);
	readonly pageTextCache = new SvelteMap<number, string>();

	#generation = 0;
	#timer: ReturnType<typeof setTimeout> | undefined;
	#selectPage: (page: number) => void;

	constructor(selectPage: (page: number) => void) {
		this.#selectPage = selectPage;
	}

	get status(): string {
		if (this.pending) return 'Dokument wird durchsucht …';
		if (!this.query) return 'Suchbegriff eingeben';
		if (!this.results.length) return 'Keine Treffer';
		return `${this.currentIndex + 1} von ${this.results.length}`;
	}

	schedule(document: PDFDocumentProxy | undefined): void {
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => void this.run(document, this.input), 250);
	}

	async run(document: PDFDocumentProxy | undefined, value: string): Promise<void> {
		const query = value.trim();
		const generation = ++this.#generation;
		this.query = query;
		this.results = [];
		this.currentIndex = -1;
		if (!query || !document) return;

		this.pending = true;
		const normalizedQuery = query.toLocaleLowerCase();
		const nextResults: PdfSearchResult[] = [];

		try {
			for (let page = 1; page <= document.numPages; page += 1) {
				const text = await this.#getPageText(document, page);
				findPageMatches(text, page, normalizedQuery, nextResults);
			}

			if (generation !== this.#generation) return;
			this.results = nextResults;
			if (nextResults.length) this.select(0);
		} finally {
			if (generation === this.#generation) this.pending = false;
		}
	}

	select(index: number): void {
		const result = this.results[index];
		if (!result) return;
		this.currentIndex = index;
		this.#selectPage(result.page);
	}

	move(direction: -1 | 1): void {
		if (!this.results.length) return;
		const nextIndex = (this.currentIndex + direction + this.results.length) % this.results.length;
		this.select(nextIndex);
	}

	clear(): void {
		this.#generation += 1;
		this.query = '';
		this.results = [];
		this.currentIndex = -1;
		this.pending = false;
	}

	destroy(): void {
		clearTimeout(this.#timer);
		this.clear();
	}

	async #getPageText(document: PDFDocumentProxy, pageNumber: number): Promise<string> {
		const cachedText = this.pageTextCache.get(pageNumber);
		if (cachedText !== undefined) return cachedText;

		const page = await document.getPage(pageNumber);
		const content = await page.getTextContent();
		const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
		this.pageTextCache.set(pageNumber, text);
		return text;
	}
}

function findPageMatches(
	text: string,
	page: number,
	normalizedQuery: string,
	results: PdfSearchResult[]
): void {
	let offset = 0;
	let occurrence = 0;
	const normalizedText = text.toLocaleLowerCase();

	while ((offset = normalizedText.indexOf(normalizedQuery, offset)) !== -1) {
		results.push(createSearchResult(text, page, occurrence, offset, normalizedQuery.length));
		offset += Math.max(1, normalizedQuery.length);
		occurrence += 1;
	}
}

function createSearchResult(
	text: string,
	page: number,
	occurrence: number,
	offset: number,
	matchLength: number
): PdfSearchResult {
	const contextLength = 70;
	const start = Math.max(0, offset - contextLength);
	const end = Math.min(text.length, offset + matchLength + contextLength);
	const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

	return {
		page,
		occurrence,
		before: `${start > 0 ? '… ' : ''}${normalize(text.slice(start, offset))}`,
		match: text.slice(offset, offset + matchLength),
		after: `${normalize(text.slice(offset + matchLength, end))}${end < text.length ? ' …' : ''}`
	};
}
