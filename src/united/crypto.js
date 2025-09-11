/**
 * CryptoJS namespace.
 */
const C = { lib: {}, algo: {}, enc: {}, x64: {}, pad: {}, mode: {} };

export const CryptoJS = C;
/**Base object for prototypal inheritance.*/
class Base {
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
class WordArray extends Base {
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
// Shortcuts
const X32WordArray = WordArray;

/**
 * x64 namespace.
 */
const C_x64 = {};
C.x64 = C_x64;
/**
 * A 64-bit word.
 */
class X64Word extends Base {
	/**
	 * Initializes a newly created 64-bit word.
	 *
	 * @param {number} high The high 32 bits.
	 * @param {number} low The low 32 bits.
	 *
	 * @example
	 *
	 *     const x64Word = new CryptoJS.x64.Word(0x00010203, 0x04050607);
	 */
	constructor(high, low, sig = '') {
		super();
		this.high = high;
		this.low = low;
	}

	/**
	 * Bitwise NOTs this word.
	 *
	 * @return {X64Word} A new x64-Word object after negating.
	 *
	 * @example
	 *
	 *     const negated = x64Word.not();
	 */
	// not () {
	// const high = ~this.high;
	// const low = ~this.low;

	// return new X64Word(high, low);
	// },

	/**
	 * Bitwise ANDs this word with the passed word.
	 *
	 * @param {X64Word} word The x64-Word to AND with this word.
	 *
	 * @return {X64Word} A new x64-Word object after ANDing.
	 *
	 * @example
	 *
	 *     const anded = x64Word.and(anotherX64Word);
	 */
	// and (word) {
	// const high = this.high & word.high;
	// const low = this.low & word.low;

	// return new X64Word(high, low);
	// },

	/**
	 * Bitwise ORs this word with the passed word.
	 *
	 * @param {X64Word} word The x64-Word to OR with this word.
	 *
	 * @return {X64Word} A new x64-Word object after ORing.
	 *
	 * @example
	 *
	 *     const ored = x64Word.or(anotherX64Word);
	 */
	// or (word) {
	// const high = this.high | word.high;
	// const low = this.low | word.low;

	// return new X64Word(high, low);
	// },

	/**
	 * Bitwise XORs this word with the passed word.
	 *
	 * @param {X64Word} word The x64-Word to XOR with this word.
	 *
	 * @return {X64Word} A new x64-Word object after XORing.
	 *
	 * @example
	 *
	 *     const xored = x64Word.xor(anotherX64Word);
	 */
	// xor (word) {
	// const high = this.high ^ word.high;
	// const low = this.low ^ word.low;

	// return new X64Word(high, low);
	// },

	/**
	 * Shifts this word n bits to the left.
	 *
	 * @param {number} n The number of bits to shift.
	 *
	 * @return {X64Word} A new x64-Word object after shifting.
	 *
	 * @example
	 *
	 *     const shifted = x64Word.shiftL(25);
	 */
	// shiftL (n) {
	// if (n < 32) {
	// const high = (this.high << n) | (this.low >>> (32 - n));
	// const low = this.low << n;
	// } else {
	// const high = this.low << (n - 32);
	// const low = 0;
	// }

	// return new X64Word(high, low);
	// },

	/**
	 * Shifts this word n bits to the right.
	 *
	 * @param {number} n The number of bits to shift.
	 *
	 * @return {X64Word} A new x64-Word object after shifting.
	 *
	 * @example
	 *
	 *     const shifted = x64Word.shiftR(7);
	 */
	// shiftR (n) {
	// if (n < 32) {
	// const low = (this.low >>> n) | (this.high << (32 - n));
	// const high = this.high >>> n;
	// } else {
	// const low = this.high >>> (n - 32);
	// const high = 0;
	// }

	// return new X64Word(high, low);
	// },

	/**
	 * Rotates this word n bits to the left.
	 *
	 * @param {number} n The number of bits to rotate.
	 *
	 * @return {X64Word} A new x64-Word object after rotating.
	 *
	 * @example
	 *
	 *     const rotated = x64Word.rotL(25);
	 */
	// rotL (n) {
	// return this.shiftL(n).or(this.shiftR(64 - n));
	// },

	/**
	 * Rotates this word n bits to the right.
	 *
	 * @param {number} n The number of bits to rotate.
	 *
	 * @return {X64Word} A new x64-Word object after rotating.
	 *
	 * @example
	 *
	 *     const rotated = x64Word.rotR(7);
	 */
	// rotR (n) {
	// return this.shiftR(n).or(this.shiftL(64 - n));
	// },

	/**
	 * Adds this word with the passed word.
	 *
	 * @param {X64Word} word The x64-Word to add with this word.
	 *
	 * @return {X64Word} A new x64-Word object after adding.
	 *
	 * @example
	 *
	 *     const added = x64Word.add(anotherX64Word);
	 */
	// add (word) {
	// const low = (this.low + word.low) | 0;
	// const carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
	// const high = (this.high + word.high + carry) | 0;

	// return new X64Word(high, low);
	// }
}

/**
 * An array of 64-bit words.
 *
 * @property {Array} words The array of CryptoJS.x64.Word objects.
 * @property {number} sigBytes The number of significant bytes in this word array.
 */
class X64WordArray extends Base {
	/**
	 * Initializes a newly created word array.
	 *
	 * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
	 * @param {number} sigBytes (Optional) The number of significant bytes in the words.
	 *
	 * @example
	 *
	 *     const wordArray = new CryptoJS.x64.WordArray();
	 *
	 *     const wordArray = new CryptoJS.x64.WordArray([
	 *         new CryptoJS.x64.Word(0x00010203, 0x04050607),
	 *         new CryptoJS.x64.Word(0x18191a1b, 0x1c1d1e1f)
	 *     ]);
	 *
	 *     const wordArray = new CryptoJS.x64.WordArray([
	 *         new CryptoJS.x64.Word(0x00010203, 0x04050607),
	 *         new CryptoJS.x64.Word(0x18191a1b, 0x1c1d1e1f)
	 *     ], 10);
	 */
	constructor(words = [], sigBytes) {
		super();
		this.words = words;
		this.sigBytes = sigBytes != undefined ? sigBytes : words.length * 8;
	}

	/**
	 * Converts this 64-bit word array to a 32-bit word array.
	 *
	 * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
	 *
	 * @example
	 *
	 *     const x32WordArray = x64WordArray.toX32();
	 */
	toX32() {
		const x64Words = this.words; // Shortcuts
		const x64WordsLength = x64Words.length; // Shortcuts
		const x32Words = []; // Convert
		for (let i = 0; i < x64WordsLength; i++) {
			const x64Word = x64Words[i];
			x32Words.push(x64Word.high);
			x32Words.push(x64Word.low);
		}
		return new X32WordArray(x32Words, this.sigBytes);
	}

	/**
	 * Creates a copy of this word array.
	 *
	 * @return {X64WordArray} The clone.
	 *
	 * @example
	 *
	 *     const clone = x64WordArray.clone();
	 */
	clone() {
		const clonedOne = super.clone();
		const words = this.words.slice(0); // Clone "words" array
		clonedOne.words = words;
		const wordsLength = words.length; // Clone each X64Word object
		for (let i = 0; i < wordsLength; i++) words[i] = words[i].clone();
		return clonedOne;
	}
}

/**
 * Base64 encoding strategy.
 */
class Base64 {
	static _map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	static _reverseMap = []; // Reverse map for Base64 decoding
	/**
	 * Converts a word array to a Base64 string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @return {string} The Base64 string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const base64String = CryptoJS.enc.Base64.stringify(wordArray);
	 */
	static stringify = wordArray => {
		const words = wordArray.words; // Shortcuts
		const sigBytes = wordArray.sigBytes; // Shortcuts
		const map = Base64._map; // Shortcuts
		wordArray.clamp(); // Clamp excess bits
		// Convert
		const base64Chars = [];
		for (let i = 0; i < sigBytes; i += 3) {
			const byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
			const byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
			const byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;
			const triplet = (byte1 << 16) | (byte2 << 8) | byte3;
			for (let j = 0; j < 4 && i + j * 0.75 < sigBytes; j++)
				base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
		}
		const paddingChar = map.charAt(64); // Add padding
		if (paddingChar) while (base64Chars.length % 4) base64Chars.push(paddingChar);
		return base64Chars.join('');
	};

	/**
	 * Converts a Base64 string to a word array.
	 *
	 * @param {string} base64Str The Base64 string.
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const wordArray = CryptoJS.enc.Base64.parse(base64String);
	 */
	static parse = base64Str => {
		const map = Base64._map; // Shortcuts
		const reverseMap = Base64._reverseMap; // Shortcuts
		const paddingChar = map.charAt(64); // Ignore padding
		const paddingIndex = paddingChar ? base64Str.indexOf(paddingChar) : -1;
		const base64StrLength = paddingIndex !== -1 ? paddingIndex : base64Str.length;
		return Base64.parseLoop(base64Str, base64StrLength, reverseMap); // Convert
	};
	static init = () => {
		for (let j = 0; j < Base64._map.length; j++) Base64._reverseMap[Base64._map.charCodeAt(j)] = j; // Initialize reverse map if not already done
	};
	static parseLoop = (base64Str, base64StrLength, reverseMap) => {
		const words = [];
		let nBytes = 0;
		for (let i = 0; i < base64StrLength; i++)
			if (i % 4) {
				const bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
				const bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
				const bitsCombined = bits1 | bits2;
				words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
				nBytes++;
			}
		return new WordArray(words, nBytes);
	};
}
Base64.init(); // Initialize the reverse map on load
/**
 * Base64url encoding strategy.
 */
class Base64url {
	static _map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
	static _safe_map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
	static _reverseMap = []; // Reverse map for Base64url decoding
	static _safe_reverseMap = []; // Reverse map for Base64url decoding
	/**
	 * Converts a word array to a Base64url string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @param {boolean} urlSafe Whether to use url safe
	 *
	 * @return {string} The Base64url string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const base64String = CryptoJS.enc.Base64url.stringify(wordArray);
	 */
	static stringify = (wordArray, urlSafe = true) => {
		const words = wordArray.words; // Shortcuts
		const sigBytes = wordArray.sigBytes; // Shortcuts
		const map = urlSafe ? Base64url._safe_map : Base64url._map; // Shortcuts
		wordArray.clamp(); // Clamp excess bits
		// Convert
		const base64Chars = [];
		for (let i = 0; i < sigBytes; i += 3) {
			const byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
			const byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
			const byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;
			const triplet = (byte1 << 16) | (byte2 << 8) | byte3;
			for (let j = 0; j < 4 && i + j * 0.75 < sigBytes; j++)
				base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
		}
		const paddingChar = map.charAt(64); // Add padding
		if (paddingChar) while (base64Chars.length % 4) base64Chars.push(paddingChar);
		return base64Chars.join('');
	};

	/**
	 * Converts a Base64url string to a word array.
	 *
	 * @param {string} base64Str The Base64url string.
	 *
	 * @param {boolean} urlSafe Whether to use url safe
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const wordArray = CryptoJS.enc.Base64url.parse(base64String);
	 */
	static parse = (base64Str, urlSafe = true) => {
		const map = urlSafe ? Base64url._safe_map : Base64url._map; // Shortcuts
		const reverseMap = urlSafe ? Base64url._safe_reverseMap : Base64url._reverseMap; // Shortcuts
		const paddingChar = map.charAt(64); // Ignore padding
		const paddingIndex = paddingChar ? base64Str.indexOf(paddingChar) : -1;
		const base64StrLength = paddingIndex !== -1 ? paddingIndex : base64Str.length;
		return parseLoop(base64Str, base64StrLength, reverseMap); // Convert
	};
	static init = () => {
		// Initialize reverse map if not already done
		const map = Base64url._map;
		const smap = Base64url._safe_map;
		const ml = map.length;
		const sl = smap.length;
		const rm = Base64url._reverseMap;
		const sm = Base64url._safe_reverseMap;
		for (let j = 0; j < ml; j++) rm[map.charCodeAt(j)] = j;
		for (let j = 0; j < sl; j++) sm[smap.charCodeAt(j)] = j;
	};

	static parseLoop = (base64Str, base64StrLength, reverseMap) => {
		const words = [];
		let nBytes = 0;
		for (let i = 0; i < base64StrLength; i++)
			if (i % 4) {
				const bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
				const bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
				const bitsCombined = bits1 | bits2;
				words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
				nBytes++;
			}
		return new WordArray(words, nBytes);
	};
}
Base64url.init();

/**
 * Latin1 encoding strategy.
 */
class Latin1 {
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
class Utf8 {
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
class Hex {
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
 * Abstract buffered block algorithm template.
 *
 * The property blockSize must be implemented in a concrete subtype.
 *
 * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
 */
class BufferedBlockAlgorithm extends Base {
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
 * HMAC algorithm.
 */
class HMAC extends Base {
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
 * Abstract hasher template.
 *
 * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
 */
class Hasher extends BufferedBlockAlgorithm {
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

/**
 * Abstract base cipher template.
 *
 * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
 * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
 * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
 * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
 */
class Cipher extends BufferedBlockAlgorithm {
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
/**
 * Abstract base stream cipher template.
 *
 * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
 */
class StreamCipher extends Cipher {
	static addConf = { keySize: null, ivSize: null, blockSize: null };
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.blockSize = 1;
		const addConf = StreamCipher.addConf;
		addConf.keySize = this.keySize;
		addConf.ivSize = this.ivSize;
		addConf.blockSize = this.blockSize;
		this.cfg = Base.mixIn(this.cfg, addConf);
	}
	_doFinalize() {
		return this._process(!!'flush'); //finalProcessedBlocks Process partial blocks
	}
}
/**
 * Abstract base block cipher mode template.
 */
class BlockCipherMode extends Base {
	/**
	 * Initializes a newly created mode.
	 *
	 * @param {Cipher} cipher A block cipher instance.
	 * @param {Array} iv The IV words.
	 *
	 * @example
	 *
	 *     const mode = new CryptoJS.mode.CBC.Encryptor(cipher, iv.words);
	 */
	constructor(cipher, iv) {
		super();
		this._cipher = cipher;
		this._iv = iv;
	}
	static Encryptor = BlockCipherMode;
	static Decryptor = BlockCipherMode;
	/**
	 * Creates this mode for encryption.
	 *
	 * @param {Cipher} cipher A block cipher instance.
	 * @param {Array} iv The IV words.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
	 */
	static createEncryptor(cipher, iv) {
		return new this.Encryptor(cipher, iv);
	}

	/**
	 * Creates this mode for decryption.
	 *
	 * @param {Cipher} cipher A block cipher instance.
	 * @param {Array} iv The IV words.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
	 */
	static createDecryptor(cipher, iv) {
		return new this.Decryptor(cipher, iv);
	}
}
/**
 * Abstract base block cipher template.
 *
 * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
 */
class BlockCipher extends Cipher {
	static defaultConf = {
		mode: null, //CBC,
		padding: null, // Pkcs7,
	};

	static blockSize = 128 / 32;
	/**
	 * Configuration options.
	 *
	 * @property {Mode} mode The block mode to use. Default: CBC
	 * @property {Padding} padding The padding strategy to use. Default: Pkcs7
	 */
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.cfg = Base.mixIn(this.cfg, BlockCipher.defaultConf);
		this.blockSize = BlockCipher.blockSize;
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
	}

	reset() {
		super.reset(); // Reset cipher
		const cfg = this.cfg; // Shortcuts
		const iv = cfg.iv; // Shortcuts
		const mode = cfg.mode; // Shortcuts
		const isRestBlockMode = this.isEncryption; // Reset block mode//== this._ENC_XFORM_MODE
		const modeCreator = isRestBlockMode ? mode.createEncryptor : mode.createDecryptor;
		if (!isRestBlockMode) this._minBufferSize = 1; /* if (this._xformMode == this._DEC_XFORM_MODE) */ // Keep at least one block in the buffer for unpadding
		if (this._mode && this._mode.__creator == modeCreator) {
			this._mode = modeCreator.call(mode, this, iv && iv.words); //			this._mode.init(this, iv && iv.words);
		} else {
			this._mode = modeCreator.call(mode, this, iv && iv.words);
			this._mode.__creator = modeCreator;
		}
	}

	_doProcessBlock(words, offset) {
		this._mode.processBlock(words, offset);
	}

	_doFinalize() {
		let finalProcessedBlocks;
		const padding = this.cfg.padding; // Shortcut
		// Finalize
		if (this.isEncryption) {
			padding.pad(this._data, this.blockSize); // Pad data//== this._ENC_XFORM_MODE
			finalProcessedBlocks = this._process(!!'flush'); // Process final blocks
		} /* if (this._xformMode == this._DEC_XFORM_MODE) */ else {
			finalProcessedBlocks = this._process(!!'flush'); // Process final blocks
			padding.unpad(finalProcessedBlocks); // Unpad data
		}
		return finalProcessedBlocks;
	}
	// static _createHelper = Cipher._createHelper;
}

/**
 * A collection of cipher parameters.
 *
 * @property {WordArray} ciphertext The raw ciphertext.
 * @property {WordArray} key The key to this ciphertext.
 * @property {WordArray} iv The IV used in the ciphering operation.
 * @property {WordArray} salt The salt used with a key derivation function.
 * @property {Cipher} algorithm The cipher algorithm.
 * @property {Mode} mode The block mode used in the ciphering operation.
 * @property {Padding} padding The padding scheme used in the ciphering operation.
 * @property {number} blockSize The block size of the cipher.
 * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
 */
class CipherParams extends Base {
	static defaultValue = {
		ciphertext: new WordArray(),
		key: new WordArray(),
		iv: new WordArray(),
		salt: new WordArray(),
		algorithm: null, //CryptoJS.algo.AES,
		mode: null, //CryptoJS.mode.CBC,
		padding: null, //CryptoJS.pad.PKCS7,
		blockSize: 4,
		formatter: null, //CryptoJS.format.OpenSSL,
	};
	/**
	 * Initializes a newly created cipher params object.
	 *
	 * @param {Object} cipherParams An object with any of the possible cipher parameters.
	 *
	 * @example
	 *
	 *     const cipherParams = new CryptoJS.lib.CipherParams({
	 *         ciphertext: ciphertextWordArray,
	 *         key: keyWordArray,
	 *         iv: ivWordArray,
	 *         salt: saltWordArray,
	 *         algorithm: CryptoJS.algo.AES,
	 *         mode: CryptoJS.mode.CBC,
	 *         padding: CryptoJS.pad.PKCS7,
	 *         blockSize: 4,
	 *         formatter: CryptoJS.format.OpenSSL
	 *     });
	 */
	constructor(cipherParams = CipherParams.defaultValue) {
		super();
		for (const key in cipherParams) this[key] = cipherParams[key];
		this.cfg = Base.mixIn(this.cfg, cipherParams);
	}

