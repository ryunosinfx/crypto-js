import { Base } from './abstract-base.js';

let crypto =
	// Native crypto from window (Browser)
	typeof window !== 'undefined' && window.crypto
		? window.crypto
		: typeof self !== 'undefined' && self.crypto // Native crypto in web worker (Browser)
		? self.crypto
		: typeof globalThis !== 'undefined' && globalThis.crypto // Native crypto from worker
		? globalThis.crypto
		: typeof window !== 'undefined' && window.msCrypto // Native (experimental IE 11) crypto from window (Browser)
		? window.msCrypto
		: typeof global !== 'undefined' && global.crypto // Native crypto from global (NodeJS)
		? global.crypto
		: undefined;

// Native crypto import via require (NodeJS)
if (!crypto && typeof require === 'function') {
	try {
		crypto = require('crypto');
	} catch (err) {}
}

/*
 * Cryptographically secure pseudorandom number generator
 *
 * As Math.random() is cryptographically not safe to use
 */
const cryptoSecureRandomInt = () => {
	if (crypto) {
		// Use getRandomValues method (Browser)
		if (typeof crypto.getRandomValues === 'function') {
			try {
				return crypto.getRandomValues(new Uint32Array(1))[0];
			} catch (err) {}
		}

		// Use randomBytes method (NodeJS)
		if (typeof crypto.randomBytes === 'function') {
			try {
				return crypto.randomBytes(4).readInt32LE();
			} catch (err) {}
		}
	}

	throw new Error('Native crypto module could not be used to get secure random number.');
};
/**
 * An array of 32-bit words.
 *
 * @property {Array} words The array of 32-bit words.
 * @property {number} sigBytes The number of significant bytes in this word array.
 */
export class WordArray extends Base {
	static defaultEncodeHex = null;
	/**
	 * Initializes a newly created word array.
	 *
	 * @param {Array} words (Optional) An array of 32-bit words.
	 * @param {number} sigBytes (Optional) The number of significant bytes in the words.
	 *
	 * @example
	 *
	 *     const wordArray = new CryptoJS.lib.WordArray();
	 *     const wordArray = new CryptoJS.lib.WordArray([0x00010203, 0x04050607]);
	 *     const wordArray = new CryptoJS.lib.WordArray([0x00010203, 0x04050607], 6);
	 */
	constructor(words = [], sigBytes) {
		super();
		let copyed = null;
		// this.now = Date.now() + Math.ceil(Math.random() * 1000);
		// Check if typed arrays are supported
		if (typeof ArrayBuffer === 'function') {
			// Augment WordArray.init to handle typed arrays
			// if (typedArray instanceof ArrayBuffer) typedArray = new Uint8Array(typedArray); // Convert buffers to uint8

			// Convert other array views to uint8
			// if (
			// 	typedArray instanceof Int8Array ||
			// 	(typeof Uint8ClampedArray !== 'undefined' && typedArray instanceof Uint8ClampedArray) ||
			// 	typedArray instanceof Int16Array ||
			// 	typedArray instanceof Uint16Array ||
			// 	typedArray instanceof Int32Array ||
			// 	typedArray instanceof Uint32Array ||
			// 	typedArray instanceof Float32Array ||
			// 	typedArray instanceof Float64Array
			// )
			const typedArray =
				words instanceof ArrayBuffer
					? new Uint8Array(words)
					: (words.buffer !== undefined && words.byteOffset !== undefined, words.byteLength !== undefined)
					? new Uint8Array(words.buffer, words.byteOffset, words.byteLength)
					: words.copyWithin
					? words.slice()
					: Array.isArray(words)
					? JSON.parse(JSON.stringify(words))
					: words;
			// Handle Uint8Array
			if (typedArray instanceof Uint8Array) {
				const typedArrayByteLength = typedArray.byteLength; // Shortcut
				const wordsNew = []; // Extract bytes
				for (let i = 0; i < typedArrayByteLength; i++) wordsNew[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8);
				copyed = wordsNew;
				sigBytes = typedArrayByteLength;
			}
		}
		if (!copyed && Array.isArray(words)) {
			copyed = [].concat(words);
		}
		this.words = copyed;
		const wordsInit = this.words;
		this.sigBytes = sigBytes !== undefined ? sigBytes : wordsInit.length * 4;
	}

	/**
	 * Converts this word array to a string.
	 *
	 * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
	 *
	 * @return {string} The stringified word array.
	 *
	 * @example
	 *
	 *     const string = wordArray + '';
	 *     const string = wordArray.toString();
	 *     const string = wordArray.toString(CryptoJS.enc.Utf8);
	 */
	toString(encoder = WordArray.defaultEncodeHex) {
		return encoder.stringify(this);
	}
	static thatWords = [];
	/**
	 * Concatenates a word array to this word array.
	 *
	 * @param {WordArray} wordArray The word array to append.
	 *
	 * @return {WordArray} This word array.
	 *
	 * @example
	 *
	 *     wordArray1.concat(wordArray2);
	 */
	concat(wordArray) {
		// Shortcuts
		const thisWords = this.words;
		const thatWordsOrigin = wordArray.words;
		const thatWords = WordArray.thatWords;
		thatWords.splice(0, thatWords.length); // Clear
		for (const word of thatWordsOrigin) {
			if (Array.isArray(word)) for (const char of word) thatWords.push(char);
			else thatWords.push(word);
		}
		const thisSigBytes = this.sigBytes;
		const thatSigBytes = wordArray.sigBytes;

		// this.clamp(); // Clamp excess bits

		// clamp() {
		// Shortcuts
		// const words = this.words;
		// const sigBytes = this.sigBytes;

		// Clamp
		thisWords[thisSigBytes >>> 2] &= 0xffffffff << (32 - (thisSigBytes % 4) * 8);
		thisWords.length = Math.ceil(thisSigBytes / 4);
		// }
		// Concat
		if (thisSigBytes % 4)
			// Copy one byte at a time
			for (let i = 0; i < thatSigBytes; i++) {
				const thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
				thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
			}
		else for (let j = 0; j < thatSigBytes; j += 4) thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2]; // Copy one word at a time
		this.sigBytes += thatSigBytes;
		return this; // Chainable
	}

	/**
	 * Removes insignificant bits.
	 *
	 * @example
	 *
	 *     wordArray.clamp();
	 */
	clamp() {
		// Shortcuts
		const words = this.words;
		const sigBytes = this.sigBytes;

		// Clamp
		words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
		words.length = Math.ceil(sigBytes / 4);
	}

	/**
	 * Creates a copy of this word array.
	 *
	 * @return {WordArray} The clone.
	 *
	 * @example
	 *
	 *     const clone = wordArray.clone();
	 */
	clone() {
		const clonedOne = super.clone();
		clonedOne.words = this.words.slice(0);
		return clonedOne;
	}

	/**
	 * Creates a word array filled with random bytes.
	 *
	 * @param {number} nBytes The number of random bytes to generate.
	 *
	 * @return {WordArray} The random word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const wordArray = CryptoJS.lib.WordArray.random(16);
	 */
	static random(nBytes) {
		const words = [];
		for (let i = 0; i < nBytes; i += 4) words.push(cryptoSecureRandomInt());
		return new WordArray(words, nBytes);
	}
}
