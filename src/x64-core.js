import { CryptoJS as C } from './core.js';
import { Base } from './abstract-base.js';
import { WordArray } from './word-array.js';

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
export class X64Word extends Base {
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
export class X64WordArray extends Base {
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