	/**
	 * Converts this cipher params object to a string.
	 *
	 * @param {Format} formatter (Optional) The formatting strategy to use.
	 *
	 * @return {string} The stringified cipher params.
	 *
	 * @throws Error If neither the formatter nor the default formatter is set.
	 *
	 * @example
	 *
	 *     const string = cipherParams + '';
	 *     const string = cipherParams.toString();
	 *     const string = cipherParams.toString(CryptoJS.format.OpenSSL);
	 */
	toString(formatter) {
		return (formatter || this.formatter).stringify(this);
	}
}
/**
 * PKCS #5/7 padding strategy.
 */
class Pkcs7 {
	/**
	 * Pads data using the algorithm defined in PKCS #5/7.
	 *
	 * @param {WordArray} data The data to pad.
	 * @param {number} blockSize The multiple that the data should be padded to.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
	 */
	static pad(data, blockSize) {
		const blockSizeBytes = blockSize * 4; // Shortcut
		const nPaddingBytes = blockSizeBytes - (data.sigBytes % blockSizeBytes); // Count padding bytes
		const paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes; // Create padding word
		const paddingWords = []; // Create padding
		for (let i = 0; i < nPaddingBytes; i += 4) paddingWords.push(paddingWord);
		const padding = new WordArray(paddingWords, nPaddingBytes);
		data.concat(padding); // Add padding
	}

	/**
	 * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
	 *
	 * @param {WordArray} data The data to unpad.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     CryptoJS.pad.Pkcs7.unpad(wordArray);
	 */
	static unpad(data) {
		const nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff; // Get number of padding bytes from last byte
		data.sigBytes -= nPaddingBytes; // Remove padding
	}
}

/**
 * OpenSSL formatting strategy.
 */
class OpenSSLFormatter {
	/**
	 * Converts a cipher params object to an OpenSSL-compatible string.
	 *
	 * @param {CipherParams} cipherParams The cipher params object.
	 *
	 * @return {string} The OpenSSL-compatible string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
	 */
	static stringify = cipherParams => {
		const ciphertext = cipherParams.ciphertext; // Shortcuts
		const salt = cipherParams.salt; // Shortcuts
		const wordArray = salt // Format
			? new WordArray([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext)
			: ciphertext;
		return wordArray.toString(Base64);
	};

	/**
	 * Converts an OpenSSL-compatible string to a cipher params object.
	 *
	 * @param {string} openSSLStr The OpenSSL-compatible string.
	 *
	 * @return {CipherParams} The cipher params object.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
	 */
	static parse = openSSLStr => {
		let salt;
		const ciphertext = Base64.parse(openSSLStr); // Parse base64
		const ciphertextWords = ciphertext.words; // Shortcut
		// Test for salt
		if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
			salt = new WordArray(ciphertextWords.slice(2, 4)); // Extract salt
			ciphertextWords.splice(0, 4); // Remove salt from ciphertext
			ciphertext.sigBytes -= 16;
		}
		return new CipherParams({ ciphertext, salt });
	};
}
/**
 * A cipher wrapper that returns ciphertext as a serializable cipher params object.
 */
class SerializableCipher extends Base {
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

/**
 * OpenSSL key derivation function.
 */
class OpenSSLKdf {
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
		return new CipherParams({ key, iv, salt: saltForUse }); // Return params
	};
}

/**
 * A serializable cipher wrapper that derives the key from a password,
 * and returns ciphertext as a serializable cipher params object.
 */
class PasswordBasedCipher extends SerializableCipher {
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

/**
 * Cipher Block Chaining mode.
 * Abstract base CBC mode.
 * CBC encryptor.
 */
class Encryptor extends BlockCipherMode {
	constructor(cipher, iv) {
		super(cipher, iv);
		this._prevBlock = iv ? iv.slice(0) : []; // Remember previous block
	}
	/**
	 * Processes the data block at offset.
	 *
	 * @param {Array} words The data words to operate on.
	 * @param {number} offset The offset where the block starts.
	 *
	 * @example
	 *
	 *     mode.processBlock(data.words, offset);
	 */
	processBlock(words, offset) {
		const cipher = this._cipher; // Shortcuts
		const blockSize = cipher.blockSize; // Shortcuts
		CBC.xorBlock(this, words, offset, blockSize); // XOR and encrypt
		cipher.encryptBlock(words, offset);
		this._prevBlock = words.slice(offset, offset + blockSize); // Remember this block to use with next block
	}
}

/**
 * CBC decryptor.
 */
class Decryptor extends BlockCipherMode {
	constructor(cipher, iv) {
		super(cipher, iv);
		this._prevBlock = iv ? iv.slice(0) : []; // Remember previous block
	}
	/**
	 * Processes the data block at offset.
	 *
	 * @param {Array} words The data words to operate on.
	 * @param {number} offset The offset where the block starts.
	 *
	 * @example
	 *
	 *     mode.processBlock(data.words, offset);
	 */
	processBlock(words, offset) {
		const cipher = this._cipher; // Shortcuts
		const blockSize = cipher.blockSize; // Shortcuts
		const thisBlock = words.slice(offset, offset + blockSize); // Remember this block to use with next block
		cipher.decryptBlock(words, offset); // Decrypt and XOR
		CBC.xorBlock(this, words, offset, blockSize);
		this._prevBlock = thisBlock; // This block becomes the previous block
	}
}
class CBC extends BlockCipherMode {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	static Encryptor = Encryptor;
	static Decryptor = Decryptor;
	static xorBlock(self, words, offset, blockSize) {
		const iv = self._iv; // Shortcut
		const block = iv ? iv : self._prevBlock;
		if (iv) self._iv = undefined; // Choose mixing block// Remove IV for subsequent blocks
		for (let i = 0; i < blockSize; i++) words[offset + i] ^= block[i]; // XOR blocks
	}
}

SerializableCipher.defaultConf.format = OpenSSLFormatter;
PasswordBasedCipher.defaultConf.kdf = OpenSSLKdf;
BlockCipher.defaultConf.mode = CBC;
BlockCipher.defaultConf.padding = Pkcs7;
/*globals window, global, require*/

/**
 * CryptoJS core components.
 */

/** Local polyfill of Object.create*/
// const create =
// 	Object.create ||
// 	(function () {
// 		function F() {}
// 		return obj => {
// 			F.prototype = obj;
// 			const subtype = new F();
// 			F.prototype = null;
// 			return subtype;
// 		};
// 	})();
/**
 * Library namespace.
 */
const C_lib = C.lib;
C_lib.WordArray = WordArray; // Export WordArray
/////////////////////////////////////////////////////////////////////////////////////////
WordArray.defaultEncodeHex = Hex;
/**
 * Encoder namespace.
 */
const C_enc = { Utf8, Latin1, Hex }; // Create C_enc namespace
C.enc = C_enc; // Export C_enc
C_lib.BufferedBlockAlgorithm = BufferedBlockAlgorithm; // Export BufferedBlockAlgorithm
const base = new Base();
C_lib.Base = base; // Export Base
C_lib.Hasher = Hasher; // Export Hasher
C_lib.Base = Base; //Algorithm namespace.
CryptoJS.lib.Cipher; //Cipher core components.
C.mode = { CBC }; //Mode namespace.
C.pad = { Pkcs7 }; //Padding namespace.
C.format = { OpenSSL: OpenSSLFormatter }; //Format namespace.
C.kdf = { OpenSSL: OpenSSLKdf }; // Key derivation function namespace.
C_lib.Cipher = Cipher;
C_lib.StreamCipher = StreamCipher;
C_lib.BlockCipherMode = BlockCipherMode;
C_lib.BlockCipher = BlockCipher;
C_lib.CipherParams = CipherParams;
C_lib.SerializableCipher = new SerializableCipher();
C_lib.PasswordBasedCipher = new PasswordBasedCipher();
Cipher.PasswordBasedCipher = new PasswordBasedCipher();
Cipher.SerializableCipher = new SerializableCipher();
// Lookup tables
const SBOX = [];
const INV_SBOX = [];
const SUB_MIX_0 = [];
const SUB_MIX_1 = [];
const SUB_MIX_2 = [];
const SUB_MIX_3 = [];
const INV_SUB_MIX_0 = [];
const INV_SUB_MIX_1 = [];
const INV_SUB_MIX_2 = [];
const INV_SUB_MIX_3 = [];

// Compute lookup tables
const d = []; // Compute double table
for (let i = 0; i < 256; i++) d[i] = i < 128 ? i << 1 : (i << 1) ^ 0x11b;
let xj = 0, // Walk GF(2^8)
	xi = 0;
for (let i = 0; i < 256; i++) {
	const sxi = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4); // Compute sbox
	const sx = (sxi >>> 8) ^ (sxi & 0xff) ^ 0x63;
	SBOX[xj] = sx;
	INV_SBOX[sx] = xj;
	const x2 = d[xj]; // Compute multiplication
	const x4 = d[x2];
	const x8 = d[x4];
	const s = (d[sx] * 0x101) ^ (sx * 0x1010100); // Compute sub bytes, mix columns tables
	SUB_MIX_0[xj] = (s << 24) | (s >>> 8);
	SUB_MIX_1[xj] = (s << 16) | (s >>> 16);
	SUB_MIX_2[xj] = (s << 8) | (s >>> 24);
	SUB_MIX_3[xj] = s;
	const t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (xj * 0x1010100); // Compute inv sub bytes, inv mix columns tables
	INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
	INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
	INV_SUB_MIX_2[sx] = (t << 8) | (t >>> 24);
	INV_SUB_MIX_3[sx] = t;
	if (!xj) xj = xi = 1; // Compute next counter
	else {
		xj = x2 ^ d[d[d[x8 ^ x2]]];
		xi ^= d[d[xi]];
	}
}

// Precomputed Rcon lookup
const RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

/**
 * AES block cipher algorithm.
 */
class AES extends BlockCipher {
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.keySize = 256 / 32;
		this.reset();
	}

	_doReset() {
		super._doReset();
		let t;
		if (this._nRounds && this._keyPriorReset === this._key) return; // Skip reset of nRounds has been set before and key did not change
		const key = this._key; // Shortcuts
		this._keyPriorReset = key;
		const keyWords = key.words; // Shortcuts
		const keySize = key.sigBytes / 4; // Shortcuts
		const nRounds = (this._nRounds = keySize + 6); // Compute number of rounds
		const ksRows = (nRounds + 1) * 4; // Compute number of key schedule rows
		const keySchedule = []; // Compute key schedule
		this._keySchedule = keySchedule;
		for (let ksRow = 0; ksRow < ksRows; ksRow++)
			if (ksRow < keySize) keySchedule[ksRow] = keyWords[ksRow];
			else {
				t = keySchedule[ksRow - 1];
				if (!(ksRow % keySize)) {
					t = (t << 8) | (t >>> 24); // Rot word
					t = // Sub word
						(SBOX[t >>> 24] << 24) |
						(SBOX[(t >>> 16) & 0xff] << 16) |
						(SBOX[(t >>> 8) & 0xff] << 8) |
						SBOX[t & 0xff];
					t ^= RCON[(ksRow / keySize) | 0] << 24; // Mix Rcon
				} else if (keySize > 6 && ksRow % keySize == 4) {
					t = // Sub word
						(SBOX[t >>> 24] << 24) |
						(SBOX[(t >>> 16) & 0xff] << 16) |
						(SBOX[(t >>> 8) & 0xff] << 8) |
						SBOX[t & 0xff];
				}
				keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
			}

		const invKeySchedule = []; // Compute inv key schedule
		this._invKeySchedule = invKeySchedule;
		for (let invKsRow = 0; invKsRow < ksRows; invKsRow++) {
			const ksRow = ksRows - invKsRow;
			const t = invKsRow % 4 ? keySchedule[ksRow] : keySchedule[ksRow - 4];
			if (invKsRow < 4 || ksRow <= 4) invKeySchedule[invKsRow] = t;
			else {
				invKeySchedule[invKsRow] =
					INV_SUB_MIX_0[SBOX[t >>> 24]] ^
					INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
					INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^
					INV_SUB_MIX_3[SBOX[t & 0xff]];
			}
		}
	}

	encryptBlock(M, offset) {
		this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
	}

	decryptBlock(M, offset) {
		const s = M[offset + 1]; // Swap 2nd and 4th rows
		M[offset + 1] = M[offset + 3];
		M[offset + 3] = s;
		this._doCryptBlock(
			M,
			offset,
			this._invKeySchedule,
			INV_SUB_MIX_0,
			INV_SUB_MIX_1,
			INV_SUB_MIX_2,
			INV_SUB_MIX_3,
			INV_SBOX
		);
		const t = M[offset + 1]; // Inv swap 2nd and 4th rows
		M[offset + 1] = M[offset + 3];
		M[offset + 3] = t;
	}

