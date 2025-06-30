(function () {
	// Shortcuts
	const C = CryptoJS;
	const C_lib = C.lib;
	const WordArray = C_lib.WordArray;
	const C_algo = C.algo;
	const SHA256 = C_algo.SHA256;

	/**
	 * SHA-224 hash algorithm.
	 */
	const SHA224 = SHA256.extend({
		_doReset: function () {
			this._hash = new WordArray.init([
				0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4,
			]);
		},

		_doFinalize: function () {
			const hash = SHA256._doFinalize.call(this);
			hash.sigBytes -= 4;
			return hash;
		},
	});
	C_algo.SHA224 = SHA224;
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
})();
