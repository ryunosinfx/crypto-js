(function () {
	// Shortcuts
	const C = CryptoJS;
	const C_lib = C.lib;
	const Base = C_lib.Base;
	const WordArray = C_lib.WordArray;
	const C_algo = C.algo;
	const MD5 = C_algo.MD5;

	/**
	 * This key derivation function is meant to conform with EVP_BytesToKey.
	 * www.openssl.org/docs/crypto/EVP_BytesToKey.html
	 */
	const EvpKDF = Base.extend({
		/**
		 * Configuration options.
		 *
		 * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
		 * @property {Hasher} hasher The hash algorithm to use. Default: MD5
		 * @property {number} iterations The number of iterations to perform. Default: 1
		 */
		cfg: Base.extend({
			keySize: 128 / 32,
			hasher: MD5,
			iterations: 1,
		}),

		/**
		 * Initializes a newly created key derivation function.
		 *
		 * @param {Object} cfg (Optional) The configuration options to use for the derivation.
		 *
		 * @example
		 *
		 *     const kdf = CryptoJS.algo.EvpKDF.create();
		 *     const kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
		 *     const kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
		 */
		init: function (cfg) {
			this.cfg = this.cfg.extend(cfg);
		},

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
		compute: function (password, salt) {
			let block;
			const cfg = this.cfg; // Shortcut
			const hasher = cfg.hasher.create(); // Init hasher
			const derivedKey = WordArray.create(); // Initial values
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
		},
	});
	C_algo.EvpKDF = EvpKDF;
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
	C.EvpKDF = function (password, salt, cfg) {
		return EvpKDF.create(cfg).compute(password, salt);
	};
})();
