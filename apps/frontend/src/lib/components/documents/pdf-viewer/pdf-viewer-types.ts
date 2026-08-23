export type PdfJs = typeof import('pdfjs-dist');

export type PdfSearchResult = {
	page: number;
	occurrence: number;
	before: string;
	match: string;
	after: string;
};
