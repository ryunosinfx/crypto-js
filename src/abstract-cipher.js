import { Base } from './abstract-base.js';
import { BufferedBlockAlgorithm } from './abstract-buffered-block-algorithm.js';
/**
 * Abstract base cipher template.
 *
 * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
 * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
 * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
 * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
 */
export class Cipher extends BufferedBlockAlgorithm {
	/**
	 * Configuration options.
	 *
	 * @property {WordArray} iv The IV to use for this operation.
	 */

	/**
	 * Creates this cipher in encryption mode.
	 *
	 * @param {WordArray} key The key.
	 * @param {Object} cfg (Optional) The configuration options to use for this operation.
	 *
	 * @return {Cipher} A cipher instance.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
	 */
	static createEncryptor(key, cfg) {
		return new this(true, key, cfg);
	}

	/**
	 * Creates this cipher in decryption mode.
	 *
	 * @param {WordArray} key The key.
	 * @param {Object} cfg (Optional) The configuration options to use for this operation.
	 *
	 * @return {Cipher} A cipher instance.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
	 */
	static createDecryptor(key, cfg) {
		return new this(false, key, cfg);
	}

	static keySize = 128 / 32;
	static ivSize = 128 / 32;
	static conf = { keySize: Cipher.keySize, ivSize: Cipher.ivSize };
	/**
	 * Initializes a newly created cipher.
	 *
	 * @param {number} isEncryption Either the encryption or decryption transormation mode constant.
	 * @param {WordArray} key The key.
	 * @param {Object} cfg (Optional) The configuration options to use for this operation.
	 *
	 * @example
	 *
	 *     const cipher = new CryptoJS.algo.AES(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
	 */
	constructor(isEncryption, key, cfg = {}) {
		super(cfg);
		this._ENC_XFORM_MODE = 1;
		this._DEC_XFORM_MODE = 2;
		this.keySize = Cipher.keySize;
		this.ivSize = Cipher.ivSize;
		this.cfg = Base.mixIn(this.cfg, Cipher.conf); // Apply config defaults
		this.isEncryption = isEncryption; // Store transform mode and key
		this._key = key; // Store transform mode and key
		// this.reset(); // Set initial values
	}

	/**
	 * Resets this cipher to its initial state.
	 *
	 * @example
	 *
	 *     cipher.reset();
	 */
	reset() {
		super.reset(); // Reset data buffer
		this._doReset(); // Perform concrete-cipher logic
	}
	_append(dataUpdate) {
		return super._append(dataUpdate);
	}
	_doReset() {}
	_doFinalize() {}
	/**
	 * Adds data to be encrypted or decrypted.
	 *
	 * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
	 *
	 * @return {WordArray} The data after processing.
	 *
	 * @example
	 *
	 *     const encrypted = cipher.process('data');
	 *     const encrypted = cipher.process(wordArray);
	 */
	process(dataUpdate) {
		this._append(dataUpdate); // Append
		return this._process(); // Process available blocks
	}

	/**
	 * Finalizes the encryption or decryption process.
	 * Note that the finalize operation is effectively a destructive, read-once operation.
	 *
	 * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
	 *
	 * @return {WordArray} The data after final processing.
	 *
	 * @example
	 *
	 *     const encrypted = cipher.finalize();
	 *     const encrypted = cipher.finalize('data');
	 *     const encrypted = cipher.finalize(wordArray);
	 */
	finalize(dataUpdate) {
		if (dataUpdate) this._append(dataUpdate); // Final data update
		return this._doFinalize(); //finalProcessedData Perform concrete-cipher logic
	}

	/**
	 * Creates shortcut functions to a cipher's object interface.
	 *
	 * @param {Cipher} cipher The cipher to create a helper for.
	 *
	 * @return {Object} An object with encrypt and decrypt shortcut functions.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
	 */
	static PasswordBasedCipher = null;
	static SerializableCipher = null;
	static _createHelper(cipher) {
		return {
			encrypt: (message, key, cfg) =>
				(typeof key === 'string' ? Cipher.PasswordBasedCipher : Cipher.SerializableCipher).encrypt(
					cipher,
					message,
					key,
					cfg
				),
			decrypt: (ciphertext, key, cfg) =>
				(typeof key === 'string' ? Cipher.PasswordBasedCipher : Cipher.SerializableCipher).decrypt(
					cipher,
					ciphertext,
					key,
					cfg
				),
		};
	}
	encrypt(message, key, cfg) {
		return (typeof key === 'string' ? Cipher.PasswordBasedCipher : Cipher.SerializableCipher).encrypt(
			this,
			message,
			key,
			cfg
		);
	}
	decrypt(ciphertext, key, cfg) {
		return (typeof key === 'string' ? Cipher.PasswordBasedCipher : Cipher.SerializableCipher).decrypt(
			this,
			ciphertext,
			key,
			cfg
		);
	}
}