	_doCryptBlock(M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
		const nRounds = this._nRounds; // Shortcut
		let s0 = M[offset] ^ keySchedule[0], // Get input, add round key
			s1 = M[offset + 1] ^ keySchedule[1],
			s2 = M[offset + 2] ^ keySchedule[2],
			s3 = M[offset + 3] ^ keySchedule[3],
			ksRow = 4; // Key schedule row counter
		// Rounds
		for (let round = 1; round < nRounds; round++) {
			// Shift rows, sub bytes, mix columns, add round key
			const t0 =
				SUB_MIX_0[s0 >>> 24] ^
				SUB_MIX_1[(s1 >>> 16) & 0xff] ^
				SUB_MIX_2[(s2 >>> 8) & 0xff] ^
				SUB_MIX_3[s3 & 0xff] ^
				keySchedule[ksRow++];
			const t1 =
				SUB_MIX_0[s1 >>> 24] ^
				SUB_MIX_1[(s2 >>> 16) & 0xff] ^
				SUB_MIX_2[(s3 >>> 8) & 0xff] ^
				SUB_MIX_3[s0 & 0xff] ^
				keySchedule[ksRow++];
			const t2 =
				SUB_MIX_0[s2 >>> 24] ^
				SUB_MIX_1[(s3 >>> 16) & 0xff] ^
				SUB_MIX_2[(s0 >>> 8) & 0xff] ^
				SUB_MIX_3[s1 & 0xff] ^
				keySchedule[ksRow++];
			const t3 =
				SUB_MIX_0[s3 >>> 24] ^
				SUB_MIX_1[(s0 >>> 16) & 0xff] ^
				SUB_MIX_2[(s1 >>> 8) & 0xff] ^
				SUB_MIX_3[s2 & 0xff] ^
				keySchedule[ksRow++];

			// Update state
			s0 = t0;
			s1 = t1;
			s2 = t2;
			s3 = t3;
		}

		// Shift rows, sub bytes, add round key
		const t0 =
			((SBOX[s0 >>> 24] << 24) |
				(SBOX[(s1 >>> 16) & 0xff] << 16) |
				(SBOX[(s2 >>> 8) & 0xff] << 8) |
				SBOX[s3 & 0xff]) ^
			keySchedule[ksRow++];
		const t1 =
			((SBOX[s1 >>> 24] << 24) |
				(SBOX[(s2 >>> 16) & 0xff] << 16) |
				(SBOX[(s3 >>> 8) & 0xff] << 8) |
				SBOX[s0 & 0xff]) ^
			keySchedule[ksRow++];
		const t2 =
			((SBOX[s2 >>> 24] << 24) |
				(SBOX[(s3 >>> 16) & 0xff] << 16) |
				(SBOX[(s0 >>> 8) & 0xff] << 8) |
				SBOX[s1 & 0xff]) ^
			keySchedule[ksRow++];
		const t3 =
			((SBOX[s3 >>> 24] << 24) |
				(SBOX[(s0 >>> 16) & 0xff] << 16) |
				(SBOX[(s1 >>> 8) & 0xff] << 8) |
				SBOX[s2 & 0xff]) ^
			keySchedule[ksRow++];

		// Set output
		M[offset] = t0;
		M[offset + 1] = t1;
		M[offset + 2] = t2;
		M[offset + 3] = t3;
	}
}
/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     const ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
 *     const plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
 */
C.AES = BlockCipher._createHelper(AES);

const N = 16;

//Origin pbox and sbox, derived from PI
const ORIG_P = [
	0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344, 0xa4093822, 0x299f31d0, 0x082efa98, 0xec4e6c89, 0x452821e6,
	0x38d01377, 0xbe5466cf, 0x34e90c6c, 0xc0ac29b7, 0xc97c50dd, 0x3f84d5b5, 0xb5470917, 0x9216d5d9, 0x8979fb1b,
];

const ORIG_S = [
	[
		0xd1310ba6, 0x98dfb5ac, 0x2ffd72db, 0xd01adfb7, 0xb8e1afed, 0x6a267e96, 0xba7c9045, 0xf12c7f99, 0x24a19947,
		0xb3916cf7, 0x0801f2e2, 0x858efc16, 0x636920d8, 0x71574e69, 0xa458fea3, 0xf4933d7e, 0x0d95748f, 0x728eb658,
		0x718bcd58, 0x82154aee, 0x7b54a41d, 0xc25a59b5, 0x9c30d539, 0x2af26013, 0xc5d1b023, 0x286085f0, 0xca417918,
		0xb8db38ef, 0x8e79dcb0, 0x603a180e, 0x6c9e0e8b, 0xb01e8a3e, 0xd71577c1, 0xbd314b27, 0x78af2fda, 0x55605c60,
		0xe65525f3, 0xaa55ab94, 0x57489862, 0x63e81440, 0x55ca396a, 0x2aab10b6, 0xb4cc5c34, 0x1141e8ce, 0xa15486af,
		0x7c72e993, 0xb3ee1411, 0x636fbc2a, 0x2ba9c55d, 0x741831f6, 0xce5c3e16, 0x9b87931e, 0xafd6ba33, 0x6c24cf5c,
		0x7a325381, 0x28958677, 0x3b8f4898, 0x6b4bb9af, 0xc4bfe81b, 0x66282193, 0x61d809cc, 0xfb21a991, 0x487cac60,
		0x5dec8032, 0xef845d5d, 0xe98575b1, 0xdc262302, 0xeb651b88, 0x23893e81, 0xd396acc5, 0x0f6d6ff3, 0x83f44239,
		0x2e0b4482, 0xa4842004, 0x69c8f04a, 0x9e1f9b5e, 0x21c66842, 0xf6e96c9a, 0x670c9c61, 0xabd388f0, 0x6a51a0d2,
		0xd8542f68, 0x960fa728, 0xab5133a3, 0x6eef0b6c, 0x137a3be4, 0xba3bf050, 0x7efb2a98, 0xa1f1651d, 0x39af0176,
		0x66ca593e, 0x82430e88, 0x8cee8619, 0x456f9fb4, 0x7d84a5c3, 0x3b8b5ebe, 0xe06f75d8, 0x85c12073, 0x401a449f,
		0x56c16aa6, 0x4ed3aa62, 0x363f7706, 0x1bfedf72, 0x429b023d, 0x37d0d724, 0xd00a1248, 0xdb0fead3, 0x49f1c09b,
		0x075372c9, 0x80991b7b, 0x25d479d8, 0xf6e8def7, 0xe3fe501a, 0xb6794c3b, 0x976ce0bd, 0x04c006ba, 0xc1a94fb6,
		0x409f60c4, 0x5e5c9ec2, 0x196a2463, 0x68fb6faf, 0x3e6c53b5, 0x1339b2eb, 0x3b52ec6f, 0x6dfc511f, 0x9b30952c,
		0xcc814544, 0xaf5ebd09, 0xbee3d004, 0xde334afd, 0x660f2807, 0x192e4bb3, 0xc0cba857, 0x45c8740f, 0xd20b5f39,
		0xb9d3fbdb, 0x5579c0bd, 0x1a60320a, 0xd6a100c6, 0x402c7279, 0x679f25fe, 0xfb1fa3cc, 0x8ea5e9f8, 0xdb3222f8,
		0x3c7516df, 0xfd616b15, 0x2f501ec8, 0xad0552ab, 0x323db5fa, 0xfd238760, 0x53317b48, 0x3e00df82, 0x9e5c57bb,
		0xca6f8ca0, 0x1a87562e, 0xdf1769db, 0xd542a8f6, 0x287effc3, 0xac6732c6, 0x8c4f5573, 0x695b27b0, 0xbbca58c8,
		0xe1ffa35d, 0xb8f011a0, 0x10fa3d98, 0xfd2183b8, 0x4afcb56c, 0x2dd1d35b, 0x9a53e479, 0xb6f84565, 0xd28e49bc,
		0x4bfb9790, 0xe1ddf2da, 0xa4cb7e33, 0x62fb1341, 0xcee4c6e8, 0xef20cada, 0x36774c01, 0xd07e9efe, 0x2bf11fb4,
		0x95dbda4d, 0xae909198, 0xeaad8e71, 0x6b93d5a0, 0xd08ed1d0, 0xafc725e0, 0x8e3c5b2f, 0x8e7594b7, 0x8ff6e2fb,
		0xf2122b64, 0x8888b812, 0x900df01c, 0x4fad5ea0, 0x688fc31c, 0xd1cff191, 0xb3a8c1ad, 0x2f2f2218, 0xbe0e1777,
		0xea752dfe, 0x8b021fa1, 0xe5a0cc0f, 0xb56f74e8, 0x18acf3d6, 0xce89e299, 0xb4a84fe0, 0xfd13e0b7, 0x7cc43b81,
		0xd2ada8d9, 0x165fa266, 0x80957705, 0x93cc7314, 0x211a1477, 0xe6ad2065, 0x77b5fa86, 0xc75442f5, 0xfb9d35cf,
		0xebcdaf0c, 0x7b3e89a0, 0xd6411bd3, 0xae1e7e49, 0x00250e2d, 0x2071b35e, 0x226800bb, 0x57b8e0af, 0x2464369b,
		0xf009b91e, 0x5563911d, 0x59dfa6aa, 0x78c14389, 0xd95a537f, 0x207d5ba2, 0x02e5b9c5, 0x83260376, 0x6295cfa9,
		0x11c81968, 0x4e734a41, 0xb3472dca, 0x7b14a94a, 0x1b510052, 0x9a532915, 0xd60f573f, 0xbc9bc6e4, 0x2b60a476,
		0x81e67400, 0x08ba6fb5, 0x571be91f, 0xf296ec6b, 0x2a0dd915, 0xb6636521, 0xe7b9f9b6, 0xff34052e, 0xc5855664,
		0x53b02d5d, 0xa99f8fa1, 0x08ba4799, 0x6e85076a,
	],
	[
		0x4b7a70e9, 0xb5b32944, 0xdb75092e, 0xc4192623, 0xad6ea6b0, 0x49a7df7d, 0x9cee60b8, 0x8fedb266, 0xecaa8c71,
		0x699a17ff, 0x5664526c, 0xc2b19ee1, 0x193602a5, 0x75094c29, 0xa0591340, 0xe4183a3e, 0x3f54989a, 0x5b429d65,
		0x6b8fe4d6, 0x99f73fd6, 0xa1d29c07, 0xefe830f5, 0x4d2d38e6, 0xf0255dc1, 0x4cdd2086, 0x8470eb26, 0x6382e9c6,
		0x021ecc5e, 0x09686b3f, 0x3ebaefc9, 0x3c971814, 0x6b6a70a1, 0x687f3584, 0x52a0e286, 0xb79c5305, 0xaa500737,
		0x3e07841c, 0x7fdeae5c, 0x8e7d44ec, 0x5716f2b8, 0xb03ada37, 0xf0500c0d, 0xf01c1f04, 0x0200b3ff, 0xae0cf51a,
		0x3cb574b2, 0x25837a58, 0xdc0921bd, 0xd19113f9, 0x7ca92ff6, 0x94324773, 0x22f54701, 0x3ae5e581, 0x37c2dadc,
		0xc8b57634, 0x9af3dda7, 0xa9446146, 0x0fd0030e, 0xecc8c73e, 0xa4751e41, 0xe238cd99, 0x3bea0e2f, 0x3280bba1,
		0x183eb331, 0x4e548b38, 0x4f6db908, 0x6f420d03, 0xf60a04bf, 0x2cb81290, 0x24977c79, 0x5679b072, 0xbcaf89af,
		0xde9a771f, 0xd9930810, 0xb38bae12, 0xdccf3f2e, 0x5512721f, 0x2e6b7124, 0x501adde6, 0x9f84cd87, 0x7a584718,
		0x7408da17, 0xbc9f9abc, 0xe94b7d8c, 0xec7aec3a, 0xdb851dfa, 0x63094366, 0xc464c3d2, 0xef1c1847, 0x3215d908,
		0xdd433b37, 0x24c2ba16, 0x12a14d43, 0x2a65c451, 0x50940002, 0x133ae4dd, 0x71dff89e, 0x10314e55, 0x81ac77d6,
		0x5f11199b, 0x043556f1, 0xd7a3c76b, 0x3c11183b, 0x5924a509, 0xf28fe6ed, 0x97f1fbfa, 0x9ebabf2c, 0x1e153c6e,
		0x86e34570, 0xeae96fb1, 0x860e5e0a, 0x5a3e2ab3, 0x771fe71c, 0x4e3d06fa, 0x2965dcb9, 0x99e71d0f, 0x803e89d6,
		0x5266c825, 0x2e4cc978, 0x9c10b36a, 0xc6150eba, 0x94e2ea78, 0xa5fc3c53, 0x1e0a2df4, 0xf2f74ea7, 0x361d2b3d,
		0x1939260f, 0x19c27960, 0x5223a708, 0xf71312b6, 0xebadfe6e, 0xeac31f66, 0xe3bc4595, 0xa67bc883, 0xb17f37d1,
		0x018cff28, 0xc332ddef, 0xbe6c5aa5, 0x65582185, 0x68ab9802, 0xeecea50f, 0xdb2f953b, 0x2aef7dad, 0x5b6e2f84,
		0x1521b628, 0x29076170, 0xecdd4775, 0x619f1510, 0x13cca830, 0xeb61bd96, 0x0334fe1e, 0xaa0363cf, 0xb5735c90,
		0x4c70a239, 0xd59e9e0b, 0xcbaade14, 0xeecc86bc, 0x60622ca7, 0x9cab5cab, 0xb2f3846e, 0x648b1eaf, 0x19bdf0ca,
		0xa02369b9, 0x655abb50, 0x40685a32, 0x3c2ab4b3, 0x319ee9d5, 0xc021b8f7, 0x9b540b19, 0x875fa099, 0x95f7997e,
		0x623d7da8, 0xf837889a, 0x97e32d77, 0x11ed935f, 0x16681281, 0x0e358829, 0xc7e61fd6, 0x96dedfa1, 0x7858ba99,
		0x57f584a5, 0x1b227263, 0x9b83c3ff, 0x1ac24696, 0xcdb30aeb, 0x532e3054, 0x8fd948e4, 0x6dbc3128, 0x58ebf2ef,
		0x34c6ffea, 0xfe28ed61, 0xee7c3c73, 0x5d4a14d9, 0xe864b7e3, 0x42105d14, 0x203e13e0, 0x45eee2b6, 0xa3aaabea,
		0xdb6c4f15, 0xfacb4fd0, 0xc742f442, 0xef6abbb5, 0x654f3b1d, 0x41cd2105, 0xd81e799e, 0x86854dc7, 0xe44b476a,
		0x3d816250, 0xcf62a1f2, 0x5b8d2646, 0xfc8883a0, 0xc1c7b6a3, 0x7f1524c3, 0x69cb7492, 0x47848a0b, 0x5692b285,
		0x095bbf00, 0xad19489d, 0x1462b174, 0x23820e00, 0x58428d2a, 0x0c55f5ea, 0x1dadf43e, 0x233f7061, 0x3372f092,
		0x8d937e41, 0xd65fecf1, 0x6c223bdb, 0x7cde3759, 0xcbee7460, 0x4085f2a7, 0xce77326e, 0xa6078084, 0x19f8509e,
		0xe8efd855, 0x61d99735, 0xa969a7aa, 0xc50c06c2, 0x5a04abfc, 0x800bcadc, 0x9e447a2e, 0xc3453484, 0xfdd56705,
		0x0e1e9ec9, 0xdb73dbd3, 0x105588cd, 0x675fda79, 0xe3674340, 0xc5c43465, 0x713e38d8, 0x3d28f89e, 0xf16dff20,
		0x153e21e7, 0x8fb03d4a, 0xe6e39f2b, 0xdb83adf7,
	],
	[
		0xe93d5a68, 0x948140f7, 0xf64c261c, 0x94692934, 0x411520f7, 0x7602d4f7, 0xbcf46b2e, 0xd4a20068, 0xd4082471,
		0x3320f46a, 0x43b7d4b7, 0x500061af, 0x1e39f62e, 0x97244546, 0x14214f74, 0xbf8b8840, 0x4d95fc1d, 0x96b591af,
		0x70f4ddd3, 0x66a02f45, 0xbfbc09ec, 0x03bd9785, 0x7fac6dd0, 0x31cb8504, 0x96eb27b3, 0x55fd3941, 0xda2547e6,
		0xabca0a9a, 0x28507825, 0x530429f4, 0x0a2c86da, 0xe9b66dfb, 0x68dc1462, 0xd7486900, 0x680ec0a4, 0x27a18dee,
		0x4f3ffea2, 0xe887ad8c, 0xb58ce006, 0x7af4d6b6, 0xaace1e7c, 0xd3375fec, 0xce78a399, 0x406b2a42, 0x20fe9e35,
		0xd9f385b9, 0xee39d7ab, 0x3b124e8b, 0x1dc9faf7, 0x4b6d1856, 0x26a36631, 0xeae397b2, 0x3a6efa74, 0xdd5b4332,
		0x6841e7f7, 0xca7820fb, 0xfb0af54e, 0xd8feb397, 0x454056ac, 0xba489527, 0x55533a3a, 0x20838d87, 0xfe6ba9b7,
		0xd096954b, 0x55a867bc, 0xa1159a58, 0xcca92963, 0x99e1db33, 0xa62a4a56, 0x3f3125f9, 0x5ef47e1c, 0x9029317c,
		0xfdf8e802, 0x04272f70, 0x80bb155c, 0x05282ce3, 0x95c11548, 0xe4c66d22, 0x48c1133f, 0xc70f86dc, 0x07f9c9ee,
		0x41041f0f, 0x404779a4, 0x5d886e17, 0x325f51eb, 0xd59bc0d1, 0xf2bcc18f, 0x41113564, 0x257b7834, 0x602a9c60,
		0xdff8e8a3, 0x1f636c1b, 0x0e12b4c2, 0x02e1329e, 0xaf664fd1, 0xcad18115, 0x6b2395e0, 0x333e92e1, 0x3b240b62,
		0xeebeb922, 0x85b2a20e, 0xe6ba0d99, 0xde720c8c, 0x2da2f728, 0xd0127845, 0x95b794fd, 0x647d0862, 0xe7ccf5f0,
		0x5449a36f, 0x877d48fa, 0xc39dfd27, 0xf33e8d1e, 0x0a476341, 0x992eff74, 0x3a6f6eab, 0xf4f8fd37, 0xa812dc60,
		0xa1ebddf8, 0x991be14c, 0xdb6e6b0d, 0xc67b5510, 0x6d672c37, 0x2765d43b, 0xdcd0e804, 0xf1290dc7, 0xcc00ffa3,
		0xb5390f92, 0x690fed0b, 0x667b9ffb, 0xcedb7d9c, 0xa091cf0b, 0xd9155ea3, 0xbb132f88, 0x515bad24, 0x7b9479bf,
		0x763bd6eb, 0x37392eb3, 0xcc115979, 0x8026e297, 0xf42e312d, 0x6842ada7, 0xc66a2b3b, 0x12754ccc, 0x782ef11c,
		0x6a124237, 0xb79251e7, 0x06a1bbe6, 0x4bfb6350, 0x1a6b1018, 0x11caedfa, 0x3d25bdd8, 0xe2e1c3c9, 0x44421659,
		0x0a121386, 0xd90cec6e, 0xd5abea2a, 0x64af674e, 0xda86a85f, 0xbebfe988, 0x64e4c3fe, 0x9dbc8057, 0xf0f7c086,
		0x60787bf8, 0x6003604d, 0xd1fd8346, 0xf6381fb0, 0x7745ae04, 0xd736fccc, 0x83426b33, 0xf01eab71, 0xb0804187,
		0x3c005e5f, 0x77a057be, 0xbde8ae24, 0x55464299, 0xbf582e61, 0x4e58f48f, 0xf2ddfda2, 0xf474ef38, 0x8789bdc2,
		0x5366f9c3, 0xc8b38e74, 0xb475f255, 0x46fcd9b9, 0x7aeb2661, 0x8b1ddf84, 0x846a0e79, 0x915f95e2, 0x466e598e,
		0x20b45770, 0x8cd55591, 0xc902de4c, 0xb90bace1, 0xbb8205d0, 0x11a86248, 0x7574a99e, 0xb77f19b6, 0xe0a9dc09,
		0x662d09a1, 0xc4324633, 0xe85a1f02, 0x09f0be8c, 0x4a99a025, 0x1d6efe10, 0x1ab93d1d, 0x0ba5a4df, 0xa186f20f,
		0x2868f169, 0xdcb7da83, 0x573906fe, 0xa1e2ce9b, 0x4fcd7f52, 0x50115e01, 0xa70683fa, 0xa002b5c4, 0x0de6d027,
		0x9af88c27, 0x773f8641, 0xc3604c06, 0x61a806b5, 0xf0177a28, 0xc0f586e0, 0x006058aa, 0x30dc7d62, 0x11e69ed7,
		0x2338ea63, 0x53c2dd94, 0xc2c21634, 0xbbcbee56, 0x90bcb6de, 0xebfc7da1, 0xce591d76, 0x6f05e409, 0x4b7c0188,
		0x39720a3d, 0x7c927c24, 0x86e3725f, 0x724d9db9, 0x1ac15bb4, 0xd39eb8fc, 0xed545578, 0x08fca5b5, 0xd83d7cd3,
		0x4dad0fc4, 0x1e50ef5e, 0xb161e6f8, 0xa28514d9, 0x6c51133c, 0x6fd5c7e7, 0x56e14ec4, 0x362abfce, 0xddc6c837,
		0xd79a3234, 0x92638212, 0x670efa8e, 0x406000e0,
	],
	[
		0x3a39ce37, 0xd3faf5cf, 0xabc27737, 0x5ac52d1b, 0x5cb0679e, 0x4fa33742, 0xd3822740, 0x99bc9bbe, 0xd5118e9d,
		0xbf0f7315, 0xd62d1c7e, 0xc700c47b, 0xb78c1b6b, 0x21a19045, 0xb26eb1be, 0x6a366eb4, 0x5748ab2f, 0xbc946e79,
		0xc6a376d2, 0x6549c2c8, 0x530ff8ee, 0x468dde7d, 0xd5730a1d, 0x4cd04dc6, 0x2939bbdb, 0xa9ba4650, 0xac9526e8,
		0xbe5ee304, 0xa1fad5f0, 0x6a2d519a, 0x63ef8ce2, 0x9a86ee22, 0xc089c2b8, 0x43242ef6, 0xa51e03aa, 0x9cf2d0a4,
		0x83c061ba, 0x9be96a4d, 0x8fe51550, 0xba645bd6, 0x2826a2f9, 0xa73a3ae1, 0x4ba99586, 0xef5562e9, 0xc72fefd3,
		0xf752f7da, 0x3f046f69, 0x77fa0a59, 0x80e4a915, 0x87b08601, 0x9b09e6ad, 0x3b3ee593, 0xe990fd5a, 0x9e34d797,
		0x2cf0b7d9, 0x022b8b51, 0x96d5ac3a, 0x017da67d, 0xd1cf3ed6, 0x7c7d2d28, 0x1f9f25cf, 0xadf2b89b, 0x5ad6b472,
		0x5a88f54c, 0xe029ac71, 0xe019a5e6, 0x47b0acfd, 0xed93fa9b, 0xe8d3c48d, 0x283b57cc, 0xf8d56629, 0x79132e28,
		0x785f0191, 0xed756055, 0xf7960e44, 0xe3d35e8c, 0x15056dd4, 0x88f46dba, 0x03a16125, 0x0564f0bd, 0xc3eb9e15,
		0x3c9057a2, 0x97271aec, 0xa93a072a, 0x1b3f6d9b, 0x1e6321f5, 0xf59c66fb, 0x26dcf319, 0x7533d928, 0xb155fdf5,
		0x03563482, 0x8aba3cbb, 0x28517711, 0xc20ad9f8, 0xabcc5167, 0xccad925f, 0x4de81751, 0x3830dc8e, 0x379d5862,
		0x9320f991, 0xea7a90c2, 0xfb3e7bce, 0x5121ce64, 0x774fbe32, 0xa8b6e37e, 0xc3293d46, 0x48de5369, 0x6413e680,
		0xa2ae0810, 0xdd6db224, 0x69852dfd, 0x09072166, 0xb39a460a, 0x6445c0dd, 0x586cdecf, 0x1c20c8ae, 0x5bbef7dd,
		0x1b588d40, 0xccd2017f, 0x6bb4e3bb, 0xdda26a7e, 0x3a59ff45, 0x3e350a44, 0xbcb4cdd5, 0x72eacea8, 0xfa6484bb,
		0x8d6612ae, 0xbf3c6f47, 0xd29be463, 0x542f5d9e, 0xaec2771b, 0xf64e6370, 0x740e0d8d, 0xe75b1357, 0xf8721671,
		0xaf537d5d, 0x4040cb08, 0x4eb4e2cc, 0x34d2466a, 0x0115af84, 0xe1b00428, 0x95983a1d, 0x06b89fb4, 0xce6ea048,
		0x6f3f3b82, 0x3520ab82, 0x011a1d4b, 0x277227f8, 0x611560b1, 0xe7933fdc, 0xbb3a792b, 0x344525bd, 0xa08839e1,
		0x51ce794b, 0x2f32c9b7, 0xa01fbac9, 0xe01cc87e, 0xbcc7d1f6, 0xcf0111c3, 0xa1e8aac7, 0x1a908749, 0xd44fbd9a,
		0xd0dadecb, 0xd50ada38, 0x0339c32a, 0xc6913667, 0x8df9317c, 0xe0b12b4f, 0xf79e59b7, 0x43f5bb3a, 0xf2d519ff,
		0x27d9459c, 0xbf97222c, 0x15e6fc2a, 0x0f91fc71, 0x9b941525, 0xfae59361, 0xceb69ceb, 0xc2a86459, 0x12baa8d1,
		0xb6c1075e, 0xe3056a0c, 0x10d25065, 0xcb03a442, 0xe0ec6e0e, 0x1698db3b, 0x4c98a0be, 0x3278e964, 0x9f1f9532,
		0xe0d392df, 0xd3a0342b, 0x8971f21e, 0x1b0a7441, 0x4ba3348c, 0xc5be7120, 0xc37632d8, 0xdf359f8d, 0x9b992f2e,
		0xe60b6f47, 0x0fe3f11d, 0xe54cda54, 0x1edad891, 0xce6279cf, 0xcd3e7e6f, 0x1618b166, 0xfd2c1d05, 0x848fd2c5,
		0xf6fb2299, 0xf523f357, 0xa6327623, 0x93a83531, 0x56cccd02, 0xacf08162, 0x5a75ebb5, 0x6e163697, 0x88d273cc,
		0xde966292, 0x81b949d0, 0x4c50901b, 0x71c65614, 0xe6c6c7bd, 0x327a140a, 0x45e1d006, 0xc3f27b9a, 0xc9aa53fd,
		0x62a80f00, 0xbb25bfe2, 0x35bdd2f6, 0x71126905, 0xb2040222, 0xb6cbcf7c, 0xcd769c2b, 0x53113ec0, 0x1640e3d3,
		0x38abbd60, 0x2547adf0, 0xba38209c, 0xf746ce76, 0x77afa1c5, 0x20756060, 0x85cbfe4e, 0x8ae88dd8, 0x7aaaf9b0,
		0x4cf9aa7e, 0x1948c25c, 0x02fb8a8c, 0x01c36ae4, 0xd6ebe1f9, 0x90d4f869, 0xa65cdea0, 0x3f09252d, 0xc208e69f,
		0xb74e6132, 0xce77e25b, 0x578fdfe3, 0x3ac372e6,
	],
];

const BLOWFISH_CTX = {
	pbox: [],
	sbox: [],
};

const F = (ctx, x) => {
	const a = (x >> 24) & 0xff;
	const b = (x >> 16) & 0xff;
	const c = (x >> 8) & 0xff;
	const d = x & 0xff;
	const sbox = ctx.sbox;
	let y = sbox[0][a] + sbox[1][b];
	y = y ^ sbox[2][c];
	y = y + sbox[3][d];

	return y;
};

const BlowFish_Encrypt = (ctx, left, right) => {
	let Xl = left;
	let Xr = right;
	let temp;
	const pbox = ctx.pbox;
	for (let i = 0; i < N; ++i) {
		Xl = Xl ^ pbox[i];
		Xr = F(ctx, Xl) ^ Xr;

		temp = Xl;
		Xl = Xr;
		Xr = temp;
	}

	temp = Xl;
	Xl = Xr;
	Xr = temp;

	Xr = Xr ^ pbox[N];
	Xl = Xl ^ pbox[N + 1];

	return { left: Xl, right: Xr };
};

const BlowFish_Decrypt = (ctx, left, right) => {
	let Xl = left;
	let Xr = right;
	let temp;
	const pbox = ctx.pbox;
	for (let i = N + 1; i > 1; --i) {
		Xl = Xl ^ pbox[i];
		Xr = F(ctx, Xl) ^ Xr;

		temp = Xl;
		Xl = Xr;
		Xr = temp;
	}

	temp = Xl;
	Xl = Xr;
	Xr = temp;

	Xr = Xr ^ pbox[1];
	Xl = Xl ^ pbox[0];

	return { left: Xl, right: Xr };
};

/**
 * Initialization ctx's pbox and sbox.
 *
 * @param {Object} ctx The object has pbox and sbox.
 * @param {Array} key An array of 32-bit words.
 * @param {int} keysize The length of the key.
 *
 * @example
 *
 *     BlowFishInit(BLOWFISH_CTX, key, 128/32);
 */
const BlowFishInit = (ctx, key, keysize) => {
	for (let Row = 0; Row < 4; Row++) {
		const sbox = [];
		const origS = ORIG_S[Row];
		ctx.sbox[Row] = sbox;
		for (let Col = 0; Col < 256; Col++) sbox[Col] = origS[Col];
	}
	const pbox = ctx.pbox;
	let keyIndex = 0;
	for (let index = 0; index < N + 2; index++) {
		pbox[index] = ORIG_P[index] ^ key[keyIndex];
		keyIndex++;
		if (keyIndex >= keysize) keyIndex = 0;
	}
	let Data1 = 0;
	let Data2 = 0;
	for (let i = 0; i < N + 2; i += 2) {
		const res = BlowFish_Encrypt(ctx, Data1, Data2);
		Data1 = res.left;
		Data2 = res.right;
		pbox[i] = Data1;
		pbox[i + 1] = Data2;
	}
	for (let i = 0; i < 4; i++) {
		const sbox = ctx.sbox[i];
		for (let j = 0; j < 256; j += 2) {
			const res = BlowFish_Encrypt(ctx, Data1, Data2);
			Data1 = res.left;
			Data2 = res.right;
			sbox[j] = Data1;
			sbox[j + 1] = Data2;
		}
	}
	return true;
};

/**
 * Blowfish block cipher algorithm.
 */
class Blowfish extends BlockCipher {
	static blockSize = 64 / 32;
	static keySize = 128 / 32;
	static ivSize = 64 / 32;
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.blockSize = Blowfish.blockSize;
		this.keySize = Blowfish.keySize;
		this.ivSize = Blowfish.ivSize;
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.reset();
	}
	_doReset() {
		super._doReset();
		if (this._keyPriorReset === this._key) return; // Skip reset of nRounds has been set before and key did not change
		const key = this._key; // Shortcuts
		this._keyPriorReset = key;
		const keyWords = key.words; // Shortcuts
		const keySize = key.sigBytes / 4; // Shortcuts
		BlowFishInit(BLOWFISH_CTX, keyWords, keySize); //Initialization pbox and sbox
	}

