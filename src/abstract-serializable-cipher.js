import { Base } from './abstract-base.js';
import { CipherParams } from './cipher-params.js';
/**
 * A cipher wrapper that returns ciphertext as a serializable cipher params object.
 */
export class SerializableCipher extends Base {
	static defaultConf = {
		format: null, //OpenSSLFormatter
	};
	/**
	 * Configuration options.
	 *
	 * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
	 */
	constructor() {
		super();
		this.cfg = Base.mixIn(this.cfg, SerializableCipher.defaultConf);
	}

	/**
	 * Encrypts a message.
	 *
	 * @param {Cipher} cipherClass The cipher algorithm to use.
	 * @param {WordArray|string} message The message to encrypt.
	 * @param {WordArray} key The key.
	 * @param {Object} cfg (Optional) The configuration options to use for this operation.
	 *
	 * @return {CipherParams} A cipher params object.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
	 *     const ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
	 *     const ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
	 */
	encrypt(cipherClass, message, key, cfg) {
		const cfgExtended = Base.mixInAsNew(this.cfg, cfg); // Apply config defaults
		// const encryptor = cipher.createEncryptor(key, cfgExtended); // Encrypt
		const encryptor = new cipherClass(true, key, cfgExtended); // Encrypt
		const ciphertext = encryptor.finalize(message);
		const cipherCfg = encryptor.cfg; // Shortcut
		// Create and return serializable cipher params
		this.ciphertext = ciphertext;
		return new CipherParams({
			ciphertext,
			key: key,
			iv: cipherCfg.iv,
			algorithm: cipherClass,
			mode: cipherCfg.mode,
			padding: cipherCfg.padding,
			blockSize: encryptor.blockSize,
			formatter: cfgExtended.format,
		});
	}

	/**
	 * Decrypts serialized ciphertext.
	 *
	 * @param {Cipher} cipherClass The cipher algorithm to use.
	 * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
	 * @param {WordArray} key The key.
	 * @param {Object} cfg (Optional) The configuration options to use for this operation.
	 *
	 * @return {WordArray} The plaintext.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
	 *     const plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
	 */
	decrypt(cipherClass, ciphertext, key, cfg) {
		const cfgExtended = Base.mixInAsNew(this.cfg, cfg); // Apply config defaults
		const ciphertextParsed = this._parse(ciphertext, cfgExtended.format); // Convert string to CipherParams
		return new cipherClass(false, key, cfgExtended).finalize(ciphertextParsed.ciphertext); //plaintext Decrypt
	}

	/**
	 * Converts serialized ciphertext to CipherParams,
	 * else assumed CipherParams already and returns ciphertext unchanged.
	 *
	 * @param {CipherParams|string} ciphertext The ciphertext.
	 * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
	 *
	 * @return {CipherParams} The unserialized ciphertext.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
	 */
	_parse(ciphertext, format) {
		return typeof ciphertext === 'string' ? format.parse(ciphertext, this) : ciphertext;
	}
}
