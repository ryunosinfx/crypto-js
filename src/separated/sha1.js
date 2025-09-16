const C = { lib: {}, algo: {}, enc: {}, x64: {}, pad: {}, mode: {}, isUnited: false };

export const CryptoJS = C;
/**
 * Base object for prototypal inheritance.
 */
export class Base {
	/**
	 * Initializes a newly created object.
	 * Override this method to add some logic when your objects are created.
	 *
	 * @example
	 *
	 *     const MyType = CryptoJS.lib.Base.extend({
	 *         init: function () {
	 *             // ...
	 *         }
	 *     });
	 */
	constructor() {
		this.cfg = {};
	}

	/**
	 * Copies properties into this object.
	 *
	 * @param {Object} properties The properties to mix in.
	 *
	 * @example
	 *
	 *     MyType.mixIn({
	 *         field: 'value'
	 *     });
	 */
	static mixIn = (base, properties) => {
		if (!properties) return base;
		for (const name in properties) base[name] = properties[name];
		if (properties.hasOwnProperty('toString')) base.toString = properties.toString; // IE won't copy toString using the loop above
		return base;
	};
	static mixInAsNew = (base, properties) => Base.mixIn(Base.mixIn({}, base), properties);

	/**
	 * Creates a copy of this object.
	 *
	 * @return {Object} The clone.
	 *
	 * @example
	 *
	 *     const clone = instance.clone();
	 */
	clone() {
		const newOne = new this.constructor();

		for (const key in this) {
			const value = this[key];
			newOne[key] = value === undefined ? undefined : JSON.parse(JSON.stringify(value)); //structuredClone(this[key]);
		}
		return newOne; // return this.init.prototype.extend(this);
	}
}

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

/**
 * Latin1 encoding strategy.
 */
export class Latin1 {
	static latin1Chars = [];
	/**
	 * Converts a word array to a Latin1 string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @return {string} The Latin1 string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
	 */
	static stringify = wordArray => {
		const words = wordArray.words; // Shortcuts
		const sigBytes = wordArray.sigBytes; // Shortcuts
		const latin1Chars = Latin1.latin1Chars; // Convert
		latin1Chars.splice(0, latin1Chars.length); // Clear
		for (let i = 0; i < sigBytes; i++) {
			const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
			latin1Chars.push(String.fromCharCode(bite));
		}
		return latin1Chars.join('');
	};

	/**
	 * Converts a Latin1 string to a word array.
	 *
	 * @param {string} latin1Str The Latin1 string.
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const wordArray = CryptoJS.enc.Latin1.parse(latin1String);
	 */
	static parse = latin1Str => {
		const latin1StrLength = latin1Str.length; // Shortcut
		const words = []; // Convert
		for (let i = 0; i < latin1StrLength; i++)
			words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
		return new WordArray(words, latin1StrLength);
	};
}

/**
 * UTF-8 encoding strategy.
 */
export class Utf8 {
	/**
	 * Converts a word array to a UTF-8 string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @return {string} The UTF-8 string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
	 */
	static stringify = wordArray => {
		try {
			return decodeURIComponent(escape(Latin1.stringify(wordArray)));
		} catch (e) {
			throw new Error('Malformed UTF-8 data');
		}
	};

	/**
	 * Converts a UTF-8 string to a word array.
	 *
	 * @param {string} utf8Str The UTF-8 string.
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const wordArray = CryptoJS.enc.Utf8.parse(utf8String);
	 */
	static parse = utf8Str => Latin1.parse(unescape(encodeURIComponent(utf8Str)));
}

/**
 * Hex encoding strategy.
 */
export class Hex {
	static hexChars = [];
	/**
	 * Converts a word array to a hex string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @return {string} The hex string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const hexString = CryptoJS.enc.Hex.stringify(wordArray);
	 */
	static stringify = wordArray => {
		const words = wordArray.words; // Shortcuts
		const sigBytes = wordArray.sigBytes; // Shortcuts
		const hexChars = Hex.hexChars; // Convert
		hexChars.splice(0, hexChars.length); // Clear
		for (let i = 0; i < sigBytes; i++) {
			const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
			hexChars.push((bite >>> 4).toString(16));
			hexChars.push((bite & 0x0f).toString(16));
		}
		return hexChars.join('');
	};

	/**
	 * Converts a hex string to a word array.
	 *
	 * @param {string} hexStr The hex string.
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const wordArray = CryptoJS.enc.Hex.parse(hexString);
	 */
	static parse = hexStr => {
		const hexStrLength = hexStr.length; // Shortcut
		const words = []; // Convert
		for (let i = 0; i < hexStrLength; i += 2)
			words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
		return new WordArray(words, hexStrLength / 2);
	};
}

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
/**
 * Abstract buffered block algorithm template.
 *
 * The property blockSize must be implemented in a concrete subtype.
 *
 * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
 */
export class BufferedBlockAlgorithm extends Base {
	static blockSize = 512 / 32;
	constructor(cfg) {
		super();
		this.blockSize = BufferedBlockAlgorithm.blockSize; // Default block size in words (512 bits)
		this.cfg = Base.mixIn(this.cfg, cfg); // Apply config defaults
		this._data = new WordArray(); // Data buffer
		this._nDataBytes = 0; // Number of bytes in the data buffer
	}
	/**
	 * Resets this block algorithm's data buffer to its initial state.
	 *
	 * @example
	 *
	 *     bufferedBlockAlgorithm.reset();
	 */
	reset() {
		this._data = new WordArray(); // Initial values
		this._nDataBytes = 0;
	}