	encryptBlock(M, offset) {
		const res = BlowFish_Encrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
		M[offset] = res.left;
		M[offset + 1] = res.right;
	}

	decryptBlock(M, offset) {
		const res = BlowFish_Decrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
		M[offset] = res.left;
		M[offset + 1] = res.right;
	}
}

/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     const ciphertext = CryptoJS.Blowfish.encrypt(message, key, cfg);
 *     const plaintext  = CryptoJS.Blowfish.decrypt(ciphertext, key, cfg);
 */
C.Blowfish = BlockCipher._createHelper(Blowfish);

/**
 * UTF-16 BE encoding strategy.
 */
class Utf16BE {
	/**
	 * Converts a word array to a UTF-16 BE string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @return {string} The UTF-16 BE string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
	 */
	static stringify = wordArray => {
		const words = wordArray.words; // Shortcuts
		const sigBytes = wordArray.sigBytes; // Shortcuts
		const utf16Chars = []; // Convert
		for (let i = 0; i < sigBytes; i += 2)
			utf16Chars.push(String.fromCharCode((words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff));
		return utf16Chars.join('');
	};

	/**
	 * Converts a UTF-16 BE string to a word array.
	 *
	 * @param {string} utf16Str The UTF-16 BE string.
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const wordArray = CryptoJS.enc.Utf16.parse(utf16String);
	 */
	static parse = utf16Str => {
		const utf16StrLength = utf16Str.length; // Shortcut
		const words = []; // Convert
		for (let i = 0; i < utf16StrLength; i++) words[i >>> 1] |= utf16Str.charCodeAt(i) << (16 - (i % 2) * 16);
		return new WordArray(words, utf16StrLength * 2);
	};
}
/**
 * UTF-16 LE encoding strategy.
 */
class Utf16LE {
	/**
	 * Converts a word array to a UTF-16 LE string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @return {string} The UTF-16 LE string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
	 */
	static stringify = wordArray => {
		const words = wordArray.words; // Shortcuts
		const sigBytes = wordArray.sigBytes; // Shortcuts
		const utf16Chars = []; // Convert
		for (let i = 0; i < sigBytes; i += 2) {
			const codePoint = swapEndian((words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff);
			utf16Chars.push(String.fromCharCode(codePoint));
		}

		return utf16Chars.join('');
	};

	/**
	 * Converts a UTF-16 LE string to a word array.
	 *
	 * @param {string} utf16Str The UTF-16 LE string.
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
	 */
	static parse = utf16Str => {
		const utf16StrLength = utf16Str.length; // Shortcut
		const words = []; // Convert
		for (let i = 0; i < utf16StrLength; i++)
			words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << (16 - (i % 2) * 16));
		return new WordArray(words, utf16StrLength * 2);
	};
}
const swapEndian = word => ((word << 8) & 0xff00ff00) | ((word >>> 8) & 0x00ff00ff);
class HexFormatter {
	/**
	 * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
	 *
	 * @param {CipherParams} cipherParams The cipher params object.
	 *
	 * @return {string} The hexadecimally encoded string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const hexString = CryptoJS.format.Hex.stringify(cipherParams);
	 */
	static stringify = cipherParams => cipherParams.ciphertext.toString(Hex);

	/**
	 * Converts a hexadecimally encoded ciphertext string to a cipher params object.
	 *
	 * @param {string} input The hexadecimally encoded string.
	 *
	 * @return {CipherParams} The cipher params object.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const cipherParams = CryptoJS.format.Hex.parse(hexString);
	 */
	static parse = input => new CipherParams({ ciphertext: Hex.parse(input) });
}
// Constants table
const T = [];

// Compute constants
for (let i = 0; i < 64; i++) T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;

/**
 * MD5 hash algorithm.
 */
class MD5 extends Hasher {
	constructor(cfg) {
		super(cfg);
	}
	_doReset() {
		this._hash = new WordArray([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476]);
	}

	_doProcessBlock(M, offset) {
		// Swap endian
		for (let i = 0; i < 16; i++) {
			const offset_i = offset + i; // Shortcuts
			const M_offset_i = M[offset_i]; // Shortcuts

			M[offset_i] =
				(((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) |
				(((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00);
		}

		const H = this._hash.words; // Shortcuts

		const M_offset_0 = M[offset + 0];
		const M_offset_1 = M[offset + 1];
		const M_offset_2 = M[offset + 2];
		const M_offset_3 = M[offset + 3];
		const M_offset_4 = M[offset + 4];
		const M_offset_5 = M[offset + 5];
		const M_offset_6 = M[offset + 6];
		const M_offset_7 = M[offset + 7];
		const M_offset_8 = M[offset + 8];
		const M_offset_9 = M[offset + 9];
		const M_offset_10 = M[offset + 10];
		const M_offset_11 = M[offset + 11];
		const M_offset_12 = M[offset + 12];
		const M_offset_13 = M[offset + 13];
		const M_offset_14 = M[offset + 14];
		const M_offset_15 = M[offset + 15];

		// Working variables
		let a = H[0];
		let b = H[1];
		let c = H[2];
		let d = H[3];

		// Computation
		a = FF(a, b, c, d, M_offset_0, 7, T[0]);
		d = FF(d, a, b, c, M_offset_1, 12, T[1]);
		c = FF(c, d, a, b, M_offset_2, 17, T[2]);
		b = FF(b, c, d, a, M_offset_3, 22, T[3]);
		a = FF(a, b, c, d, M_offset_4, 7, T[4]);
		d = FF(d, a, b, c, M_offset_5, 12, T[5]);
		c = FF(c, d, a, b, M_offset_6, 17, T[6]);
		b = FF(b, c, d, a, M_offset_7, 22, T[7]);
		a = FF(a, b, c, d, M_offset_8, 7, T[8]);
		d = FF(d, a, b, c, M_offset_9, 12, T[9]);
		c = FF(c, d, a, b, M_offset_10, 17, T[10]);
		b = FF(b, c, d, a, M_offset_11, 22, T[11]);
		a = FF(a, b, c, d, M_offset_12, 7, T[12]);
		d = FF(d, a, b, c, M_offset_13, 12, T[13]);
		c = FF(c, d, a, b, M_offset_14, 17, T[14]);
		b = FF(b, c, d, a, M_offset_15, 22, T[15]);

		a = GG(a, b, c, d, M_offset_1, 5, T[16]);
		d = GG(d, a, b, c, M_offset_6, 9, T[17]);
		c = GG(c, d, a, b, M_offset_11, 14, T[18]);
		b = GG(b, c, d, a, M_offset_0, 20, T[19]);
		a = GG(a, b, c, d, M_offset_5, 5, T[20]);
		d = GG(d, a, b, c, M_offset_10, 9, T[21]);
		c = GG(c, d, a, b, M_offset_15, 14, T[22]);
		b = GG(b, c, d, a, M_offset_4, 20, T[23]);
		a = GG(a, b, c, d, M_offset_9, 5, T[24]);
		d = GG(d, a, b, c, M_offset_14, 9, T[25]);
		c = GG(c, d, a, b, M_offset_3, 14, T[26]);
		b = GG(b, c, d, a, M_offset_8, 20, T[27]);
		a = GG(a, b, c, d, M_offset_13, 5, T[28]);
		d = GG(d, a, b, c, M_offset_2, 9, T[29]);
		c = GG(c, d, a, b, M_offset_7, 14, T[30]);
		b = GG(b, c, d, a, M_offset_12, 20, T[31]);

		a = HH(a, b, c, d, M_offset_5, 4, T[32]);
		d = HH(d, a, b, c, M_offset_8, 11, T[33]);
		c = HH(c, d, a, b, M_offset_11, 16, T[34]);
		b = HH(b, c, d, a, M_offset_14, 23, T[35]);
		a = HH(a, b, c, d, M_offset_1, 4, T[36]);
		d = HH(d, a, b, c, M_offset_4, 11, T[37]);
		c = HH(c, d, a, b, M_offset_7, 16, T[38]);
		b = HH(b, c, d, a, M_offset_10, 23, T[39]);
		a = HH(a, b, c, d, M_offset_13, 4, T[40]);
		d = HH(d, a, b, c, M_offset_0, 11, T[41]);
		c = HH(c, d, a, b, M_offset_3, 16, T[42]);
		b = HH(b, c, d, a, M_offset_6, 23, T[43]);
		a = HH(a, b, c, d, M_offset_9, 4, T[44]);
		d = HH(d, a, b, c, M_offset_12, 11, T[45]);
		c = HH(c, d, a, b, M_offset_15, 16, T[46]);
		b = HH(b, c, d, a, M_offset_2, 23, T[47]);

		a = II(a, b, c, d, M_offset_0, 6, T[48]);
		d = II(d, a, b, c, M_offset_7, 10, T[49]);
		c = II(c, d, a, b, M_offset_14, 15, T[50]);
		b = II(b, c, d, a, M_offset_5, 21, T[51]);
		a = II(a, b, c, d, M_offset_12, 6, T[52]);
		d = II(d, a, b, c, M_offset_3, 10, T[53]);
		c = II(c, d, a, b, M_offset_10, 15, T[54]);
		b = II(b, c, d, a, M_offset_1, 21, T[55]);
		a = II(a, b, c, d, M_offset_8, 6, T[56]);
		d = II(d, a, b, c, M_offset_15, 10, T[57]);
		c = II(c, d, a, b, M_offset_6, 15, T[58]);
		b = II(b, c, d, a, M_offset_13, 21, T[59]);
		a = II(a, b, c, d, M_offset_4, 6, T[60]);
		d = II(d, a, b, c, M_offset_11, 10, T[61]);
		c = II(c, d, a, b, M_offset_2, 15, T[62]);
		b = II(b, c, d, a, M_offset_9, 21, T[63]);

		// Intermediate hash value
		H[0] = (H[0] + a) | 0;
		H[1] = (H[1] + b) | 0;
		H[2] = (H[2] + c) | 0;
		H[3] = (H[3] + d) | 0;
	}

	_doFinalize() {
		const data = this._data; // Shortcuts
		const dataWords = data.words; // Shortcuts
		const nBitsTotal = this._nDataBytes * 8;
		const nBitsLeft = data.sigBytes * 8;
		dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32)); // Add padding
		const nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
		const nBitsTotalL = nBitsTotal;
		dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] =
			(((nBitsTotalH << 8) | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
			(((nBitsTotalH << 24) | (nBitsTotalH >>> 8)) & 0xff00ff00);
		dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] =
			(((nBitsTotalL << 8) | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
			(((nBitsTotalL << 24) | (nBitsTotalL >>> 8)) & 0xff00ff00);
		data.sigBytes = (dataWords.length + 1) * 4;
		this._process(); // Hash final blocks
		const hash = this._hash; // Shortcuts
		const H = hash.words; // Shortcuts
		// Swap endian
		for (let i = 0; i < 4; i++) {
			const H_i = H[i]; // Shortcut
			H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) | (((H_i << 24) | (H_i >>> 8)) & 0xff00ff00);
		}
		return hash; // Return final computed hash
	}

	clone() {
		const clonedOne = super.clone();
		clonedOne._hash = this._hash.clone();
		return clonedOne;
	}
}

const FF = (a, b, c, d, x, s, t) => {
	const n = a + ((b & c) | (~b & d)) + x + t;
	return ((n << s) | (n >>> (32 - s))) + b;
};

const GG = (a, b, c, d, x, s, t) => {
	const n = a + ((b & d) | (c & ~d)) + x + t;
	return ((n << s) | (n >>> (32 - s))) + b;
};

const HH = (a, b, c, d, x, s, t) => {
	const n = a + (b ^ c ^ d) + x + t;
	return ((n << s) | (n >>> (32 - s))) + b;
};

const II = (a, b, c, d, x, s, t) => {
	const n = a + (c ^ (b | ~d)) + x + t;
	return ((n << s) | (n >>> (32 - s))) + b;
};
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
 *     const hash = CryptoJS.MD5('message');
 *     const hash = CryptoJS.MD5(wordArray);
 */
C.MD5 = Hasher._createHelper(MD5);

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
 *     const hmac = CryptoJS.HmacMD5(message, key);
 */
const HmacMD5 = Hasher._createHmacHelper(MD5);
C.HmacMD5 = HmacMD5;
/**
 * Cipher Feedback block mode.
 */

const generateKeystreamAndEncrypt = (self, words, offset, blockSize, cipher) => {
	const iv = self._iv; // Shortcut
	const keystream = iv ? iv.slice(0) : self._prevBlock; // Generate keystream
	if (iv) self._iv = undefined; // Remove IV for subsequent blocks
	cipher.encryptBlock(keystream, 0);
	for (let i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i]; // Encrypt
};
class CFB extends BlockCipherMode {
	constructor(cipher, iv) {
		super(cipher, iv);
		this._prevBlock = iv ? iv.slice(0) : []; // Remember previous block
	}
}
class DecryptorCFB extends CFB {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		const cipher = this._cipher; // Shortcuts
		const blockSize = cipher.blockSize; // Shortcuts
		const thisBlock = words.slice(offset, offset + blockSize); // Remember this block to use with next block
		generateKeystreamAndEncrypt(this, words, offset, blockSize, cipher);
		this._prevBlock = thisBlock; // This block becomes the previous block
	}
}
class EncryptorCFB extends CFB {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		const cipher = this._cipher; // Shortcuts
		const blockSize = cipher.blockSize; // Shortcuts
		generateKeystreamAndEncrypt(this, words, offset, blockSize, cipher);
		this._prevBlock = words.slice(offset, offset + blockSize); // Remember this block to use with next block
	}
}
CFB.Encryptor = EncryptorCFB;

CFB.Decryptor = DecryptorCFB;
/** @preserve
 * Counter block mode compatible with  Dr Brian Gladman fileenc.c
 * derived from CryptoJS.mode.CTR
 * Jan Hruby jhruby.web@gmail.com
 */

const incWord = word => {
	if (((word >> 24) & 0xff) === 0xff) {
		//overflow
		let b1 = (word >> 16) & 0xff;
		let b2 = (word >> 8) & 0xff;
		let b3 = word & 0xff;
		if (b1 === 0xff) {
			b1 = 0; // overflow b1
			if (b2 === 0xff) {
				b2 = 0;
				if (b3 === 0xff) b3 = 0;
				else ++b3;
			} else ++b2;
		} else ++b1;
		word = 0;
		word += b1 << 16;
		word += b2 << 8;
		word += b3;
	} else word += 0x01 << 24;
	return word;
};

const incCounter = counter => {
	if ((counter[0] = incWord(counter[0])) === 0) counter[1] = incWord(counter[1]); // encr_data in fileenc.c from  Dr Brian Gladman's counts only with DWORD j < 8
	return counter;
};
class CTRGladman extends BlockCipherMode {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
}

class EncryptorCTRGladman extends CTRGladman {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		const cipher = this._cipher; // Shortcuts
		const blockSize = cipher.blockSize; // Shortcuts
		const iv = this._iv; // Shortcuts
		const counter = iv ? (this._counter = iv.slice(0)) : this._counter; // Generate keystream// encr_data in fileenc.c from  Dr Brian Gladman's counts only with DWORD j < 8
		if (iv) this._iv = undefined; // Remove IV for subsequent blocks
		incCounter(counter);
		const keystream = counter.slice(0);
		cipher.encryptBlock(keystream, 0);
		for (let i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i]; // Encrypt
	}
}

CTRGladman.Encryptor = EncryptorCTRGladman;
CTRGladman.Decryptor = EncryptorCTRGladman;

/** Counter block mode.  */

class CTR extends BlockCipherMode {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
}

class EncryptorCTR extends CTR {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		const cipher = this._cipher; // Shortcuts
		const blockSize = cipher.blockSize; // Shortcuts
		const iv = this._iv; // Shortcuts
		const counter = iv ? iv.slice(0) : this._counter; // Generate keystream
		this._counter = counter;
		if (iv) this._iv = undefined; // Remove IV for subsequent blocks
		const keystream = counter.slice(0);
		cipher.encryptBlock(keystream, 0);
		counter[blockSize - 1] = (counter[blockSize - 1] + 1) | 0; // Increment counter
		for (let i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i]; // Encrypt
	}
}
CTR.Encryptor = EncryptorCTR;
CTR.Decryptor = EncryptorCTR;

/**Electronic Codebook block mode. */

class ECB extends BlockCipherMode {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
}

class EncryptorECB extends ECB {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		this._cipher.encryptBlock(words, offset);
	}
}
class DecryptorECB extends ECB {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		this._cipher.decryptBlock(words, offset);
	}
}
ECB.Encryptor = EncryptorECB;
ECB.Decryptor = DecryptorECB;

/** Output Feedback block mode.  */

class OFB extends BlockCipherMode {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	static Decryptor = null;
}
class EncryptorOFB extends OFB {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		const cipher = this._cipher; // Shortcuts
		const blockSize = cipher.blockSize; // Shortcuts
		const iv = this._iv; // Shortcuts
		const keystream = iv ? iv.slice(0) : this._keystream; // Generate keystream
		this._keystream = keystream;
		if (iv) this._iv = undefined; // Remove IV for subsequent blocks
		cipher.encryptBlock(keystream, 0);
		for (let i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i]; // Encrypt
	}
}
OFB.Encryptor = EncryptorOFB;
OFB.Decryptor = EncryptorOFB;
/** ANSI X.923 padding strategy. */
class AnsiX923 {
	static pad = (data, blockSize) => {
		const dataSigBytes = data.sigBytes; // Shortcuts
		const blockSizeBytes = blockSize * 4; // Shortcuts
		const nPaddingBytes = blockSizeBytes - (dataSigBytes % blockSizeBytes); // Count padding bytes
		const lastBytePos = dataSigBytes + nPaddingBytes - 1; // Compute last byte position
		data.clamp(); // Pad
		data.words[lastBytePos >>> 2] |= nPaddingBytes << (24 - (lastBytePos % 4) * 8);
		data.sigBytes += nPaddingBytes;
	};

