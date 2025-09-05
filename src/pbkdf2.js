import { CryptoJS as C } from './core.js';
import { Base } from './abstract-base.js';
import { WordArray } from './word-array.js';
import { HMAC } from './hmac.js';
import { SHA256 } from './sha256.js';

/**
 * Password-Based Key Derivation Function 2 algorithm.
 */
export class PBKDF2 extends Base {
	/**
	 * Configuration options.
	 *
	 * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
	 * @property {Hasher} hasher The hasher to use. Default: SHA256
	 * @property {number} iterations The number of iterations to perform. Default: 250000
	 */

	static keySize = 128 / 32;
	/**
	 * Initializes a newly created key derivation function.
	 *
	 * @param {Object} cfg (Optional) The configuration options to use for the derivation.
	 *
	 * @example
	 *
	 *     const kdf = CryptoJS.algo.PBKDF2.create();
	 *     const kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
	 *     const kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
	 */
	constructor(cfg) {
		super();
		this.keySize = PBKDF2.keySize;
		this.iterations = 250000;
		this.cfg = Base.mixIn(this.cfg, {
			keySize: this.keySize,
			hasher: SHA256,
			iterations: this.iterations,
		});
		this.cfg = Base.mixIn(this.cfg, cfg);
	}

	/**
	 * Computes the Password-Based Key Derivation Function 2.
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
		const cfg = this.cfg; // Shortcut
		const hmac = new HMAC(cfg.hasher, password); // Init HMAC
		const derivedKey = new WordArray(); // Initial values
		const blockIndex = new WordArray([0x00000001]); // Initial values
		const derivedKeyWords = derivedKey.words; // Shortcuts
		const blockIndexWords = blockIndex.words; // Shortcuts
		const keySize = cfg.keySize; // Shortcuts
		const iterations = cfg.iterations; // Shortcuts
		// Generate key
		while (derivedKeyWords.length < keySize) {
			const block = hmac.update(salt).finalize(blockIndex);
			hmac.reset();
			const blockWords = block.words; // Shortcuts
			const blockWordsLength = blockWords.length; // Shortcuts
			let intermediate = block; // Iterations
			for (let i = 1; i < iterations; i++) {
				intermediate = hmac.finalize(intermediate);
				hmac.reset();
				const intermediateWords = intermediate.words; // Shortcut
				for (let j = 0; j < blockWordsLength; j++) blockWords[j] ^= intermediateWords[j]; // XOR intermediate with block
			}
			derivedKey.concat(block);
			blockIndexWords[0]++;
		}
		derivedKey.sigBytes = keySize * 4;
		return derivedKey;
	}
}

/**
 * Computes the Password-Based Key Derivation Function 2.
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
 *     const key = CryptoJS.PBKDF2(password, salt);
 *     const key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
 *     const key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
 */
C.PBKDF2 = (password, salt, cfg) => new PBKDF2(cfg).compute(password, salt);