	/**
	 * Adds new data to this block algorithm's buffer.
	 *
	 * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
	 *
	 * @example
	 *
	 *     bufferedBlockAlgorithm._append('data');
	 *     bufferedBlockAlgorithm._append(wordArray);
	 */
	_append(data) {
		if (typeof data == 'string') data = Utf8.parse(data); // Convert string to WordArray, else assume WordArray already
		this._data.concat(data); // Append
		this._nDataBytes += data.sigBytes;
	}

	/**
	 * Processes available data blocks.
	 *
	 * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
	 *
	 * @param {boolean} isDoFlush Whether all blocks and partial blocks should be processed.
	 *
	 * @return {WordArray} The processed data.
	 *
	 * @example
	 *
	 *     const processedData = bufferedBlockAlgorithm._process();
	 *     const processedData = bufferedBlockAlgorithm._process(!!'flush');
	 */
	_process(isDoFlush) {
		let processedWords;

		// Shortcuts
		const data = this._data;
		const dataWords = data.words;
		const dataSigBytes = data.sigBytes;
		const blockSize = this.blockSize;
		const blockSizeBytes = blockSize * 4;

		// Count blocks ready
		const nBlocksReadyPre = dataSigBytes / blockSizeBytes;
		const nBlocksReady = isDoFlush // Round up to include partial blocks
			? Math.ceil(nBlocksReadyPre)
			: // Round down to include only full blocks,
			  // less the number of blocks that must remain in the buffer
			  Math.max((nBlocksReadyPre | 0) - this._minBufferSize, 0);
		const nWordsReady = nBlocksReady * blockSize; // Count words ready
		const nBytesReady = Math.min(nWordsReady * 4, dataSigBytes); // Count bytes ready
		// Process blocks
		if (nWordsReady) {
			for (let offset = 0; offset < nWordsReady; offset += blockSize) this._doProcessBlock(dataWords, offset); // Perform concrete-algorithm logic
			// Remove processed words
			processedWords = dataWords.splice(0, nWordsReady);
			data.sigBytes -= nBytesReady;
		}
		return new WordArray(processedWords, nBytesReady); // Return processed words
	}
	_doProcessBlock(dataWords, offset) {}
	_doFinalize() {}
	/**
	 * Creates a copy of this object.
	 *
	 * @return {Object} The clone.
	 *
	 * @example
	 *
	 *     const clone = bufferedBlockAlgorithm.clone();
	 */
	clone() {
		const clonedOne = super.clone();
		clonedOne._data = this._data.clone();
		return clonedOne;
	}

	_minBufferSize = 0;
}
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

// Reusable object
const V = [];

/**
 * SHA-1 hash algorithm.
 */
export class SHA1 extends Hasher {
	static initArray = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
	constructor(cfg) {
		super(cfg);
	}
	_doReset() {
		this._hash = new WordArray(SHA1.initArray);
	}

	_doProcessBlock(M, offset) {
		const H = this._hash.words; // Shortcut
		let [a, b, c, d, e] = H; // Working variables
		// Computation
		for (let i = 0; i < 80; i++) {
			if (i < 16) {
				V[i] = M[offset + i] | 0;
			} else {
				const n = V[i - 3] ^ V[i - 8] ^ V[i - 14] ^ V[i - 16];
				V[i] = (n << 1) | (n >>> 31);
			}

			let t = ((a << 5) | (a >>> 27)) + e + V[i];
			t +=
				i < 20
					? ((b & c) | (~b & d)) + 0x5a827999
					: i < 40
					? (b ^ c ^ d) + 0x6ed9eba1
					: i < 60
					? ((b & c) | (b & d) | (c & d)) - 0x70e44324
					: (b ^ c ^ d) - 0x359d3e2a; /* if (i < 80) */
			e = d;
			d = c;
			c = (b << 30) | (b >>> 2);
			b = a;
			a = t;
		}
		// Intermediate hash value
		H[0] = (H[0] + a) | 0;
		H[1] = (H[1] + b) | 0;
		H[2] = (H[2] + c) | 0;
		H[3] = (H[3] + d) | 0;
		H[4] = (H[4] + e) | 0;
	}

	_doFinalize() {
		const data = this._data; // Shortcuts
		const dataWords = data.words; // Shortcuts
		const nBitsTotal = this._nDataBytes * 8;
		const nBitsLeft = data.sigBytes * 8;
		dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32)); // Add padding
		dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
		dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
		data.sigBytes = dataWords.length * 4;
		this._process(); // Hash final blocks
		return this._hash; // Return final computed hash
	}

	clone() {
		const clonedOne = super.clone(this);
		clonedOne._hash = this._hash.clone();
		return clonedOne;
	}
}
/**
 * Shortcut function to the hasher's object interface.
 *
 * @param {WordArray|string} message The message to hash.
 *
 * @return {WordArray} The hash.
 *
 * @static
 *
 * @example
 *
 *     const hash = CryptoJS.SHA1('message');
 *     const hash = CryptoJS.SHA1(wordArray);
 */
C.SHA1 = Hasher._createHelper(SHA1);

/**
 * Shortcut function to the HMAC's object interface.
 *
 * @param {WordArray|string} message The message to hash.
 * @param {WordArray|string} key The secret key.
 *
 * @return {WordArray} The HMAC.
 *
 * @static
 *
 * @example
 *
 *     const hmac = CryptoJS.HmacSHA1(message, key);
 */
C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
WordArray.defaultEncodeHex = Hex;
C.lib.Hasher = Hasher; // Export Hasher
C.lib.Base = Base; //Algorithm namespace.
C.lib.WordArray = WordArray;
C.enc = { Utf8, Latin1, Hex }; // Create C_enc namespace
C.algo.SHA1 = SHA1;
C.algo.HMAC = HMAC;