	static unpad = data => {
		const nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff; // Get number of padding bytes from last byte
		data.sigBytes -= nPaddingBytes; // Remove padding
	};
}

/** ISO 10126 padding strategy.  */
class Iso10126 {
	static pad = (data, blockSize) => {
		const blockSizeBytes = blockSize * 4; // Shortcut
		const nPaddingBytes = blockSizeBytes - (data.sigBytes % blockSizeBytes); // Count padding bytes
		data.concat(WordArray.random(nPaddingBytes - 1)).concat(
			new WordArray([nPaddingBytes << 24], 1) // Pad
		);
	};

	static unpad = data => {
		const nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff; // Get number of padding bytes from last byte
		data.sigBytes -= nPaddingBytes; // Remove padding
	};
}
/** Zero padding strategy.  */
class ZeroPadding {
	static pad = (data, blockSize) => {
		const blockSizeBytes = blockSize * 4; // Shortcut
		data.clamp(); // Pad
		data.sigBytes += blockSizeBytes - (data.sigBytes % blockSizeBytes || blockSizeBytes);
	};

	static unpad = data => {
		const dataWords = data.words; // Shortcut
		// Unpad
		for (let i = data.sigBytes - 1; i >= 0; i--)
			if ((dataWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff) {
				data.sigBytes = i + 1;
				break;
			}
	};
}

/**ISO/IEC 9797-1 Padding Method 2. */
class Iso97971 {
	static initArray = [0x80000000];
	static pad = (data, blockSize) => {
		data.concat(new WordArray(Iso97971.initArray, 1)); // Add 0x80 byte
		ZeroPadding.pad(data, blockSize); // Zero pad the rest
	};

	static unpad = data => {
		ZeroPadding.unpad(data); // Remove zero padding
		data.sigBytes--; // Remove one more byte -- the 0x80 byte
	};
}
/** A noop padding strategy. */
class NoPadding {
	static pad = () => {};
	static unpad = () => {};
}

// Initialization and round constants tables
const H = [],
	K = [];

// Compute constants
const isPrime = n => {
	const sqrtN = Math.sqrt(n);
	for (let factor = 2; factor <= sqrtN; factor++) if (!(n % factor)) return false;
	return true;
};
const getFractionalBits = n => ((n - (n | 0)) * 0x100000000) | 0;
let n = 2;
let nPrime = 0;
while (nPrime < 64) {
	if (isPrime(n)) {
		if (nPrime < 8) H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
		K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));
		nPrime++;
	}
	n++;
}

// Reusable object
const W = [];

/**SHA-256 hash algorithm. */
class SHA256 extends Hasher {
	constructor(cfg) {
		super(cfg);
	}
	_doReset() {
		this._hash = new WordArray(H.slice(0));
	}

	_doProcessBlock(M, offset) {
		const H = this._hash.words; // Shortcut
		let [a, b, c, d, e, f, g, h] = H; // Working variables

		// Computation
		for (let i = 0; i < 16; i++) {
			W[i] = M[offset + i] | 0;
			const ch = (e & f) ^ (~e & g);
			const maj = (a & b) ^ (a & c) ^ (b & c);
			const sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
			const sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7) | (e >>> 25));
			const t1 = h + sigma1 + ch + K[i] + W[i];
			const t2 = sigma0 + maj;
			h = g;
			g = f;
			f = e;
			e = (d + t1) | 0;
			d = c;
			c = b;
			b = a;
			a = (t1 + t2) | 0;
		}
		for (let i = 16; i < 64; i++) {
			const gamma0x = W[i - 15];
			const gamma0 = ((gamma0x << 25) | (gamma0x >>> 7)) ^ ((gamma0x << 14) | (gamma0x >>> 18)) ^ (gamma0x >>> 3);
			const gamma1x = W[i - 2];
			const gamma1 =
				((gamma1x << 15) | (gamma1x >>> 17)) ^ ((gamma1x << 13) | (gamma1x >>> 19)) ^ (gamma1x >>> 10);
			W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];

			const ch = (e & f) ^ (~e & g);
			const maj = (a & b) ^ (a & c) ^ (b & c);
			const sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
			const sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7) | (e >>> 25));
			const t1 = h + sigma1 + ch + K[i] + W[i];
			const t2 = sigma0 + maj;
			h = g;
			g = f;
			f = e;
			e = (d + t1) | 0;
			d = c;
			c = b;
			b = a;
			a = (t1 + t2) | 0;
		}
		// Intermediate hash value
		H[0] = (H[0] + a) | 0;
		H[1] = (H[1] + b) | 0;
		H[2] = (H[2] + c) | 0;
		H[3] = (H[3] + d) | 0;
		H[4] = (H[4] + e) | 0;
		H[5] = (H[5] + f) | 0;
		H[6] = (H[6] + g) | 0;
		H[7] = (H[7] + h) | 0;
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
		const clonedOne = super.clone();
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
 *     const hash = CryptoJS.SHA256('message');
 *     const hash = CryptoJS.SHA256(wordArray);
 */
C.SHA256 = Hasher._createHelper(SHA256);

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
 *     const hmac = CryptoJS.HmacSHA256(message, key);
 */
C.HmacSHA256 = Hasher._createHmacHelper(SHA256);

/** Password-Based Key Derivation Function 2 algorithm. ----------------------------------------- */
class PBKDF2 extends Base {
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

// Reusable objects
const S = [];
const C_ = [];
const G = [];

/**
 * Rabbit stream cipher algorithm.
 *
 * This is a legacy version that neglected to convert the key to little-endian.
 * This error doesn't affect the cipher's security,
 * but it does affect its compatibility with other implementations.
 */
class RabbitLegacy extends StreamCipher {
	static blockSize = 128 / 32;
	static ivSize = 64 / 32;
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.blockSize = RabbitLegacy.blockSize;
		this.ivSize = RabbitLegacy.ivSize;
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
		this.reset();
	}
	_doReset() {
		const K = this._key.words; // Shortcuts
		const iv = this.cfg.iv; // Shortcuts

		// Generate initial state values
		const X = [
			K[0],
			(K[3] << 16) | (K[2] >>> 16),
			K[1],
			(K[0] << 16) | (K[3] >>> 16),
			K[2],
			(K[1] << 16) | (K[0] >>> 16),
			K[3],
			(K[2] << 16) | (K[1] >>> 16),
		];
		this._X = X;

		// Generate initial counter values
		const C = [
			(K[2] << 16) | (K[2] >>> 16),
			(K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
			(K[3] << 16) | (K[3] >>> 16),
			(K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
			(K[0] << 16) | (K[0] >>> 16),
			(K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
			(K[1] << 16) | (K[1] >>> 16),
			(K[3] & 0xffff0000) | (K[0] & 0x0000ffff),
		];
		this._C = C;
		this._b = 0; // Carry bit
		for (let i = 0; i < 4; i++) this.nextState(); // Iterate the system four times
		for (let i = 0; i < 8; i++) C[i] ^= X[(i + 4) & 7]; // Modify the counters
		// IV setup
		if (iv) {
			const IV = iv.words; // Shortcuts
			const IV_0 = IV[0]; // Shortcuts
			const IV_1 = IV[1]; // Shortcuts

			// Generate four subvectors
			const i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
			const i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
			const i1 = (i0 >>> 16) | (i2 & 0xffff0000);
			const i3 = (i2 << 16) | (i0 & 0x0000ffff);

			// Modify counter values
			C[0] ^= i0;
			C[1] ^= i1;
			C[2] ^= i2;
			C[3] ^= i3;
			C[4] ^= i0;
			C[5] ^= i1;
			C[6] ^= i2;
			C[7] ^= i3;

			for (let i = 0; i < 4; i++) this.nextState(); // Iterate the system four times
		}
	}

	_doProcessBlock(M, offset) {
		const X = this._X; // Shortcut
		this.nextState(); // Iterate the system
		S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16); // Generate four keystream words
		S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16); // Generate four keystream words
		S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16); // Generate four keystream words
		S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16); // Generate four keystream words
		for (let i = 0; i < 4; i++) {
			S[i] = (((S[i] << 8) | (S[i] >>> 24)) & 0x00ff00ff) | (((S[i] << 24) | (S[i] >>> 8)) & 0xff00ff00); // Swap endian
			M[offset + i] ^= S[i]; // Encrypt
		}
	}
	nextState() {
		const X = this._X; // Shortcuts
		const C = this._C; // Shortcuts
		for (let i = 0; i < 8; i++) C_[i] = C[i]; // Save old counter values
		// Calculate new counter values
		C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
		C[1] = (C[1] + 0xd34d34d3 + (C[0] >>> 0 < C_[0] >>> 0 ? 1 : 0)) | 0;
		C[2] = (C[2] + 0x34d34d34 + (C[1] >>> 0 < C_[1] >>> 0 ? 1 : 0)) | 0;
		C[3] = (C[3] + 0x4d34d34d + (C[2] >>> 0 < C_[2] >>> 0 ? 1 : 0)) | 0;
		C[4] = (C[4] + 0xd34d34d3 + (C[3] >>> 0 < C_[3] >>> 0 ? 1 : 0)) | 0;
		C[5] = (C[5] + 0x34d34d34 + (C[4] >>> 0 < C_[4] >>> 0 ? 1 : 0)) | 0;
		C[6] = (C[6] + 0x4d34d34d + (C[5] >>> 0 < C_[5] >>> 0 ? 1 : 0)) | 0;
		C[7] = (C[7] + 0xd34d34d3 + (C[6] >>> 0 < C_[6] >>> 0 ? 1 : 0)) | 0;
		this._b = C[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;

		// Calculate the g-values
		for (let i = 0; i < 8; i++) {
			const gx = X[i] + C[i];
			const ga = gx & 0xffff; // Construct high and low argument for squaring
			const gb = gx >>> 16; // Construct high and low argument for squaring
			const gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb; // Calculate high and low result of squaring
			const gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0); // Calculate high and low result of squaring
			G[i] = gh ^ gl; // High XOR low
		}

		// Calculate new state values
		X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
		X[1] = (G[1] + ((G[0] << 8) | (G[0] >>> 24)) + G[7]) | 0;
		X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
		X[3] = (G[3] + ((G[2] << 8) | (G[2] >>> 24)) + G[1]) | 0;
		X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
		X[5] = (G[5] + ((G[4] << 8) | (G[4] >>> 24)) + G[3]) | 0;
		X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
		X[7] = (G[7] + ((G[6] << 8) | (G[6] >>> 24)) + G[5]) | 0;
	}
}

/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     const ciphertext = CryptoJS.RabbitLegacy.encrypt(message, key, cfg);
 *     const plaintext  = CryptoJS.RabbitLegacy.decrypt(ciphertext, key, cfg);
 */
C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy);
/**
 * Rabbit stream cipher algorithm
 */
class Rabbit extends StreamCipher {
	static blockSize = 128 / 32;
	static ivSize = 64 / 32;
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.blockSize = Rabbit.blockSize;
		this.ivSize = Rabbit.ivSize;
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
		this.reset();
	}
	_doReset() {
		const K = this._key.words; // ShortcutsC_algo.Rabbit =
		const iv = this.cfg.iv; // ShortcutsC_algo.Rabbit =
		for (let i = 0; i < 4; i++)
			K[i] = (((K[i] << 8) | (K[i] >>> 24)) & 0x00ff00ff) | (((K[i] << 24) | (K[i] >>> 8)) & 0xff00ff00); // Swap endian
		// Generate initial state values
		const X = [
			K[0],
			(K[3] << 16) | (K[2] >>> 16),
			K[1],
			(K[0] << 16) | (K[3] >>> 16),
			K[2],
			(K[1] << 16) | (K[0] >>> 16),
			K[3],
			(K[2] << 16) | (K[1] >>> 16),
		];
		this._X = X;
		// Generate initial counter values
		const C = [
			(K[2] << 16) | (K[2] >>> 16),
			(K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
			(K[3] << 16) | (K[3] >>> 16),
			(K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
			(K[0] << 16) | (K[0] >>> 16),
			(K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
			(K[1] << 16) | (K[1] >>> 16),
			(K[3] & 0xffff0000) | (K[0] & 0x0000ffff),
		];
		this._C = C;
		this._b = 0; // Carry bit
		for (let i = 0; i < 4; i++) this.nextState(); // Iterate the system four times
		for (let i = 0; i < 8; i++) C[i] ^= X[(i + 4) & 7]; // Modify the counters
		// IV setup
		if (iv) {
			const IV = iv.words; // Shortcuts
			const IV_0 = IV[0]; // Shortcuts
			const IV_1 = IV[1]; // Shortcuts
			const i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00); // Generate four subvectors
			const i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00); // Generate four subvectors
			const i1 = (i0 >>> 16) | (i2 & 0xffff0000); // Generate four subvectors
			const i3 = (i2 << 16) | (i0 & 0x0000ffff); // Generate four subvectors

			// Modify counter values
			C[0] ^= i0;
			C[1] ^= i1;
			C[2] ^= i2;
			C[3] ^= i3;
			C[4] ^= i0;
			C[5] ^= i1;
			C[6] ^= i2;
			C[7] ^= i3;
			for (let i = 0; i < 4; i++) this.nextState(); // Iterate the system four times
		}
	}

	_doProcessBlock(M, offset) {
		const X = this._X; // Shortcut
		this.nextState(); // Iterate the system
		S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16); // Generate four keystream words
		S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16); // Generate four keystream words
		S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16); // Generate four keystream words
		S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16); // Generate four keystream words
		for (let i = 0; i < 4; i++) {
			S[i] = (((S[i] << 8) | (S[i] >>> 24)) & 0x00ff00ff) | (((S[i] << 24) | (S[i] >>> 8)) & 0xff00ff00); // Swap endian
			M[offset + i] ^= S[i]; // Encrypt
		}
	}
	nextState() {
		const X = this._X; // Shortcuts
		const C = this._C; // Shortcuts
		for (let i = 0; i < 8; i++) C_[i] = C[i]; // Save old counter values
		// Calculate new counter values
		C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
		C[1] = (C[1] + 0xd34d34d3 + (C[0] >>> 0 < C_[0] >>> 0 ? 1 : 0)) | 0;
		C[2] = (C[2] + 0x34d34d34 + (C[1] >>> 0 < C_[1] >>> 0 ? 1 : 0)) | 0;
		C[3] = (C[3] + 0x4d34d34d + (C[2] >>> 0 < C_[2] >>> 0 ? 1 : 0)) | 0;
		C[4] = (C[4] + 0xd34d34d3 + (C[3] >>> 0 < C_[3] >>> 0 ? 1 : 0)) | 0;
		C[5] = (C[5] + 0x34d34d34 + (C[4] >>> 0 < C_[4] >>> 0 ? 1 : 0)) | 0;
		C[6] = (C[6] + 0x4d34d34d + (C[5] >>> 0 < C_[5] >>> 0 ? 1 : 0)) | 0;
		C[7] = (C[7] + 0xd34d34d3 + (C[6] >>> 0 < C_[6] >>> 0 ? 1 : 0)) | 0;
		this._b = C[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;
		// Calculate the g-values
		for (let i = 0; i < 8; i++) {
			const gx = X[i] + C[i];
			const ga = gx & 0xffff; // Construct high and low argument for squaring
			const gb = gx >>> 16; // Construct high and low argument for squaring
			const gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb; // Calculate high and low result of squaring
			const gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0); // Calculate high and low result of squaring
			G[i] = gh ^ gl; // High XOR low
		}
		// Calculate new state values
		X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
		X[1] = (G[1] + ((G[0] << 8) | (G[0] >>> 24)) + G[7]) | 0;
		X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
		X[3] = (G[3] + ((G[2] << 8) | (G[2] >>> 24)) + G[1]) | 0;
		X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
		X[5] = (G[5] + ((G[4] << 8) | (G[4] >>> 24)) + G[3]) | 0;
		X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
		X[7] = (G[7] + ((G[6] << 8) | (G[6] >>> 24)) + G[5]) | 0;
	}
}

