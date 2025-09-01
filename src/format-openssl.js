import { WordArray } from './word-array.js';
import { Base64 } from './enc-base64.js';
import { CipherParams } from './cipher-params.js';
/**
 * OpenSSL formatting strategy.
 */
export class OpenSSLFormatter {
	/**
	 * Converts a cipher params object to an OpenSSL-compatible string.
	 *
	 * @param {CipherParams} cipherParams The cipher params object.
	 *
	 * @return {string} The OpenSSL-compatible string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
	 */
	static stringify = cipherParams => {
		const ciphertext = cipherParams.ciphertext; // Shortcuts
		const salt = cipherParams.salt; // Shortcuts
		const wordArray = salt // Format
			? new WordArray([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext)
			: ciphertext;
		return wordArray.toString(Base64);
	};

	/**
	 * Converts an OpenSSL-compatible string to a cipher params object.
	 *
	 * @param {string} openSSLStr The OpenSSL-compatible string.
	 *
	 * @return {CipherParams} The cipher params object.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
	 */
	static parse = openSSLStr => {
		let salt;
		const ciphertext = Base64.parse(openSSLStr); // Parse base64
		const ciphertextWords = ciphertext.words; // Shortcut
		// Test for salt
		if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
			salt = new WordArray(ciphertextWords.slice(2, 4)); // Extract salt
			ciphertextWords.splice(0, 4); // Remove salt from ciphertext
			ciphertext.sigBytes -= 16;
		}
		return new CipherParams({ ciphertext, salt });
	};
}
