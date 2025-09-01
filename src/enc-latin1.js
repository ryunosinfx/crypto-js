import { WordArray } from './word-array.js';
/**
 * Latin1 encoding strategy.
 */
export class Latin1 {
	static latin1Chars = [];
	/**
	 * Converts a word array to a Latin1 string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @return {string} The Latin1 string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
	 */
	static stringify = wordArray => {
		const words = wordArray.words; // Shortcuts
		const sigBytes = wordArray.sigBytes; // Shortcuts
		const latin1Chars = Latin1.latin1Chars; // Convert
		latin1Chars.splice(0, latin1Chars.length); // Clear
		for (let i = 0; i < sigBytes; i++) {
			const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
			latin1Chars.push(String.fromCharCode(bite));
		}
		return latin1Chars.join('');
	};

	/**
	 * Converts a Latin1 string to a word array.
	 *
	 * @param {string} latin1Str The Latin1 string.
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const wordArray = CryptoJS.enc.Latin1.parse(latin1String);
	 */
	static parse = latin1Str => {
		const latin1StrLength = latin1Str.length; // Shortcut
		const words = []; // Convert
		for (let i = 0; i < latin1StrLength; i++)
			words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
		return new WordArray(words, latin1StrLength);
	};
}