/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     const ciphertext = CryptoJS.Rabbit.encrypt(message, key, cfg);
 *     const plaintext  = CryptoJS.Rabbit.decrypt(ciphertext, key, cfg);
 */
C.Rabbit = StreamCipher._createHelper(Rabbit);
/** RC4 stream cipher algorithm. ------------------------------------------------------------- */
class RC4 extends StreamCipher {
	static keySize = 256 / 32;
	static ivSize = 0;
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.keySize = RC4.keySize;
		this.ivSize = RC4.ivSize;
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
		this.reset();
	}

	_doReset() {
		const key = this._key; // Shortcuts
		const keyWords = key.words; // Shortcuts
		const keySigBytes = key.sigBytes; // Shortcuts
		const S = []; // Init sbox
		for (let i = 0; i < 256; i++) S[i] = i;
		// Key setup
		for (let i = 0, j = 0; i < 256; i++) {
			const keyByteIndex = i % keySigBytes;
			const keyByte = (keyWords[keyByteIndex >>> 2] >>> (24 - (keyByteIndex % 4) * 8)) & 0xff;
			j = (j + S[i] + keyByte) % 256;
			const t = S[i]; // Swap
			S[i] = S[j]; // Swap
			S[j] = t; // Swap
		}
		this._S = S;
		this._i = this._j = 0; // Counters
	}

	_doProcessBlock(M, offset) {
		M[offset] ^= this.generateKeystreamWord();
	}

	generateKeystreamWord() {
		const S = this._S; // Shortcuts
		let i = this._i; // Shortcuts
		let j = this._j; // Shortcuts
		let keystreamWord = 0; // Generate keystream word
		for (let n = 0; n < 4; n++) {
			i = (i + 1) % 256;
			j = (j + S[i]) % 256;
			const t = S[i]; // Swap
			S[i] = S[j];
			S[j] = t;
			keystreamWord |= S[(S[i] + S[j]) % 256] << (24 - n * 8);
		}
		this._i = i; // Update counters
		this._j = j; // Update counters
		return keystreamWord;
	}
}

/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     const ciphertext = CryptoJS.RC4.encrypt(message, key, cfg);
 *     const plaintext  = CryptoJS.RC4.decrypt(ciphertext, key, cfg);
 */
C.RC4 = StreamCipher._createHelper(RC4);

/**Modified RC4 stream cipher algorithm.---------------------------------------------------------- */
class RC4Drop extends RC4 {
	static defaultConf = {
		drop: 192,
	};
	/**
	 * Configuration options.
	 *
	 * @property {number} drop The number of keystream words to drop. Default 192
	 */
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, RC4Drop.defaultConf);
	}
	_doReset() {
		super._doReset();
		for (let i = this.cfg.drop; i > 0; i--) this.generateKeystreamWord(); // Drop
	}
}

/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     const ciphertext = CryptoJS.RC4Drop.encrypt(message, key, cfg);
 *     const plaintext  = CryptoJS.RC4Drop.decrypt(ciphertext, key, cfg);
 */
C.RC4Drop = StreamCipher._createHelper(RC4Drop);
/** @preserve
(c) 2012 by Cédric Mesnil. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Constants table
const _zl = new WordArray([
	0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10,
	14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7,
	12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13,
]);
const _zr = new WordArray([
	5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5,
	1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4,
	1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11,
]);
const _sl = new WordArray([
	11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11,
	13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15,
	5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6,
]);
const _sr = new WordArray([
	8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9,
	7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5,
	12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11,
]);

const _hl = new WordArray([0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e]);
const _hr = new WordArray([0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000]);

/** RIPEMD160 hash algorithm.  */
class RIPEMD160 extends Hasher {
	static initArray = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
	constructor(cfg) {
		super(cfg);
	}
	_doReset() {
		this._hash = new WordArray(RIPEMD160.initArray);
	}

	_doProcessBlock(M, offset) {
		// Swap endian
		for (let i = 0; i < 16; i++) {
			const offset_i = offset + i; // Shortcuts
			const M_offset_i = M[offset_i]; // Shortcuts
			M[offset_i] =
				(((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) |
				(((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00); // Swap
		}
		// Shortcut
		const H = this._hash.words;
		const hl = _hl.words;
		const hr = _hr.words;
		const zl = _zl.words;
		const zr = _zr.words;
		const sl = _sl.words;
		const sr = _sr.words;
		let al, bl, cl, dl, el, ar, br, cr, dr, er; // Working variables
		ar = al = H[0];
		br = bl = H[1];
		cr = cl = H[2];
		dr = dl = H[3];
		er = el = H[4];
		// Computation
		let t;
		for (let i = 0; i < 80; i += 1) {
			t = (al + M[offset + zl[i]]) | 0;
			t +=
				i < 16
					? f1(bl, cl, dl) + hl[0]
					: i < 32
					? f2(bl, cl, dl) + hl[1]
					: i < 48
					? f3(bl, cl, dl) + hl[2]
					: i < 64
					? f4(bl, cl, dl) + hl[3]
					: f5(bl, cl, dl) + hl[4]; // if (i<80) {
			t = t | 0;
			t = rotl(t, sl[i]);
			t = (t + el) | 0;
			al = el;
			el = dl;
			dl = rotl(cl, 10);
			cl = bl;
			bl = t;

			t = (ar + M[offset + zr[i]]) | 0;
			t +=
				i < 16
					? f5(br, cr, dr) + hr[0]
					: i < 32
					? f4(br, cr, dr) + hr[1]
					: i < 48
					? f3(br, cr, dr) + hr[2]
					: i < 64
					? f2(br, cr, dr) + hr[3]
					: f1(br, cr, dr) + hr[4]; // if (i<80) {

			t = t | 0;
			t = rotl(t, sr[i]);
			t = (t + er) | 0;
			ar = er;
			er = dr;
			dr = rotl(cr, 10);
			cr = br;
			br = t;
		}
		t = (H[1] + cl + dr) | 0; // Intermediate hash value
		H[1] = (H[2] + dl + er) | 0;
		H[2] = (H[3] + el + ar) | 0;
		H[3] = (H[4] + al + br) | 0;
		H[4] = (H[0] + bl + cr) | 0;
		H[0] = t;
	}

	_doFinalize() {
		const data = this._data; // Shortcuts
		const dataWords = data.words; // Shortcuts
		const nBitsTotal = this._nDataBytes * 8;
		const nBitsLeft = data.sigBytes * 8;
		// Add padding
		dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32));
		dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] =
			(((nBitsTotal << 8) | (nBitsTotal >>> 24)) & 0x00ff00ff) |
			(((nBitsTotal << 24) | (nBitsTotal >>> 8)) & 0xff00ff00);
		data.sigBytes = (dataWords.length + 1) * 4;
		this._process(); // Hash final blocks
		const hash = this._hash; // Shortcuts
		const H = hash.words; // Shortcuts
		// Swap endian
		for (let i = 0; i < 5; i++) {
			const H_i = H[i]; // Shortcut
			H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) | (((H_i << 24) | (H_i >>> 8)) & 0xff00ff00); // Swap
		}
		return hash; // Return final computed hash
	}

	clone() {
		const clonedOne = this.clonel();
		clonedOne._hash = this._hash.clone();
		return clonedOne;
	}
}
const f1 = (x, y, z) => x ^ y ^ z;
const f2 = (x, y, z) => (x & y) | (~x & z);
const f3 = (x, y, z) => (x | ~y) ^ z;
const f4 = (x, y, z) => (x & z) | (y & ~z);
const f5 = (x, y, z) => x ^ (y | ~z);
const rotl = (x, n) => (x << n) | (x >>> (32 - n));

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
 *     const hash = CryptoJS.RIPEMD160('message');
 *     const hash = CryptoJS.RIPEMD160(wordArray);
 */
C.RIPEMD160 = Hasher._createHelper(RIPEMD160);

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
 *     const hmac = CryptoJS.HmacRIPEMD160(message, key);
 */
C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160);
// Reusable object
const V = [];

/**SHA-1 hash algorithm.------------------------------------------------------------------------------------- */
class SHA1 extends Hasher {
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

// Constants tables
const RHO_OFFSETS = [];
const PI_INDEXES = [];
const ROUND_CONSTANTS = [];
const U = [];

// Compute Constants
let x = 1, // Compute rho offset constants
	y = 0;
for (let t = 0; t < 24; t++) {
	RHO_OFFSETS[x + 5 * y] = (((t + 1) * (t + 2)) / 2) % 64;
	const newX = y % 5;
	const newY = (2 * x + 3 * y) % 5;
	x = newX;
	y = newY;
}
for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) PI_INDEXES[x + 5 * y] = y + ((2 * x + 3 * y) % 5) * 5; // Compute pi index constants
let LFSR = 0x01; // Compute round constants
for (let i = 0; i < 24; i++) {
	let roundConstantMsw = 0;
	let roundConstantLsw = 0;
	for (let j = 0; j < 7; j++) {
		if (LFSR & 0x01) {
			const bitPosition = (1 << j) - 1;
			if (bitPosition < 32) roundConstantLsw ^= 1 << bitPosition;
			else roundConstantMsw ^= 1 << (bitPosition - 32); /* if (bitPosition >= 32) */
		}
		// Compute next LFSR
		if (LFSR & 0x80) LFSR = (LFSR << 1) ^ 0x71; // Primitive polynomial over GF(2): x^8 + x^6 + x^5 + x^4 + 1
		else LFSR <<= 1;
	}
	ROUND_CONSTANTS[i] = new X64Word(roundConstantMsw, roundConstantLsw);
}
for (let i = 0; i < 25; i++) U[i] = new X64Word(); // Reusable objects for temporary values

/**
 * SHA-3 hash algorithm.
 */
class SHA3 extends Hasher {
	static defaultConf = {
		outputLength: 512,
	};
	/**
	 * Configuration options.
	 *
	 * @property {number} outputLength
	 *   The desired number of bits in the output hash.
	 *   Only values permitted are: 224, 256, 384, 512.
	 *   Default: 512
	 */
	constructor(cfg = SHA3.defaultConf) {
		super(cfg);
	}

	_doReset() {
		const state = (this._state = []);
		for (let i = 0; i < 25; i++) state[i] = new X64Word();
		this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
	}

	_doProcessBlock(M, offset) {
		const state = this._state; // Shortcuts
		const nBlockSizeLanes = this.blockSize / 2; // Shortcuts
		// Absorb
		for (let i = 0; i < nBlockSizeLanes; i++) {
			let M2i = M[offset + 2 * i]; // Shortcuts
			let M2i1 = M[offset + 2 * i + 1]; // Shortcuts
			M2i = (((M2i << 8) | (M2i >>> 24)) & 0x00ff00ff) | (((M2i << 24) | (M2i >>> 8)) & 0xff00ff00); // Swap endian
			M2i1 = (((M2i1 << 8) | (M2i1 >>> 24)) & 0x00ff00ff) | (((M2i1 << 24) | (M2i1 >>> 8)) & 0xff00ff00); // Swap endian
			const lane = state[i]; // Absorb message into state
			lane.high ^= M2i1;
			lane.low ^= M2i;
		}
		// Rounds
		for (let round = 0; round < 24; round++) {
			// Theta
			for (let x = 0; x < 5; x++) {
				// Mix column lanes
				let tMsw = 0,
					tLsw = 0;
				for (let y = 0; y < 5; y++) {
					const lane = state[x + 5 * y];
					tMsw ^= lane.high;
					tLsw ^= lane.low;
				}
				// Temporary values
				const Tx = U[x];
				Tx.high = tMsw;
				Tx.low = tLsw;
			}
			for (let x = 0; x < 5; x++) {
				const Tx4 = U[(x + 4) % 5]; // Shortcuts
				const Tx1 = U[(x + 1) % 5]; // Shortcuts
				const Tx1Msw = Tx1.high; // Shortcuts
				const Tx1Lsw = Tx1.low; // Shortcuts
				// Mix surrounding columns
				const tMsw = Tx4.high ^ ((Tx1Msw << 1) | (Tx1Lsw >>> 31));
				const tLsw = Tx4.low ^ ((Tx1Lsw << 1) | (Tx1Msw >>> 31));
				for (let y = 0; y < 5; y++) {
					const lane = state[x + 5 * y];
					lane.high ^= tMsw;
					lane.low ^= tLsw;
				}
			}
			// Rho Pi
			for (let laneIndex = 1; laneIndex < 25; laneIndex++) {
				let tMsw;
				let tLsw;
				const lane = state[laneIndex]; // Shortcuts
				let laneMsw = lane.high; // Shortcuts
				let laneLsw = lane.low; // Shortcuts
				const rhoOffset = RHO_OFFSETS[laneIndex]; // Shortcuts
				// Rotate lanes
				if (rhoOffset < 32) {
					tMsw = (laneMsw << rhoOffset) | (laneLsw >>> (32 - rhoOffset));
					tLsw = (laneLsw << rhoOffset) | (laneMsw >>> (32 - rhoOffset));
				} /* if (rhoOffset >= 32) */ else {
					tMsw = (laneLsw << (rhoOffset - 32)) | (laneMsw >>> (64 - rhoOffset));
					tLsw = (laneMsw << (rhoOffset - 32)) | (laneLsw >>> (64 - rhoOffset));
				}
				const TPiLane = U[PI_INDEXES[laneIndex]]; // Transpose lanes
				TPiLane.high = tMsw;
				TPiLane.low = tLsw;
			}
			const T0 = U[0]; // Rho pi at x = y = 0
			const state0 = state[0];
			T0.high = state0.high;
			T0.low = state0.low;

			// Chi
			for (let x = 0; x < 5; x++)
				for (let y = 0; y < 5; y++) {
					const laneIndex = x + 5 * y; // Shortcuts
					const lane = state[laneIndex]; // Shortcuts
					const TLane = U[laneIndex]; // Shortcuts
					const Tx1Lane = U[((x + 1) % 5) + 5 * y]; // Shortcuts
					const Tx2Lane = U[((x + 2) % 5) + 5 * y]; // Shortcuts
					lane.high = TLane.high ^ (~Tx1Lane.high & Tx2Lane.high); // Mix rows
					lane.low = TLane.low ^ (~Tx1Lane.low & Tx2Lane.low); // Mix rows
				}
			const lane = state[0]; // Iota
			const roundConstant = ROUND_CONSTANTS[round];
			lane.high ^= roundConstant.high;
			lane.low ^= roundConstant.low;
		}
	}

	_doFinalize() {
		const data = this._data; // Shortcuts
		const dataWords = data.words; // Shortcuts
		// const nBitsTotal = this._nDataBytes * 8;// Shortcuts
		const nBitsLeft = data.sigBytes * 8; // Shortcuts
		const blockSizeBits = this.blockSize * 32; // Shortcuts
		// Add padding
		dataWords[nBitsLeft >>> 5] |= 0x1 << (24 - (nBitsLeft % 32));
		dataWords[((Math.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits) >>> 5) - 1] |= 0x80;
		data.sigBytes = dataWords.length * 4;
		this._process(); // Hash final blocks
		const state = this._state; // Shortcuts
		const outputLengthBytes = this.cfg.outputLength / 8; // Shortcuts
		const outputLengthLanes = outputLengthBytes / 8; // Shortcuts
		const hashWords = []; // Squeeze
		for (let i = 0; i < outputLengthLanes; i++) {
			const lane = state[i]; // Shortcuts
			let laneMsw = lane.high; // Shortcuts
			let laneLsw = lane.low; // Shortcuts
			// Swap endian
			laneMsw =
				(((laneMsw << 8) | (laneMsw >>> 24)) & 0x00ff00ff) | (((laneMsw << 24) | (laneMsw >>> 8)) & 0xff00ff00);
			laneLsw =
				(((laneLsw << 8) | (laneLsw >>> 24)) & 0x00ff00ff) | (((laneLsw << 24) | (laneLsw >>> 8)) & 0xff00ff00);
			hashWords.push(laneLsw); // Squeeze state to retrieve hash
			hashWords.push(laneMsw); // Squeeze state to retrieve hash
		}
		return new WordArray(hashWords, outputLengthBytes); // Return final computed hash
	}

