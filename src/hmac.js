(function () {
	// Shortcuts
	const C = CryptoJS;
	const C_lib = C.lib;
	const Base = C_lib.Base;
	const C_enc = C.enc;
	const Utf8 = C_enc.Utf8;
	const C_algo = C.algo;

	/**
	 * HMAC algorithm.
	 */
	const HMAC = Base.extend({
		/**
		 * Initializes a newly created HMAC.
		 *
		 * @param {Hasher} hasher The hash algorithm to use.
		 * @param {WordArray|string} key The secret key.
		 *
		 * @example
		 *
		 *     const hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
		 */
		init: function (hasher, key) {
			const hasherInited = (this._hasher = new hasher.init()); // Init hasher
			if (typeof key == 'string') key = Utf8.parse(key); // Convert string to WordArray, else assume WordArray already
			const hasherBlockSize = hasherInited.blockSize; // Shortcuts
			const hasherBlockSizeBytes = hasherBlockSize * 4; // Shortcuts
			if (key.sigBytes > hasherBlockSizeBytes) key = hasherInited.finalize(key); // Allow arbitrary length keys
			key.clamp(); // Clamp excess bits
			const oKey = (this._oKey = key.clone()); // Clone key for inner and outer pads
			const iKey = (this._iKey = key.clone()); // Clone key for inner and outer pads
			const oKeyWords = oKey.words; // Shortcuts
			const iKeyWords = iKey.words; // Shortcuts
			// XOR keys with pad constants
			for (let i = 0; i < hasherBlockSize; i++) {
				oKeyWords[i] ^= 0x5c5c5c5c;
				iKeyWords[i] ^= 0x36363636;
			}
			oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;
			this.reset(); // Set initial values
		},

		/**
		 * Resets this HMAC to its initial state.
		 *
		 * @example
		 *
		 *     hmacHasher.reset();
		 */
		reset: function () {
			const hasher = this._hasher; // Shortcut
			hasher.reset(); // Reset
			hasher.update(this._iKey);
		},

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
		update: function (messageUpdate) {
			this._hasher.update(messageUpdate);
			return this; // Chainable
		},

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
		finalize: function (messageUpdate) {
			const hasher = this._hasher; // Shortcut
			const innerHash = hasher.finalize(messageUpdate); // Compute HMAC
			hasher.reset();
			return hasher.finalize(this._oKey.clone().concat(innerHash)); //hmac
		},
	});
	C_algo.HMAC = HMAC;
})();
