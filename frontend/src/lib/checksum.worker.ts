import CryptoJS from 'crypto-js';

self.onmessage = (e: MessageEvent<ArrayBuffer>) => {
	const wordArray = CryptoJS.lib.WordArray.create(e.data);
	const checksum = CryptoJS.SHA1(wordArray).toString();
	self.postMessage(checksum);
};
