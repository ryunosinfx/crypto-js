import { Base } from './abstract-base.js';
import { WordArray } from './word-array.js';
import { BufferedBlockAlgorithm } from './abstract-buffered-block-algorithm.js';
import { HMAC } from './hmac.js';
/**
 * Abstract hasher template.
 *
 * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
 */
export class Hasher extends BufferedBlockAlgorithm {
	/**
	 * Configuration options.
	 */
	static blockSize = 512 / 32;
	/**
	 * Initializes a newly created hasher.
	 *
	 * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
	 *
	 * @example
	 *
	 *     const hasher = new  CryptoJS.algo.SHA256();
	 */
	constructor(cfg) {
		super(cfg);
		this.blockSize = Hasher.blockSize;
		this.cfg = Base.mixIn(this.cfg, cfg); // Apply config defaults
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
		this.reset(); // Set initial values
	}

	/**
	 * Resets this hasher to its initial state.
	 *
	 * @example
	 *
	 *     hasher.reset();
	 */
	reset() {
		super.reset(); // Reset data buffer
		this._doReset(); // Perform concrete-hasher logic
	}

	/**
	 * Updates this hasher with a message.
	 *
	 * @param {WordArray|string} messageUpdate The message to append.
	 *
	 * @return {Hasher} This hasher.
	 *
	 * @example
	 *
	 *     hasher.update('message');
	 *     hasher.update(wordArray);
	 */
	update(messageUpdate) {
		this._append(messageUpdate); // Append
		this._process(); // Update the hash
		return this; // Chainable
	}

	/**
	 * Finalizes the hash computation.
	 * Note that the finalize operation is effectively a destructive, read-once operation.
	 *
	 * @param {WordArray|string} messageUpdate (Optional) A final message update.
	 *
	 * @return {WordArray} The hash.
	 *
	 * @example
	 *
	 *     const hash = hasher.finalize();
	 *     const hash = hasher.finalize('message');
	 *     const hash = hasher.finalize(wordArray);
	 */
	finalize(messageUpdate) {
		if (messageUpdate) this._append(messageUpdate); // Final message update
		const finalResult = this._doFinalize(); // Perform concrete-hasher logic
		this.reset();
		return finalResult;
	}

	/**
	 * Creates a shortcut function to a hasher's object interface.
	 *
	 * @param {Hasher} hasherClass The hasher to create a helper for.
	 *
	 * @return {Function} The shortcut function.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
	 */
	static _createHelper = hasherClass => (message, cfg) => new hasherClass(cfg).finalize(message);

	/**
	 * Creates a shortcut function to the HMAC's object interface.
	 *
	 * @param {Hasher} hasherClass The hasher to use in this HMAC helper.
	 *
	 * @return {Function} The shortcut function.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
	 */
	static _createHmacHelper = hasherClass => (message, key) => new HMAC(hasherClass, key).finalize(message);
}
