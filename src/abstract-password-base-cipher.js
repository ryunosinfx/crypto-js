import { Base } from './abstract-base.js';
import { SerializableCipher } from './abstract-serializable-cipher.js';
/**
 * A serializable cipher wrapper that derives the key from a password,
 * and returns ciphertext as a serializable cipher params object.
 */
export class PasswordBasedCipher extends SerializableCipher {
	static defaultConf = {
		kdf: null, //OpenSSLKdf
	};
	/**
	 * Configuration options.
	 *
	 * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
	 */
	constructor() {
		super();
		this.cfg = Base.mixIn(this.cfg, PasswordBasedCipher.defaultConf);
	}

	/**
	 * Encrypts a message using a password.
	 *
	 * @param {Cipher} cipherClass The cipher algorithm to use.
	 * @param {WordArray|string} message The message to encrypt.
	 * @param {string} password The password.
	 * @param {Object} cfg (Optional) The configuration options to use for this operation.
	 *
	 * @return {CipherParams} A cipher params object.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
	 *     const ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
	 */
	encrypt(cipherClass, message, password, cfg) {
		const cfgCurrent = Base.mixIn({}, this.cfg); // Apply config defaults
		const cfgExtended = Base.mixIn(cfgCurrent, cfg); // Apply config defaults
		const derivedParams = cfgExtended.kdf.execute(
			password,
			cipherClass.keySize,
			cipherClass.ivSize,
			cfgExtended.salt,
			cfgExtended.hasher
		); // Derive key and other params
		cfgExtended.iv = derivedParams.iv; // Add IV to config
		const ciphertext = super.encrypt(cipherClass, message, derivedParams.key, cfgExtended); // Encrypt
		Base.mixIn(ciphertext, derivedParams); // Mix in derived params
		this.ciphertext = ciphertext;
		return ciphertext;
	}

	/**
	 * Decrypts serialized ciphertext using a password.
	 *
	 * @param {Cipher} cipher The cipher algorithm to use.
	 * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
	 * @param {string} password The password.
	 * @param {Object} cfg (Optional) The configuration options to use for this operation.
	 *
	 * @return {WordArray} The plaintext.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
	 *     const plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
	 */
	decrypt(cipher, ciphertext, password, cfg) {
		const cfgCurrent = Base.mixIn({}, this.cfg); // Apply config defaults
		const cfgExtended = Base.mixIn(cfgCurrent, cfg); // Apply config defaults
		const ciphertextParsed = this._parse(ciphertext, cfgExtended.format); // Convert string to CipherParams
		// Derive key and other params
		const derivedParams = cfgExtended.kdf.execute(
			password,
			cipher.keySize,
			cipher.ivSize,
			ciphertextParsed.salt,
			cfgExtended.hasher
		);
		cfgExtended.iv = derivedParams.iv; // Add IV to config
		return super.decrypt(cipher, ciphertextParsed, derivedParams.key, cfgExtended); //plaintext// Decrypt
	}
}
