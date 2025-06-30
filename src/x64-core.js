(function (undefined) {
	// Shortcuts
	const C = CryptoJS;
	const C_lib = C.lib;
	const Base = C_lib.Base;
	const X32WordArray = C_lib.WordArray;

	/**
	 * x64 namespace.
	 */
	const C_x64 = {};
	C.x64 = C_x64;
	/**
	 * A 64-bit word.
	 */
	const X64Word = Base.extend({
		/**
		 * Initializes a newly created 64-bit word.
		 *
		 * @param {number} high The high 32 bits.
		 * @param {number} low The low 32 bits.
		 *
		 * @example
		 *
		 *     const x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
		 */
		init: function (high, low) {
			this.high = high;
			this.low = low;
		},

		/**
		 * Bitwise NOTs this word.
		 *
		 * @return {X64Word} A new x64-Word object after negating.
		 *
		 * @example
		 *
		 *     const negated = x64Word.not();
		 */
		// not: function () {
		// const high = ~this.high;
		// const low = ~this.low;

		// return X64Word.create(high, low);
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
		// and: function (word) {
		// const high = this.high & word.high;
		// const low = this.low & word.low;

		// return X64Word.create(high, low);
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
		// or: function (word) {
		// const high = this.high | word.high;
		// const low = this.low | word.low;

		// return X64Word.create(high, low);
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
		// xor: function (word) {
		// const high = this.high ^ word.high;
		// const low = this.low ^ word.low;

		// return X64Word.create(high, low);
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
		// shiftL: function (n) {
		// if (n < 32) {
		// const high = (this.high << n) | (this.low >>> (32 - n));
		// const low = this.low << n;
		// } else {
		// const high = this.low << (n - 32);
		// const low = 0;
		// }

		// return X64Word.create(high, low);
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
		// shiftR: function (n) {
		// if (n < 32) {
		// const low = (this.low >>> n) | (this.high << (32 - n));
		// const high = this.high >>> n;
		// } else {
		// const low = this.high >>> (n - 32);
		// const high = 0;
		// }

		// return X64Word.create(high, low);
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
		// rotL: function (n) {
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
		// rotR: function (n) {
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
		// add: function (word) {
		// const low = (this.low + word.low) | 0;
		// const carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
		// const high = (this.high + word.high + carry) | 0;

		// return X64Word.create(high, low);
		// }
	});

	/**
	 * An array of 64-bit words.
	 *
	 * @property {Array} words The array of CryptoJS.x64.Word objects.
	 * @property {number} sigBytes The number of significant bytes in this word array.
	 */
	const X64WordArray = (C_x64.WordArray = Base.extend({
		/**
		 * Initializes a newly created word array.
		 *
		 * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
		 * @param {number} sigBytes (Optional) The number of significant bytes in the words.
		 *
		 * @example
		 *
		 *     const wordArray = CryptoJS.x64.WordArray.create();
		 *
		 *     const wordArray = CryptoJS.x64.WordArray.create([
		 *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
		 *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
		 *     ]);
		 *
		 *     const wordArray = CryptoJS.x64.WordArray.create([
		 *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
		 *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
		 *     ], 10);
		 */
		init: function (words, sigBytes) {
			const _words = (this.words = words || []);
			this.sigBytes = sigBytes != undefined ? sigBytes : _words.length * 8;
		},

		/**
		 * Converts this 64-bit word array to a 32-bit word array.
		 *
		 * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
		 *
		 * @example
		 *
		 *     const x32WordArray = x64WordArray.toX32();
		 */
		toX32: function () {
			const x64Words = this.words; // Shortcuts
			const x64WordsLength = x64Words.length; // Shortcuts
			const x32Words = []; // Convert
			for (let i = 0; i < x64WordsLength; i++) {
				const x64Word = x64Words[i];
				x32Words.push(x64Word.high);
				x32Words.push(x64Word.low);
			}
			return X32WordArray.create(x32Words, this.sigBytes);
		},

		/**
		 * Creates a copy of this word array.
		 *
		 * @return {X64WordArray} The clone.
		 *
		 * @example
		 *
		 *     const clone = x64WordArray.clone();
		 */
		clone: function () {
			const clone = Base.clone.call(this);
			const words = this.words.slice(0); // Clone "words" array
			clone.words = words;
			const wordsLength = words.length; // Clone each X64Word object
			for (let i = 0; i < wordsLength; i++) words[i] = words[i].clone();
			return clone;
		},
	}));
	C_x64.Word = X64Word;
})();
