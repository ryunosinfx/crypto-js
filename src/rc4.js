(function () {
	// Shortcuts
	const C = CryptoJS;
	const C_lib = C.lib;
	const StreamCipher = C_lib.StreamCipher;
	const C_algo = C.algo;

	/**
	 * RC4 stream cipher algorithm.
	 */
	const RC4 = StreamCipher.extend({
		_doReset: function () {
			const key = this._key; // Shortcuts
			const keyWords = key.words; // Shortcuts
			const keySigBytes = key.sigBytes; // Shortcuts
			const S = (this._S = []); // Init sbox
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
			this._i = this._j = 0; // Counters
		},

		_doProcessBlock: function (M, offset) {
			M[offset] ^= this.generateKeystreamWord();
		},

		generateKeystreamWord: function () {
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
		},

		keySize: 256 / 32,

		ivSize: 0,
	});
	C_algo.RC4 = RC4;

	/**
	 * Shortcut functions to the cipher's object interface.
	 *
	 * @example
	 *
	 *     const ciphertext = CryptoJS.RC4.encrypt(message, key, cfg);
	 *     const plaintext  = CryptoJS.RC4.decrypt(ciphertext, key, cfg);
	 */
	C.RC4 = StreamCipher._createHelper(RC4);

	/**
	 * Modified RC4 stream cipher algorithm.
	 */
	const RC4Drop = RC4.extend({
		/**
		 * Configuration options.
		 *
		 * @property {number} drop The number of keystream words to drop. Default 192
		 */
		cfg: RC4.cfg.extend({
			drop: 192,
		}),

		_doReset: function () {
			RC4._doReset.call(this);
			for (let i = this.cfg.drop; i > 0; i--) this.generateKeystreamWord(); // Drop
		},
	});
	C_algo.RC4Drop = RC4Drop;
	/**
	 * Shortcut functions to the cipher's object interface.
	 *
	 * @example
	 *
	 *     const ciphertext = CryptoJS.RC4Drop.encrypt(message, key, cfg);
	 *     const plaintext  = CryptoJS.RC4Drop.decrypt(ciphertext, key, cfg);
	 */
	C.RC4Drop = StreamCipher._createHelper(RC4Drop);
})();
