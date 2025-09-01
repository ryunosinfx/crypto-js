import { Base } from './abstract-base.js';
import { WordArray } from './word-array.js';
/**
 * A collection of cipher parameters.
 *
 * @property {WordArray} ciphertext The raw ciphertext.
 * @property {WordArray} key The key to this ciphertext.
 * @property {WordArray} iv The IV used in the ciphering operation.
 * @property {WordArray} salt The salt used with a key derivation function.
 * @property {Cipher} algorithm The cipher algorithm.
 * @property {Mode} mode The block mode used in the ciphering operation.
 * @property {Padding} padding The padding scheme used in the ciphering operation.
 * @property {number} blockSize The block size of the cipher.
 * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
 */
export class CipherParams extends Base {
	static defaultValue = {
		ciphertext: new WordArray(),
		key: new WordArray(),
		iv: new WordArray(),
		salt: new WordArray(),
		algorithm: null, //CryptoJS.algo.AES,
		mode: null, //CryptoJS.mode.CBC,
		padding: null, //CryptoJS.pad.PKCS7,
		blockSize: 4,
		formatter: null, //CryptoJS.format.OpenSSL,
	};
	/**
	 * Initializes a newly created cipher params object.
	 *
	 * @param {Object} cipherParams An object with any of the possible cipher parameters.
	 *
	 * @example
	 *
	 *     const cipherParams = new CryptoJS.lib.CipherParams({
	 *         ciphertext: ciphertextWordArray,
	 *         key: keyWordArray,
	 *         iv: ivWordArray,
	 *         salt: saltWordArray,
	 *         algorithm: CryptoJS.algo.AES,
	 *         mode: CryptoJS.mode.CBC,
	 *         padding: CryptoJS.pad.PKCS7,
	 *         blockSize: 4,
	 *         formatter: CryptoJS.format.OpenSSL
	 *     });
	 */
	constructor(cipherParams = CipherParams.defaultValue) {
		super();
		for (const key in cipherParams) this[key] = cipherParams[key];
		this.cfg = Base.mixIn(this.cfg, cipherParams);
	}

	/**
	 * Converts this cipher params object to a string.
	 *
	 * @param {Format} formatter (Optional) The formatting strategy to use.
	 *
	 * @return {string} The stringified cipher params.
	 *
	 * @throws Error If neither the formatter nor the default formatter is set.
	 *
	 * @example
	 *
	 *     const string = cipherParams + '';
	 *     const string = cipherParams.toString();
	 *     const string = cipherParams.toString(CryptoJS.format.OpenSSL);
	 */
	toString(formatter) {
		return (formatter || this.formatter).stringify(this);
	}
}
