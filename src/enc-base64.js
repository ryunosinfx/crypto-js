import { WordArray } from './word-array.js';

/**
 * Base64 encoding strategy.
 */
export class Base64 {
	static _map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	static _reverseMap = []; // Reverse map for Base64 decoding
	/**
	 * Converts a word array to a Base64 string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @return {string} The Base64 string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const base64String = CryptoJS.enc.Base64.stringify(wordArray);
	 */
	static stringify = wordArray => {
		const words = wordArray.words; // Shortcuts
		const sigBytes = wordArray.sigBytes; // Shortcuts
		const map = Base64._map; // Shortcuts
		wordArray.clamp(); // Clamp excess bits
		// Convert
		const base64Chars = [];
		for (let i = 0; i < sigBytes; i += 3) {
			const byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
			const byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
			const byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;
			const triplet = (byte1 << 16) | (byte2 << 8) | byte3;
			for (let j = 0; j < 4 && i + j * 0.75 < sigBytes; j++)
				base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
		}
		const paddingChar = map.charAt(64); // Add padding
		if (paddingChar) while (base64Chars.length % 4) base64Chars.push(paddingChar);
		return base64Chars.join('');
	};

	/**
	 * Converts a Base64 string to a word array.
	 *
	 * @param {string} base64Str The Base64 string.
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const wordArray = CryptoJS.enc.Base64.parse(base64String);
	 */
	static parse = base64Str => {
		const map = Base64._map; // Shortcuts
		const reverseMap = Base64._reverseMap; // Shortcuts
		const paddingChar = map.charAt(64); // Ignore padding
		const paddingIndex = paddingChar ? base64Str.indexOf(paddingChar) : -1;
		const base64StrLength = paddingIndex !== -1 ? paddingIndex : base64Str.length;
		return Base64.parseLoop(base64Str, base64StrLength, reverseMap); // Convert
	};
	static init = () => {
		for (let j = 0; j < Base64._map.length; j++) Base64._reverseMap[Base64._map.charCodeAt(j)] = j; // Initialize reverse map if not already done
	};
	static parseLoop = (base64Str, base64StrLength, reverseMap) => {
		const words = [];
		let nBytes = 0;
		for (let i = 0; i < base64StrLength; i++)
			if (i % 4) {
				const bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
				const bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
				const bitsCombined = bits1 | bits2;
				words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
				nBytes++;
			}
		return new WordArray(words, nBytes);
	};
}
Base64.init(); // Initialize the reverse map on load
