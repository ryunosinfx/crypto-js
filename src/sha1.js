(function () {
	// Shortcuts
	const C = CryptoJS;
	const C_lib = C.lib;
	const WordArray = C_lib.WordArray;
	const Hasher = C_lib.Hasher;
	const C_algo = C.algo;

	// Reusable object
	const W = [];

	/**
	 * SHA-1 hash algorithm.
	 */
	const SHA1 = Hasher.extend({
		_doReset: function () {
			this._hash = new WordArray.init([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0]);
		},

		_doProcessBlock: function (M, offset) {
			const H = this._hash.words; // Shortcut
			let [a, b, c, d, e] = H; // Working variables
			// Computation
			for (let i = 0; i < 80; i++) {
				if (i < 16) {
					W[i] = M[offset + i] | 0;
				} else {
					const n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
					W[i] = (n << 1) | (n >>> 31);
				}

				let t = ((a << 5) | (a >>> 27)) + e + W[i];
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
		},

		_doFinalize: function () {
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
		},

		clone: function () {
			const clone = Hasher.clone.call(this);
			clone._hash = this._hash.clone();
			return clone;
		},
	});
	C_algo.SHA1 = SHA1;
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
})();
