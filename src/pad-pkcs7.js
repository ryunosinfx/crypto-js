import { WordArray } from './word-array.js';
/**
 * PKCS #5/7 padding strategy.
 */
export class Pkcs7 {
	/**
	 * Pads data using the algorithm defined in PKCS #5/7.
	 *
	 * @param {WordArray} data The data to pad.
	 * @param {number} blockSize The multiple that the data should be padded to.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
	 */
	static pad(data, blockSize) {
		const blockSizeBytes = blockSize * 4; // Shortcut
		const nPaddingBytes = blockSizeBytes - (data.sigBytes % blockSizeBytes); // Count padding bytes
		const paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes; // Create padding word
		const paddingWords = []; // Create padding
		for (let i = 0; i < nPaddingBytes; i += 4) paddingWords.push(paddingWord);
		const padding = new WordArray(paddingWords, nPaddingBytes);
		data.concat(padding); // Add padding
	}

	/**
	 * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
	 *
	 * @param {WordArray} data The data to unpad.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     CryptoJS.pad.Pkcs7.unpad(wordArray);
	 */
	static unpad(data) {
		const nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff; // Get number of padding bytes from last byte
		data.sigBytes -= nPaddingBytes; // Remove padding
	}
}
