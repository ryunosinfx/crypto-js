(function () {
	// Shortcuts
	const C = CryptoJS;
	const C_lib = C.lib;
	const Base = C_lib.Base;
	const WordArray = C_lib.WordArray;
	const C_algo = C.algo;
	const SHA256 = C_algo.SHA256;
	const HMAC = C_algo.HMAC;

	/**
	 * Password-Based Key Derivation Function 2 algorithm.
	 */
	const PBKDF2 = Base.extend({
		/**
		 * Configuration options.
		 *
		 * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
		 * @property {Hasher} hasher The hasher to use. Default: SHA256
		 * @property {number} iterations The number of iterations to perform. Default: 250000
		 */
		cfg: Base.extend({
			keySize: 128 / 32,
			hasher: SHA256,
			iterations: 250000,
		}),

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
		init: function (cfg) {
			this.cfg = this.cfg.extend(cfg);
		},

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
		compute: function (password, salt) {
			const cfg = this.cfg; // Shortcut
			const hmac = HMAC.create(cfg.hasher, password); // Init HMAC
			const derivedKey = WordArray.create(); // Initial values
			const blockIndex = WordArray.create([0x00000001]); // Initial values
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
		},
	});

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
	C.PBKDF2 = (password, salt, cfg) => PBKDF2.create(cfg).compute(password, salt);
	C_algo.PBKDF2 = PBKDF2;
})();
