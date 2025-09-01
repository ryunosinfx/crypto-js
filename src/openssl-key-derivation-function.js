import { WordArray } from './word-array.js';
import { CipherParams } from './cipher-params.js';
/**
 * OpenSSL key derivation function.
 */
export class OpenSSLKdf {
	static EvpKDF = null;
	/**
	 * Derives a key and IV from a password.
	 *
	 * @param {string} password The password to derive from.
	 * @param {number} keySize The size in words of the key to generate.
	 * @param {number} ivSize The size in words of the IV to generate.
	 * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
	 *
	 * @return {CipherParams} A cipher params object with the key, IV, and salt.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
	 *     const derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
	 */
	static execute = (password, keySize, ivSize, salt, hasher) => {
		const saltForUse = salt ? salt : WordArray.random(64 / 8); // Generate random salt
		const key = hasher // Derive key and IV
			? new OpenSSLKdf.EvpKDF({ keySize: keySize + ivSize, hasher: hasher }).compute(password, saltForUse)
			: new OpenSSLKdf.EvpKDF({ keySize: keySize + ivSize }).compute(password, saltForUse);
		const iv = new WordArray(key.words.slice(keySize), ivSize * 4); // Separate key and IV
		key.sigBytes = keySize * 4;
		return new CipherParams({ key: key, iv: iv, salt: saltForUse }); // Return params
	};
}
