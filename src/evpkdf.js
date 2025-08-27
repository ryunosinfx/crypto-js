import { CryptoJS, WordArray, Base } from './core.js';
import { MD5 } from './md5.js';
// Shortcuts
const C = CryptoJS;

/**
 * This key derivation function is meant to conform with EVP_BytesToKey.
 * www.openssl.org/docs/crypto/EVP_BytesToKey.html
 */
export class EvpKDF extends Base {
	/**
	 * Configuration options.
	 *
	 * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
	 * @property {Hasher} hasher The hash algorithm to use. Default: MD5
	 * @property {number} iterations The number of iterations to perform. Default: 1
	 *
	 * Initializes a newly created key derivation function.
	 *
	 * @param {Object} cfg (Optional) The configuration options to use for the derivation.
	 *
	 * @example
	 *
	 *     const kdf = new CryptoJS.algo.EvpKDF();
	 *     const kdf = new CryptoJS.algo.EvpKDF({ keySize: 8 });
	 *     const kdf = new CryptoJS.algo.EvpKDF({ keySize: 8, iterations: 1000 });
	 */
	constructor(cfg) {
		super();
		this.cfg = Base.mixIn(
			this.cfg,
			Base.mixIn(this.cfg, {
				keySize: 128 / 32,
				hasher: MD5,
				iterations: 1,
			})
		);
		this.cfg = Base.mixIn(this.cfg, cfg);
		// console.log('EvpKDF this.cfg', this.cfg);
	}

	/**
	 * Derives a key from a password.
	 *
	 * @param {WordArray|string} password The password.
	 * @param {WordArray|string} salt A salt.
	 *
	 * @return {WordArray} The derived key.
	 *
	 * @example
	 *
	 *     const key = kdf.compute(password, salt);
	 */
	compute(password, salt) {
		// console.log('compute password/salt', password, salt);
		let block;
		const cfg = this.cfg; // Shortcut
		const hasher = new cfg.hasher(); // Init hasher
		const derivedKey = new WordArray(); // Initial values
		const derivedKeyWords = derivedKey.words; // Shortcuts
		const keySize = cfg.keySize; // Shortcuts
		const iterations = cfg.iterations; // Shortcuts
		// Generate key
		// console.log('compute derivedKeyWords/keySize', derivedKeyWords, keySize);
		while (derivedKeyWords.length < keySize) {
			// console.log('compute block/iterations', block, iterations);
			if (block) hasher.update(block);
			block = hasher.update(password).finalize(salt);
			hasher.reset();
			// Iterations
			for (let i = 1; i < iterations; i++) {
				block = hasher.finalize(block);
				hasher.reset();
			}
			derivedKey.concat(block);
		}
		derivedKey.sigBytes = keySize * 4;
		return derivedKey;
	}
}
/**
 * Derives a key from a password.
 *
 * @param {WordArray|string} password The password.
 * @param {WordArray|string} salt A salt.
 * @param {Object} cfg (Optional) The configuration options to use for this computation.
 *
 * @return {WordArray} The derived key.
 *
 * @static
 *
 * @example
 *
 *     const key = CryptoJS.EvpKDF(password, salt);
 *     const key = CryptoJS.EvpKDF(password, salt, { keySize: 8 });
 *     const key = CryptoJS.EvpKDF(password, salt, { keySize: 8, iterations: 1000 });
 */
C.EvpKDF = (password, salt, cfg) => {
	// console.log('EvpKDF password/salt/cfg', password, salt, cfg);
	return new EvpKDF(cfg).compute(password, salt);
};
