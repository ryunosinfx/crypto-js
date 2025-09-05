import { CryptoJS as C } from './core.js';
import { WordArray } from './word-array.js';
import { SHA256 } from './sha256.js';

/**
 * SHA-224 hash algorithm.
 */
export class SHA224 extends SHA256 {
	static initArray = [0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4];
	_doReset() {
		this._hash = new WordArray(SHA224.initArray);
	}

	_doFinalize() {
		const hash = super._doFinalize();
		hash.sigBytes -= 4;
		return hash;
	}
}

/**
 * Shortcut function to the hasher's object interface.
 *
 * @param {WordArray|string} message The message to hash.
 *
 * @return {WordArray} The hash.
 *
 * @static
 *
 * @example
 *
 *     const hash = CryptoJS.SHA224('message');
 *     const hash = CryptoJS.SHA224(wordArray);
 */
C.SHA224 = SHA256._createHelper(SHA224);

/**
 * Shortcut function to the HMAC's object interface.
 *
 * @param {WordArray|string} message The message to hash.
 * @param {WordArray|string} key The secret key.
 *
 * @return {WordArray} The HMAC.
 *
 * @static
 *
 * @example
 *
 *     const hmac = CryptoJS.HmacSHA224(message, key);
 */
C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
