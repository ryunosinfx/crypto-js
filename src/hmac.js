import { Utf8 } from './enc-utf8.js';
import { Base } from './abstract-base.js';
import { WordArray } from './word-array.js';

/**
 * HMAC algorithm.
 */
export class HMAC extends Base {
	/**
	 * Initializes a newly created HMAC.
	 *
	 * @param {Hasher} hasherClass The hash algorithm to use.
	 * @param {WordArray|string} key The secret key.
	 *
	 * @example
	 *
	 *     const hmacHasher = new CryptoJS.algo.HMAC(CryptoJS.algo.SHA256, key);
	 */
	constructor(hasherClass, keyOrigin) {
		super();
		const hasherInited = new hasherClass(); // Init hasher
		this._hasher = hasherInited;
		const key = typeof keyOrigin === 'string' ? Utf8.parse(keyOrigin) : keyOrigin; // Convert string to WordArray, else assume WordArray already
		const hasherBlockSize = hasherInited.blockSize; // Shortcuts
		const hasherBlockSizeBytes = hasherBlockSize * 4; // Shortcuts
		const keyFinalized = key.sigBytes > hasherBlockSizeBytes ? hasherInited.finalize(key) : key; // Allow arbitrary length keys
		keyFinalized.clamp(); // Clamp excess bits
		const oKey = keyFinalized.clone(); // Clone key for inner and outer pads
		this._oKey = oKey;
		const iKey = keyFinalized.clone(); // Clone key for inner and outer pads
		this._iKey = iKey;
		const oKeyWords = oKey.words; // Shortcuts
		const iKeyWords = iKey.words; // Shortcuts
		// XOR keys with pad constants
		for (let i = 0; i < hasherBlockSize; i++) {
			oKeyWords[i] ^= 0x5c5c5c5c;
			iKeyWords[i] ^= 0x36363636;
		}
		oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;
		this.reset(); // Set initial values
	}

	/**
	 * Resets this HMAC to its initial state.
	 *
	 * @example
	 *
	 *     hmacHasher.reset();
	 */
	reset() {
		const hasher = this._hasher; // Shortcut
		hasher.reset(); // Reset
		hasher.update(this._iKey);
	}

	/**
	 * Updates this HMAC with a message.
	 *
	 * @param {WordArray|string} messageUpdate The message to append.
	 *
	 * @return {HMAC} This HMAC instance.
	 *
	 * @example
	 *
	 *     hmacHasher.update('message');
	 *     hmacHasher.update(wordArray);
	 */
	update(messageUpdate) {
		this._hasher.update(messageUpdate);
		return this; // Chainable
	}

	/**
	 * Finalizes the HMAC computation.
	 * Note that the finalize operation is effectively a destructive, read-once operation.
	 *
	 * @param {WordArray|string} messageUpdate (Optional) A final message update.
	 *
	 * @return {WordArray} The HMAC.
	 *
	 * @example
	 *
	 *     const hmac = hmacHasher.finalize();
	 *     const hmac = hmacHasher.finalize('message');
	 *     const hmac = hmacHasher.finalize(wordArray);
	 */
	finalize(messageUpdate) {
		const hasher = this._hasher; // Shortcut
		const innerHash = hasher.finalize(messageUpdate); // Compute HMAC
		hasher.reset();
		return hasher.finalize(this._oKey.clone().concat(innerHash)); //hmac
	}
}
