import { File as FileIcon, FileImage, FileSpreadsheet, FileText } from '@lucide/svelte';

export function mimeIcon(mimeType: string) {
	if (mimeType.startsWith('image/')) return FileImage;
	if (mimeType.includes('pdf')) return FileText;
	if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileSpreadsheet;
	return FileIcon;
}

export function mimeLabel(mimeType: string): string {
	const map: Record<string, string> = {
		'application/pdf': 'PDF',
		'application/msword': 'Word',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
		'application/vnd.oasis.opendocument.text': 'ODT',
		'application/vnd.ms-excel': 'Excel',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
		'application/vnd.oasis.opendocument.spreadsheet': 'ODS',
		'application/vnd.ms-powerpoint': 'PowerPoint',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
		'application/vnd.oasis.opendocument.presentation': 'ODP'
	};

	if (map[mimeType]) return map[mimeType];
	if (mimeType.startsWith('image/')) return mimeType.split('/')[1].toUpperCase();
	if (mimeType.startsWith('text/')) return mimeType.split('/')[1].toUpperCase();
	return mimeType.split('/')[1]?.toUpperCase() || 'UNKNOWN';
}

export function formatSize(bytes: number): string {
	if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + ' MB';
	if (bytes >= 1_024) return (bytes / 1024).toFixed(0) + ' KB';
	return bytes + ' B';
}

export function truncateFilename(name: string, maxLength = 20): string {
	if (name.length <= maxLength) return name;
	const dotIndex = name.lastIndexOf('.');
	const ext = dotIndex !== -1 ? name.slice(dotIndex) : '';
	const base = dotIndex !== -1 ? name.slice(0, dotIndex) : name;
	const truncated = base.slice(0, maxLength - ext.length - 3);
	return truncated + '...' + ext;
}
