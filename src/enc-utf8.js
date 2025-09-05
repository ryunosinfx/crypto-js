import { WordArray } from './word-array.js';
import { Latin1 } from './enc-latin1.js';
/**
 * UTF-8 encoding strategy.
 */
export class Utf8 {
	/**
	 * Converts a word array to a UTF-8 string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @return {string} The UTF-8 string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
	 */
	static stringify = wordArray => {
		try {
			return decodeURIComponent(escape(Latin1.stringify(wordArray)));
		} catch (e) {
			throw new Error('Malformed UTF-8 data');
		}
	};

	/**
	 * Converts a UTF-8 string to a word array.
	 *
	 * @param {string} utf8Str The UTF-8 string.
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const wordArray = CryptoJS.enc.Utf8.parse(utf8String);
	 */
	static parse = utf8Str => Latin1.parse(unescape(encodeURIComponent(utf8Str)));
}
