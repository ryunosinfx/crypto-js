import { Base } from './abstract-base.js';
/**
 * Abstract base block cipher mode template.
 */
export class BlockCipherMode extends Base {
	/**
	 * Initializes a newly created mode.
	 *
	 * @param {Cipher} cipher A block cipher instance.
	 * @param {Array} iv The IV words.
	 *
	 * @example
	 *
	 *     const mode = new CryptoJS.mode.CBC.Encryptor(cipher, iv.words);
	 */
	constructor(cipher, iv) {
		super();
		this._cipher = cipher;
		this._iv = iv;
	}
	static Encryptor = BlockCipherMode;
	static Decryptor = BlockCipherMode;
	/**
	 * Creates this mode for encryption.
	 *
	 * @param {Cipher} cipher A block cipher instance.
	 * @param {Array} iv The IV words.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
	 */
	static createEncryptor(cipher, iv) {
		return new this.Encryptor(cipher, iv);
	}

	/**
	 * Creates this mode for decryption.
	 *
	 * @param {Cipher} cipher A block cipher instance.
	 * @param {Array} iv The IV words.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
	 */
	static createDecryptor(cipher, iv) {
		return new this.Decryptor(cipher, iv);
	}
}