	clone() {
		const clonedOne = super.clone();
		const state = this._state.slice(0);
		clonedOne._state = state;
		for (let i = 0; i < 25; i++) state[i] = state[i].clone();
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
 *     const hash = CryptoJS.SHA3('message');
 *     const hash = CryptoJS.SHA3(wordArray);
 */
C.SHA3 = Hasher._createHelper(SHA3);

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
 *     const hmac = CryptoJS.HmacSHA3(message, key);
 */
C.HmacSHA3 = Hasher._createHmacHelper(SHA3);

/**
 * SHA-224 hash algorithm.
 */
class SHA224 extends SHA256 {
	static initArray = [0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4];
	_doReset() {
		this._hash = new WordArray(SHA224.initArray);
	}

	_doFinalize() {
		const hash = super._doFinalize();
		hash.sigBytes -= 4;
		return hash;
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
 *     const hash = CryptoJS.SHA224('message');
 *     const hash = CryptoJS.SHA224(wordArray);
 */
C.SHA224 = SHA256._createHelper(SHA224);

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
 *     const hmac = CryptoJS.HmacSHA224(message, key);
 */
C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
// Constants
const J = [
	new X64Word(0x428a2f98, 0xd728ae22),
	new X64Word(0x71374491, 0x23ef65cd),
	new X64Word(0xb5c0fbcf, 0xec4d3b2f),
	new X64Word(0xe9b5dba5, 0x8189dbbc),
	new X64Word(0x3956c25b, 0xf348b538),
	new X64Word(0x59f111f1, 0xb605d019),
	new X64Word(0x923f82a4, 0xaf194f9b),
	new X64Word(0xab1c5ed5, 0xda6d8118),
	new X64Word(0xd807aa98, 0xa3030242),
	new X64Word(0x12835b01, 0x45706fbe),
	new X64Word(0x243185be, 0x4ee4b28c),
	new X64Word(0x550c7dc3, 0xd5ffb4e2),
	new X64Word(0x72be5d74, 0xf27b896f),
	new X64Word(0x80deb1fe, 0x3b1696b1),
	new X64Word(0x9bdc06a7, 0x25c71235),
	new X64Word(0xc19bf174, 0xcf692694),
	new X64Word(0xe49b69c1, 0x9ef14ad2),
	new X64Word(0xefbe4786, 0x384f25e3),
	new X64Word(0x0fc19dc6, 0x8b8cd5b5),
	new X64Word(0x240ca1cc, 0x77ac9c65),
	new X64Word(0x2de92c6f, 0x592b0275),
	new X64Word(0x4a7484aa, 0x6ea6e483),
	new X64Word(0x5cb0a9dc, 0xbd41fbd4),
	new X64Word(0x76f988da, 0x831153b5),
	new X64Word(0x983e5152, 0xee66dfab),
	new X64Word(0xa831c66d, 0x2db43210),
	new X64Word(0xb00327c8, 0x98fb213f),
	new X64Word(0xbf597fc7, 0xbeef0ee4),
	new X64Word(0xc6e00bf3, 0x3da88fc2),
	new X64Word(0xd5a79147, 0x930aa725),
	new X64Word(0x06ca6351, 0xe003826f),
	new X64Word(0x14292967, 0x0a0e6e70),
	new X64Word(0x27b70a85, 0x46d22ffc),
	new X64Word(0x2e1b2138, 0x5c26c926),
	new X64Word(0x4d2c6dfc, 0x5ac42aed),
	new X64Word(0x53380d13, 0x9d95b3df),
	new X64Word(0x650a7354, 0x8baf63de),
	new X64Word(0x766a0abb, 0x3c77b2a8),
	new X64Word(0x81c2c92e, 0x47edaee6),
	new X64Word(0x92722c85, 0x1482353b),
	new X64Word(0xa2bfe8a1, 0x4cf10364),
	new X64Word(0xa81a664b, 0xbc423001),
	new X64Word(0xc24b8b70, 0xd0f89791),
	new X64Word(0xc76c51a3, 0x0654be30),
	new X64Word(0xd192e819, 0xd6ef5218),
	new X64Word(0xd6990624, 0x5565a910),
	new X64Word(0xf40e3585, 0x5771202a),
	new X64Word(0x106aa070, 0x32bbd1b8),
	new X64Word(0x19a4c116, 0xb8d2d0c8),
	new X64Word(0x1e376c08, 0x5141ab53),
	new X64Word(0x2748774c, 0xdf8eeb99),
	new X64Word(0x34b0bcb5, 0xe19b48a8),
	new X64Word(0x391c0cb3, 0xc5c95a63),
	new X64Word(0x4ed8aa4a, 0xe3418acb),
	new X64Word(0x5b9cca4f, 0x7763e373),
	new X64Word(0x682e6ff3, 0xd6b2b8a3),
	new X64Word(0x748f82ee, 0x5defb2fc),
	new X64Word(0x78a5636f, 0x43172f60),
	new X64Word(0x84c87814, 0xa1f0ab72),
	new X64Word(0x8cc70208, 0x1a6439ec),
	new X64Word(0x90befffa, 0x23631e28),
	new X64Word(0xa4506ceb, 0xde82bde9),
	new X64Word(0xbef9a3f7, 0xb2c67915),
	new X64Word(0xc67178f2, 0xe372532b),
	new X64Word(0xca273ece, 0xea26619c),
	new X64Word(0xd186b8c7, 0x21c0c207),
	new X64Word(0xeada7dd6, 0xcde0eb1e),
	new X64Word(0xf57d4f7f, 0xee6ed178),
	new X64Word(0x06f067aa, 0x72176fba),
	new X64Word(0x0a637dc5, 0xa2c898a6),
	new X64Word(0x113f9804, 0xbef90dae),
	new X64Word(0x1b710b35, 0x131c471b),
	new X64Word(0x28db77f5, 0x23047d84),
	new X64Word(0x32caab7b, 0x40c72493),
	new X64Word(0x3c9ebe0a, 0x15c9bebc),
	new X64Word(0x431d67c4, 0x9c100d4c),
	new X64Word(0x4cc5d4be, 0xcb3e42b6),
	new X64Word(0x597f299c, 0xfc657e2a),
	new X64Word(0x5fcb6fab, 0x3ad6faec),
	new X64Word(0x6c44198c, 0x4a475817),
];

// Reusable objects
const L = [];
for (let i = 0; i < 80; i++) L[i] = new X64Word();

/**
 * SHA-512 hash algorithm.
 */
class SHA512 extends Hasher {
	constructor(cfg) {
		super(cfg);
		this.blockSize = 1024 / 32;
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
	}
	_doReset() {
		this._hash = new X64WordArray([
			new X64Word(0x6a09e667, 0xf3bcc908),
			new X64Word(0xbb67ae85, 0x84caa73b),
			new X64Word(0x3c6ef372, 0xfe94f82b),
			new X64Word(0xa54ff53a, 0x5f1d36f1),
			new X64Word(0x510e527f, 0xade682d1),
			new X64Word(0x9b05688c, 0x2b3e6c1f),
			new X64Word(0x1f83d9ab, 0xfb41bd6b),
			new X64Word(0x5be0cd19, 0x137e2179),
		]);
	}

	_doProcessBlock(M, offset) {
		// Shortcuts
		const H = this._hash.words;
		const [H0, H1, H2, H3, H4, H5, H6, H7] = H;

		const H0h = H0.high;
		let H0l = H0.low;
		const H1h = H1.high;
		let H1l = H1.low;
		const H2h = H2.high;
		let H2l = H2.low;
		const H3h = H3.high;
		let H3l = H3.low;
		const H4h = H4.high;
		let H4l = H4.low;
		const H5h = H5.high;
		let H5l = H5.low;
		const H6h = H6.high;
		let H6l = H6.low;
		const H7h = H7.high;
		let H7l = H7.low;

		// Working variables
		let ah = H0h,
			al = H0l,
			bh = H1h,
			bl = H1l,
			ch = H2h,
			cl = H2l,
			dh = H3h,
			dl = H3l,
			eh = H4h,
			el = H4l,
			fh = H5h,
			fl = H5l,
			gh = H6h,
			gl = H6l,
			hh = H7h,
			hl = H7l;

		// Rounds
		for (let i = 0; i < 80; i++) {
			let Wil, Wih;
			const Wi = L[i]; // Shortcut
			// Extend message
			if (i < 16) {
				Wih = Wi.high = M[offset + i * 2] | 0;
				Wil = Wi.low = M[offset + i * 2 + 1] | 0;
			} else {
				const gamma0x = L[i - 15]; // Gamma0
				const gamma0xh = gamma0x.high;
				const gamma0xl = gamma0x.low;
				const gamma0h =
					((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>> 7);
				const gamma0l =
					((gamma0xl >>> 1) | (gamma0xh << 31)) ^
					((gamma0xl >>> 8) | (gamma0xh << 24)) ^
					((gamma0xl >>> 7) | (gamma0xh << 25));

				const gamma1x = L[i - 2]; // Gamma1
				const gamma1xh = gamma1x.high;
				const gamma1xl = gamma1x.low;
				const gamma1h =
					((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6);
				const gamma1l =
					((gamma1xl >>> 19) | (gamma1xh << 13)) ^
					((gamma1xl << 3) | (gamma1xh >>> 29)) ^
					((gamma1xl >>> 6) | (gamma1xh << 26));

				// W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
				const Wi7 = L[i - 7];
				const Wi7h = Wi7.high;
				const Wi7l = Wi7.low;

				const Wi16 = L[i - 16];
				const Wi16h = Wi16.high;
				const Wi16l = Wi16.low;

				Wil = gamma0l + Wi7l;
				Wih = gamma0h + Wi7h + (Wil >>> 0 < gamma0l >>> 0 ? 1 : 0);
				Wil = Wil + gamma1l;
				Wih = Wih + gamma1h + (Wil >>> 0 < gamma1l >>> 0 ? 1 : 0);
				Wil = Wil + Wi16l;
				Wih = Wih + Wi16h + (Wil >>> 0 < Wi16l >>> 0 ? 1 : 0);

				Wi.high = Wih;
				Wi.low = Wil;
			}

			const chh = (eh & fh) ^ (~eh & gh);
			const chl = (el & fl) ^ (~el & gl);
			const majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
			const majl = (al & bl) ^ (al & cl) ^ (bl & cl);

			const sigma0h = ((ah >>> 28) | (al << 4)) ^ ((ah << 30) | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
			const sigma0l = ((al >>> 28) | (ah << 4)) ^ ((al << 30) | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
			const sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9));
			const sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9));

			const Ki = J[i]; // t1 = h + sigma1 + ch + K[i] + W[i]
			const Kih = Ki.high;
			const Kil = Ki.low;

			let t1l = hl + sigma1l;
			let t1h = hh + sigma1h + (t1l >>> 0 < hl >>> 0 ? 1 : 0);
			t1l = t1l + chl;
			t1h = t1h + chh + (t1l >>> 0 < chl >>> 0 ? 1 : 0);
			t1l = t1l + Kil;
			t1h = t1h + Kih + (t1l >>> 0 < Kil >>> 0 ? 1 : 0);
			t1l = t1l + Wil;
			t1h = t1h + Wih + (t1l >>> 0 < Wil >>> 0 ? 1 : 0);

			const t2l = sigma0l + majl; // t2 = sigma0 + maj
			const t2h = sigma0h + majh + (t2l >>> 0 < sigma0l >>> 0 ? 1 : 0);

			// Update working variables
			hh = gh;
			hl = gl;
			gh = fh;
			gl = fl;
			fh = eh;
			fl = el;
			el = (dl + t1l) | 0;
			eh = (dh + t1h + (el >>> 0 < dl >>> 0 ? 1 : 0)) | 0;
			dh = ch;
			dl = cl;
			ch = bh;
			cl = bl;
			bh = ah;
			bl = al;
			al = (t1l + t2l) | 0;
			ah = (t1h + t2h + (al >>> 0 < t1l >>> 0 ? 1 : 0)) | 0;
		}
		H0l = H0.low = H0l + al; // Intermediate hash value
		H0.high = H0h + ah + (H0l >>> 0 < al >>> 0 ? 1 : 0);
		H1l = H1.low = H1l + bl;
		H1.high = H1h + bh + (H1l >>> 0 < bl >>> 0 ? 1 : 0);
		H2l = H2.low = H2l + cl;
		H2.high = H2h + ch + (H2l >>> 0 < cl >>> 0 ? 1 : 0);
		H3l = H3.low = H3l + dl;
		H3.high = H3h + dh + (H3l >>> 0 < dl >>> 0 ? 1 : 0);
		H4l = H4.low = H4l + el;
		H4.high = H4h + eh + (H4l >>> 0 < el >>> 0 ? 1 : 0);
		H5l = H5.low = H5l + fl;
		H5.high = H5h + fh + (H5l >>> 0 < fl >>> 0 ? 1 : 0);
		H6l = H6.low = H6l + gl;
		H6.high = H6h + gh + (H6l >>> 0 < gl >>> 0 ? 1 : 0);
		H7l = H7.low = H7l + hl;
		H7.high = H7h + hh + (H7l >>> 0 < hl >>> 0 ? 1 : 0);
	}

	_doFinalize() {
		const data = this._data; // Shortcuts
		const dataWords = data.words; // Shortcuts
		const nBitsTotal = this._nDataBytes * 8;
		const nBitsLeft = data.sigBytes * 8;
		dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32)); // Add padding
		dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 30] = Math.floor(nBitsTotal / 0x100000000);
		dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal;
		data.sigBytes = dataWords.length * 4;
		this._process(); // Hash final blocks
		return this._hash.toX32(); // Convert hash to 32-bit word array before returning// Return final computed hash
	}

	clone() {
		const clonedOne = super.clone();
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
 *     const hash = CryptoJS.SHA512('message');
 *     const hash = CryptoJS.SHA512(wordArray);
 */
C.SHA512 = Hasher._createHelper(SHA512);

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
 *     const hmac = CryptoJS.HmacSHA512(message, key);
 */

C.HmacSHA512 = SHA512._createHmacHelper(SHA512);
/**
 * SHA-384 hash algorithm.
 */
class SHA384 extends SHA512 {
	_doReset() {
		this._hash = new X64WordArray([
			new X64Word(0xcbbb9d5d, 0xc1059ed8),
			new X64Word(0x629a292a, 0x367cd507),
			new X64Word(0x9159015a, 0x3070dd17),
			new X64Word(0x152fecd8, 0xf70e5939),
			new X64Word(0x67332667, 0xffc00b31),
			new X64Word(0x8eb44a87, 0x68581511),
			new X64Word(0xdb0c2e0d, 0x64f98fa7),
			new X64Word(0x47b5481d, 0xbefa4fa4),
		]);
	}

	_doFinalize() {
		const hash = super._doFinalize();
		hash.sigBytes -= 16;
		return hash;
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
 *     const hash = CryptoJS.SHA384('message');
 *     const hash = CryptoJS.SHA384(wordArray);
 */
C.SHA384 = SHA512._createHelper(SHA384);

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
 *     const hmac = CryptoJS.HmacSHA384(message, key);
 */
C.HmacSHA384 = SHA512._createHmacHelper(SHA384);

// Permuted Choice 1 constants
const PC1 = [
	57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55,
	47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
];

// Permuted Choice 2 constants
const PC2 = [
	14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30,
	40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32,
];

// Cumulative bit shift constants
const BIT_SHIFTS = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];

// SBOXes and round permutation constants
const SBOX_P = [
	{
		0x0: 0x808200,
		0x10000000: 0x8000,
		0x20000000: 0x808002,
		0x30000000: 0x2,
		0x40000000: 0x200,
		0x50000000: 0x808202,
		0x60000000: 0x800202,
		0x70000000: 0x800000,
		0x80000000: 0x202,
		0x90000000: 0x800200,
		0xa0000000: 0x8200,
		0xb0000000: 0x808000,
		0xc0000000: 0x8002,
		0xd0000000: 0x800002,
		0xe0000000: 0x0,
		0xf0000000: 0x8202,
		0x8000000: 0x0,
		0x18000000: 0x808202,
		0x28000000: 0x8202,
		0x38000000: 0x8000,
		0x48000000: 0x808200,
		0x58000000: 0x200,
		0x68000000: 0x808002,
		0x78000000: 0x2,
		0x88000000: 0x800200,
		0x98000000: 0x8200,
		0xa8000000: 0x808000,
		0xb8000000: 0x800202,
		0xc8000000: 0x800002,
		0xd8000000: 0x8002,
		0xe8000000: 0x202,
		0xf8000000: 0x800000,
		0x1: 0x8000,
		0x10000001: 0x2,
		0x20000001: 0x808200,
		0x30000001: 0x800000,
		0x40000001: 0x808002,
		0x50000001: 0x8200,
		0x60000001: 0x200,
		0x70000001: 0x800202,
		0x80000001: 0x808202,
		0x90000001: 0x808000,
		0xa0000001: 0x800002,
		0xb0000001: 0x8202,
		0xc0000001: 0x202,
		0xd0000001: 0x800200,
		0xe0000001: 0x8002,
		0xf0000001: 0x0,
		0x8000001: 0x808202,
		0x18000001: 0x808000,
		0x28000001: 0x800000,
		0x38000001: 0x200,
		0x48000001: 0x8000,
		0x58000001: 0x800002,
		0x68000001: 0x2,
		0x78000001: 0x8202,
		0x88000001: 0x8002,
		0x98000001: 0x800202,
		0xa8000001: 0x202,
		0xb8000001: 0x808200,
		0xc8000001: 0x800200,
		0xd8000001: 0x0,
		0xe8000001: 0x8200,
		0xf8000001: 0x808002,
	},
	{
		0x0: 0x40084010,
		0x1000000: 0x4000,
		0x2000000: 0x80000,
		0x3000000: 0x40080010,
		0x4000000: 0x40000010,
		0x5000000: 0x40084000,
		0x6000000: 0x40004000,
		0x7000000: 0x10,
		0x8000000: 0x84000,
		0x9000000: 0x40004010,
		0xa000000: 0x40000000,
		0xb000000: 0x84010,
		0xc000000: 0x80010,
		0xd000000: 0x0,
		0xe000000: 0x4010,
		0xf000000: 0x40080000,
		0x800000: 0x40004000,
		0x1800000: 0x84010,
		0x2800000: 0x10,
		0x3800000: 0x40004010,
		0x4800000: 0x40084010,
		0x5800000: 0x40000000,
		0x6800000: 0x80000,
		0x7800000: 0x40080010,
		0x8800000: 0x80010,
		0x9800000: 0x0,
		0xa800000: 0x4000,
		0xb800000: 0x40080000,
		0xc800000: 0x40000010,
		0xd800000: 0x84000,
		0xe800000: 0x40084000,
		0xf800000: 0x4010,
		0x10000000: 0x0,
		0x11000000: 0x40080010,
		0x12000000: 0x40004010,
		0x13000000: 0x40084000,
		0x14000000: 0x40080000,
		0x15000000: 0x10,
		0x16000000: 0x84010,
		0x17000000: 0x4000,
		0x18000000: 0x4010,
		0x19000000: 0x80000,
		0x1a000000: 0x80010,
		0x1b000000: 0x40000010,
		0x1c000000: 0x84000,
		0x1d000000: 0x40004000,
		0x1e000000: 0x40000000,
		0x1f000000: 0x40084010,
		0x10800000: 0x84010,
		0x11800000: 0x80000,
		0x12800000: 0x40080000,
		0x13800000: 0x4000,
		0x14800000: 0x40004000,
		0x15800000: 0x40084010,
		0x16800000: 0x10,
		0x17800000: 0x40000000,
		0x18800000: 0x40084000,
		0x19800000: 0x40000010,
		0x1a800000: 0x40004010,
		0x1b800000: 0x80010,
		0x1c800000: 0x0,
		0x1d800000: 0x4010,
		0x1e800000: 0x40080010,
		0x1f800000: 0x84000,
	},
	{
		0x0: 0x104,
		0x100000: 0x0,
		0x200000: 0x4000100,
		0x300000: 0x10104,
		0x400000: 0x10004,
		0x500000: 0x4000004,
		0x600000: 0x4010104,
		0x700000: 0x4010000,
		0x800000: 0x4000000,
		0x900000: 0x4010100,
		0xa00000: 0x10100,
		0xb00000: 0x4010004,
		0xc00000: 0x4000104,
		0xd00000: 0x10000,
		0xe00000: 0x4,
		0xf00000: 0x100,
		0x80000: 0x4010100,
		0x180000: 0x4010004,
		0x280000: 0x0,
		0x380000: 0x4000100,
		0x480000: 0x4000004,
		0x580000: 0x10000,
		0x680000: 0x10004,
		0x780000: 0x104,
		0x880000: 0x4,
		0x980000: 0x100,
		0xa80000: 0x4010000,
		0xb80000: 0x10104,
		0xc80000: 0x10100,
		0xd80000: 0x4000104,
		0xe80000: 0x4010104,
		0xf80000: 0x4000000,
		0x1000000: 0x4010100,
		0x1100000: 0x10004,
		0x1200000: 0x10000,
		0x1300000: 0x4000100,
		0x1400000: 0x100,
		0x1500000: 0x4010104,
		0x1600000: 0x4000004,
		0x1700000: 0x0,
		0x1800000: 0x4000104,
		0x1900000: 0x4000000,
		0x1a00000: 0x4,
		0x1b00000: 0x10100,
		0x1c00000: 0x4010000,
		0x1d00000: 0x104,
		0x1e00000: 0x10104,
		0x1f00000: 0x4010004,
		0x1080000: 0x4000000,
		0x1180000: 0x104,
		0x1280000: 0x4010100,
		0x1380000: 0x0,
		0x1480000: 0x10004,
		0x1580000: 0x4000100,
		0x1680000: 0x100,
		0x1780000: 0x4010004,
		0x1880000: 0x10000,
		0x1980000: 0x4010104,
		0x1a80000: 0x10104,
		0x1b80000: 0x4000004,
		0x1c80000: 0x4000104,
		0x1d80000: 0x4010000,
		0x1e80000: 0x4,
		0x1f80000: 0x10100,
	},
	{
		0x0: 0x80401000,
		0x10000: 0x80001040,
		0x20000: 0x401040,
		0x30000: 0x80400000,
		0x40000: 0x0,
		0x50000: 0x401000,
		0x60000: 0x80000040,
		0x70000: 0x400040,
		0x80000: 0x80000000,
		0x90000: 0x400000,
		0xa0000: 0x40,
		0xb0000: 0x80001000,
		0xc0000: 0x80400040,
		0xd0000: 0x1040,
		0xe0000: 0x1000,
		0xf0000: 0x80401040,
		0x8000: 0x80001040,
		0x18000: 0x40,
		0x28000: 0x80400040,
		0x38000: 0x80001000,
		0x48000: 0x401000,
		0x58000: 0x80401040,
		0x68000: 0x0,
		0x78000: 0x80400000,
		0x88000: 0x1000,
		0x98000: 0x80401000,
		0xa8000: 0x400000,
		0xb8000: 0x1040,
		0xc8000: 0x80000000,
		0xd8000: 0x400040,
		0xe8000: 0x401040,
		0xf8000: 0x80000040,
		0x100000: 0x400040,
		0x110000: 0x401000,
		0x120000: 0x80000040,
		0x130000: 0x0,
		0x140000: 0x1040,
		0x150000: 0x80400040,
		0x160000: 0x80401000,
		0x170000: 0x80001040,
		0x180000: 0x80401040,
		0x190000: 0x80000000,
		0x1a0000: 0x80400000,
		0x1b0000: 0x401040,
		0x1c0000: 0x80001000,
		0x1d0000: 0x400000,
		0x1e0000: 0x40,
		0x1f0000: 0x1000,
		0x108000: 0x80400000,
		0x118000: 0x80401040,
		0x128000: 0x0,
		0x138000: 0x401000,
		0x148000: 0x400040,
		0x158000: 0x80000000,
		0x168000: 0x80001040,
		0x178000: 0x40,
		0x188000: 0x80000040,
		0x198000: 0x1000,
		0x1a8000: 0x80001000,
		0x1b8000: 0x80400040,
		0x1c8000: 0x1040,
		0x1d8000: 0x80401000,
		0x1e8000: 0x400000,
		0x1f8000: 0x401040,
	},
	{
		0x0: 0x80,
		0x1000: 0x1040000,
		0x2000: 0x40000,
		0x3000: 0x20000000,
		0x4000: 0x20040080,
		0x5000: 0x1000080,
		0x6000: 0x21000080,
		0x7000: 0x40080,
		0x8000: 0x1000000,
		0x9000: 0x20040000,
		0xa000: 0x20000080,
		0xb000: 0x21040080,
		0xc000: 0x21040000,
		0xd000: 0x0,
		0xe000: 0x1040080,
		0xf000: 0x21000000,
		0x800: 0x1040080,
		0x1800: 0x21000080,
		0x2800: 0x80,
		0x3800: 0x1040000,
		0x4800: 0x40000,
		0x5800: 0x20040080,
		0x6800: 0x21040000,
		0x7800: 0x20000000,
		0x8800: 0x20040000,
		0x9800: 0x0,
		0xa800: 0x21040080,
		0xb800: 0x1000080,
		0xc800: 0x20000080,
		0xd800: 0x21000000,
		0xe800: 0x1000000,
		0xf800: 0x40080,
		0x10000: 0x40000,
		0x11000: 0x80,
		0x12000: 0x20000000,
		0x13000: 0x21000080,
		0x14000: 0x1000080,
		0x15000: 0x21040000,
		0x16000: 0x20040080,
		0x17000: 0x1000000,
		0x18000: 0x21040080,
		0x19000: 0x21000000,
		0x1a000: 0x1040000,
		0x1b000: 0x20040000,
		0x1c000: 0x40080,
		0x1d000: 0x20000080,
		0x1e000: 0x0,
		0x1f000: 0x1040080,
		0x10800: 0x21000080,
		0x11800: 0x1000000,
		0x12800: 0x1040000,
		0x13800: 0x20040080,
		0x14800: 0x20000000,
		0x15800: 0x1040080,
		0x16800: 0x80,
		0x17800: 0x21040000,
		0x18800: 0x40080,
		0x19800: 0x21040080,
		0x1a800: 0x0,
		0x1b800: 0x21000000,
		0x1c800: 0x1000080,
		0x1d800: 0x40000,
		0x1e800: 0x20040000,
		0x1f800: 0x20000080,
	},
	{
		0x0: 0x10000008,
		0x100: 0x2000,
		0x200: 0x10200000,
		0x300: 0x10202008,
		0x400: 0x10002000,
		0x500: 0x200000,
		0x600: 0x200008,
		0x700: 0x10000000,
		0x800: 0x0,
		0x900: 0x10002008,
		0xa00: 0x202000,
		0xb00: 0x8,
		0xc00: 0x10200008,
		0xd00: 0x202008,
		0xe00: 0x2008,
		0xf00: 0x10202000,
		0x80: 0x10200000,
		0x180: 0x10202008,
		0x280: 0x8,
		0x380: 0x200000,
		0x480: 0x202008,
		0x580: 0x10000008,
		0x680: 0x10002000,
		0x780: 0x2008,
		0x880: 0x200008,
		0x980: 0x2000,
		0xa80: 0x10002008,
		0xb80: 0x10200008,
		0xc80: 0x0,
		0xd80: 0x10202000,
		0xe80: 0x202000,
		0xf80: 0x10000000,
		0x1000: 0x10002000,
		0x1100: 0x10200008,
		0x1200: 0x10202008,
		0x1300: 0x2008,
		0x1400: 0x200000,
		0x1500: 0x10000000,
		0x1600: 0x10000008,
		0x1700: 0x202000,
		0x1800: 0x202008,
		0x1900: 0x0,
		0x1a00: 0x8,
		0x1b00: 0x10200000,
		0x1c00: 0x2000,
		0x1d00: 0x10002008,
		0x1e00: 0x10202000,
		0x1f00: 0x200008,
		0x1080: 0x8,
		0x1180: 0x202000,
		0x1280: 0x200000,
		0x1380: 0x10000008,
		0x1480: 0x10002000,
		0x1580: 0x2008,
		0x1680: 0x10202008,
		0x1780: 0x10200000,
		0x1880: 0x10202000,
		0x1980: 0x10200008,
		0x1a80: 0x2000,
		0x1b80: 0x202008,
		0x1c80: 0x200008,
		0x1d80: 0x0,
		0x1e80: 0x10000000,
		0x1f80: 0x10002008,
	},
	{
		0x0: 0x100000,
		0x10: 0x2000401,
		0x20: 0x400,
		0x30: 0x100401,
		0x40: 0x2100401,
		0x50: 0x0,
		0x60: 0x1,
		0x70: 0x2100001,
		0x80: 0x2000400,
		0x90: 0x100001,
		0xa0: 0x2000001,
		0xb0: 0x2100400,
		0xc0: 0x2100000,
		0xd0: 0x401,
		0xe0: 0x100400,
		0xf0: 0x2000000,
		0x8: 0x2100001,
		0x18: 0x0,
		0x28: 0x2000401,
		0x38: 0x2100400,
		0x48: 0x100000,
		0x58: 0x2000001,
		0x68: 0x2000000,
		0x78: 0x401,
		0x88: 0x100401,
		0x98: 0x2000400,
		0xa8: 0x2100000,
		0xb8: 0x100001,
		0xc8: 0x400,
		0xd8: 0x2100401,
		0xe8: 0x1,
		0xf8: 0x100400,
		0x100: 0x2000000,
		0x110: 0x100000,
		0x120: 0x2000401,
		0x130: 0x2100001,
		0x140: 0x100001,
		0x150: 0x2000400,
		0x160: 0x2100400,
		0x170: 0x100401,
		0x180: 0x401,
		0x190: 0x2100401,
		0x1a0: 0x100400,
		0x1b0: 0x1,
		0x1c0: 0x0,
		0x1d0: 0x2100000,
		0x1e0: 0x2000001,
		0x1f0: 0x400,
		0x108: 0x100400,
		0x118: 0x2000401,
		0x128: 0x2100001,
		0x138: 0x1,
		0x148: 0x2000000,
		0x158: 0x100000,
		0x168: 0x401,
		0x178: 0x2100400,
		0x188: 0x2000001,
		0x198: 0x2100000,
		0x1a8: 0x0,
		0x1b8: 0x2100401,
		0x1c8: 0x100401,
		0x1d8: 0x400,
		0x1e8: 0x2000400,
		0x1f8: 0x100001,
	},
	{
		0x0: 0x8000820,
		0x1: 0x20000,
		0x2: 0x8000000,
		0x3: 0x20,
		0x4: 0x20020,
		0x5: 0x8020820,
		0x6: 0x8020800,
		0x7: 0x800,
		0x8: 0x8020000,
		0x9: 0x8000800,
		0xa: 0x20800,
		0xb: 0x8020020,
		0xc: 0x820,
		0xd: 0x0,
		0xe: 0x8000020,
		0xf: 0x20820,
		0x80000000: 0x800,
		0x80000001: 0x8020820,
		0x80000002: 0x8000820,
		0x80000003: 0x8000000,
		0x80000004: 0x8020000,
		0x80000005: 0x20800,
		0x80000006: 0x20820,
		0x80000007: 0x20,
		0x80000008: 0x8000020,
		0x80000009: 0x820,
		0x8000000a: 0x20020,
		0x8000000b: 0x8020800,
		0x8000000c: 0x0,
		0x8000000d: 0x8020020,
		0x8000000e: 0x8000800,
		0x8000000f: 0x20000,
		0x10: 0x20820,
		0x11: 0x8020800,
		0x12: 0x20,
		0x13: 0x800,
		0x14: 0x8000800,
		0x15: 0x8000020,
		0x16: 0x8020020,
		0x17: 0x20000,
		0x18: 0x0,
		0x19: 0x20020,
		0x1a: 0x8020000,
		0x1b: 0x8000820,
		0x1c: 0x8020820,
		0x1d: 0x20800,
		0x1e: 0x820,
		0x1f: 0x8000000,
		0x80000010: 0x20000,
		0x80000011: 0x800,
		0x80000012: 0x8020020,
		0x80000013: 0x20820,
		0x80000014: 0x20,
		0x80000015: 0x8020000,
		0x80000016: 0x8000000,
		0x80000017: 0x8000820,
		0x80000018: 0x8020820,
		0x80000019: 0x8000020,
		0x8000001a: 0x8000800,
		0x8000001b: 0x0,
		0x8000001c: 0x20800,
		0x8000001d: 0x820,
		0x8000001e: 0x20020,
		0x8000001f: 0x8020800,
	},
];

// Masks that select the SBOX input
const SBOX_MASK = [0xf8000001, 0x1f800000, 0x01f80000, 0x001f8000, 0x0001f800, 0x00001f80, 0x000001f8, 0x8000001f];

/**
 * DES block cipher algorithm.
 */
export class DES extends BlockCipher {
	static keySize = 64 / 32;
	static ivSize = 64 / 32;
	static blockSize = 64 / 32;
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.keySize = DES.keySize;
		this.ivSize = DES.ivSize;
		this.blockSize = DES.blockSize;
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
		this.reset();
	}
	_doReset() {
		super._doReset();
		const key = this._key; // Shortcuts
		const keyWords = key.words; // Shortcuts
		const keyBits = []; // Select 56 bits according to PC1
		for (let i = 0; i < 56; i++) {
			const keyBitPos = PC1[i] - 1;
			keyBits[i] = (keyWords[keyBitPos >>> 5] >>> (31 - (keyBitPos % 32))) & 1;
		}

		const subKeys = []; // Assemble 16 subkeys
		this._subKeys = subKeys;
		for (let nSubKey = 0; nSubKey < 16; nSubKey++) {
			const subKey = []; // Create subkey
			subKeys[nSubKey] = subKey;
			const bitShift = BIT_SHIFTS[nSubKey]; // Shortcut

			// Select 48 bits according to PC2
			for (let i = 0; i < 24; i++) {
				subKey[(i / 6) | 0] |= keyBits[(PC2[i] - 1 + bitShift) % 28] << (31 - (i % 6)); // Select from the left 28 key bits
				subKey[4 + ((i / 6) | 0)] |= keyBits[28 + ((PC2[i + 24] - 1 + bitShift) % 28)] << (31 - (i % 6)); // Select from the right 28 key bits
			}

			// Since each subkey is applied to an expanded 32-bit input,
			// the subkey can be broken into 8 values scaled to 32-bits,
			// which allows the key to be used without expansion
			subKey[0] = (subKey[0] << 1) | (subKey[0] >>> 31);
			for (let i = 1; i < 7; i++) subKey[i] = subKey[i] >>> ((i - 1) * 4 + 3);
			subKey[7] = (subKey[7] << 5) | (subKey[7] >>> 27);
		}

		// Compute inverse subkeys
		const invSubKeys = [];
		this._invSubKeys = invSubKeys;
		for (let i = 0; i < 16; i++) invSubKeys[i] = subKeys[15 - i];
	}

	encryptBlock(M, offset) {
		this._doCryptBlock(M, offset, this._subKeys);
	}

	decryptBlock(M, offset) {
		this._doCryptBlock(M, offset, this._invSubKeys);
	}

	_doCryptBlock(M, offset, subKeys) {
		this._lBlock = M[offset]; // Get input
		this._rBlock = M[offset + 1]; // Get input
		this.exchangeLR(4, 0x0f0f0f0f); // Initial permutation
		this.exchangeLR(16, 0x0000ffff);
		this.exchangeRL(2, 0x33333333);
		this.exchangeRL(8, 0x00ff00ff);
		this.exchangeLR(1, 0x55555555);
		// Rounds
		for (let round = 0; round < 16; round++) {
			const subKey = subKeys[round]; // Shortcuts
			const lBlock = this._lBlock; // Shortcuts
			const rBlock = this._rBlock; // Shortcuts
			let f = 0; // Feistel function
			for (let i = 0; i < 8; i++) f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
			this._lBlock = rBlock;
			this._rBlock = lBlock ^ f;
		}
		const t = this._lBlock; // Undo swap from last round
		this._lBlock = this._rBlock;
		this._rBlock = t;
		this.exchangeLR(1, 0x55555555); // Final permutation
		this.exchangeRL(8, 0x00ff00ff);
		this.exchangeRL(2, 0x33333333);
		this.exchangeLR(16, 0x0000ffff);
		this.exchangeLR(4, 0x0f0f0f0f);
		M[offset] = this._lBlock; // Set output
		M[offset + 1] = this._rBlock; // Set output
	}
	// Swap bits across the left and right words
	exchangeLR(offset, mask) {
		const t = ((this._lBlock >>> offset) ^ this._rBlock) & mask;
		this._rBlock ^= t;
		this._lBlock ^= t << offset;
	}

	exchangeRL(offset, mask) {
		const t = ((this._rBlock >>> offset) ^ this._lBlock) & mask;
		this._lBlock ^= t;
		this._rBlock ^= t << offset;
	}
}
/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     const ciphertext = CryptoJS.DES.encrypt(message, key, cfg);
 *     const plaintext  = CryptoJS.DES.decrypt(ciphertext, key, cfg);
 */
C.DES = BlockCipher._createHelper(DES);

/**
 * Triple-DES block cipher algorithm.
 */
export class TripleDES extends BlockCipher {
	static keySize = 192 / 32;
	static ivSize = 64 / 32;
	static blockSize = 64 / 32;
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.keySize = TripleDES.keySize;
		this.ivSize = TripleDES.ivSize;
		this.blockSize = TripleDES.blockSize;
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
		this.reset();
	}

	_doReset() {
		super._doReset();
		// Shortcuts
		const key = this._key;
		const keyWords = key.words;
		// Make sure the key length is valid (64, 128 or >= 192 bit)
		if (keyWords.length !== 2 && keyWords.length !== 4 && keyWords.length < 6) {
			throw new Error(
				`Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.keyWords.length:${keyWords.length}`
			);
		}

		// Extend the key according to the keying options defined in 3DES standard
		const key1 = keyWords.slice(0, 2);
		const key2 = keyWords.length < 4 ? keyWords.slice(0, 2) : keyWords.slice(2, 4);
		const key3 = keyWords.length < 6 ? keyWords.slice(0, 2) : keyWords.slice(4, 6);

		// Create DES instances
		this._des1 = new DES(true, new WordArray(key1));
		this._des2 = new DES(true, new WordArray(key2));
		this._des3 = new DES(true, new WordArray(key3));
	}

	encryptBlock(M, offset) {
		this._des1.encryptBlock(M, offset);
		this._des2.decryptBlock(M, offset);
		this._des3.encryptBlock(M, offset);
	}

	decryptBlock(M, offset) {
		this._des3.decryptBlock(M, offset);
		this._des2.encryptBlock(M, offset);
		this._des1.decryptBlock(M, offset);
	}
}
/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     const ciphertext = CryptoJS.TripleDES.encrypt(message, key, cfg);
 *     const plaintext  = CryptoJS.TripleDES.decrypt(ciphertext, key, cfg);
 */
C.TripleDES = BlockCipher._createHelper(TripleDES);
/**
 * This key derivation function is meant to conform with EVP_BytesToKey.
 * www.openssl.org/docs/crypto/EVP_BytesToKey.html
 */
export class EvpKDF extends Base {
	static keySize = 128 / 32;
	static defaultConf = {
		keySize: EvpKDF.keySize,
		hasher: null,
		iterations: 1,
	};
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
		this.cfg = Base.mixIn(this.cfg, Base.mixIn(this.cfg, EvpKDF.defaultConf));
		this.cfg = Base.mixIn(this.cfg, cfg);
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
		let block;
		const cfg = this.cfg; // Shortcut
		const hasher = new cfg.hasher(); // Init hasher
		const derivedKey = new WordArray(); // Initial values
		const derivedKeyWords = derivedKey.words; // Shortcuts
		const keySize = cfg.keySize; // Shortcuts
		const iterations = cfg.iterations; // Shortcuts
		// Generate key
		while (derivedKeyWords.length < keySize) {
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
C.EvpKDF = (password, salt, cfg) => new EvpKDF(cfg).compute(password, salt);

EvpKDF.defaultConf.hasher = MD5;
OpenSSLKdf.EvpKDF = EvpKDF;
C.algo.AES = AES;
C.algo.Blowfish = Blowfish;
C.enc.Base64 = Base64;
C.enc.Base64url = Base64url;
C.enc.Utf16 = Utf16BE; // Alias for UTF-16 BE
C.enc.Utf16BE = Utf16BE; // Alias for UTF-16 BE
C.enc.Utf16LE = Utf16LE;
C.algo.EvpKDF = EvpKDF;
C.format.Hex = HexFormatter;
C.algo.HMAC = HMAC;
C.algo.MD5 = MD5;
C.mode.CFB = CFB;
C.mode.CTRGladman = CTRGladman;
C.mode.CTR = CTR;
C.mode.ECB = ECB;
C.mode.OFB = OFB;
C.pad.AnsiX923 = AnsiX923;
C.pad.Iso10126 = Iso10126;
C.pad.Iso97971 = Iso97971;
C.pad.NoPadding = NoPadding;
C.pad.ZeroPadding = ZeroPadding;
C.algo.PBKDF2 = PBKDF2;
C.algo.RabbitLegacy = RabbitLegacy;
C.algo.Rabbit = Rabbit;
C.algo.RC4 = RC4;
C.algo.RC4Drop = RC4Drop;
C.algo.RIPEMD160 = RIPEMD160;
C.algo.SHA1 = SHA1;
C.algo.SHA3 = SHA3;
C.algo.SHA224 = SHA224;
C.algo.SHA256 = SHA256;
C.algo.SHA384 = SHA384;
C.algo.SHA512 = SHA512;
C.algo.DES = DES;
C.algo.TripleDES = TripleDES;
C.x64.Word = X64Word;
C.x64.WordArray = X64WordArray;
