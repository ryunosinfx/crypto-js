/**
 * Cipher core components.
 */
CryptoJS.lib.Cipher ||
	(function (undefined) {
		// Shortcuts
		const C = CryptoJS;
		const C_lib = C.lib;
		const Base = C_lib.Base;
		const WordArray = C_lib.WordArray;
		const BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
		const C_enc = C.enc;
		// const Utf8 = C_enc.Utf8;
		const Base64 = C_enc.Base64;
		const C_algo = C.algo;
		const EvpKDF = C_algo.EvpKDF;

		/**
		 * Abstract base cipher template.
		 *
		 * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
		 * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
		 * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
		 * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
		 */
		const Cipher = BufferedBlockAlgorithm.extend({
			/**
			 * Configuration options.
			 *
			 * @property {WordArray} iv The IV to use for this operation.
			 */
			cfg: Base.extend(),

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
			createEncryptor: function (key, cfg) {
				return this.create(this._ENC_XFORM_MODE, key, cfg);
			},

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
			createDecryptor: function (key, cfg) {
				return this.create(this._DEC_XFORM_MODE, key, cfg);
			},

			/**
			 * Initializes a newly created cipher.
			 *
			 * @param {number} xformMode Either the encryption or decryption transormation mode constant.
			 * @param {WordArray} key The key.
			 * @param {Object} cfg (Optional) The configuration options to use for this operation.
			 *
			 * @example
			 *
			 *     const cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
			 */
			init: function (xformMode, key, cfg) {
				this.cfg = this.cfg.extend(cfg); // Apply config defaults
				this._xformMode = xformMode; // Store transform mode and key
				this._key = key; // Store transform mode and key
				this.reset(); // Set initial values
			},

			/**
			 * Resets this cipher to its initial state.
			 *
			 * @example
			 *
			 *     cipher.reset();
			 */
			reset: function () {
				BufferedBlockAlgorithm.reset.call(this); // Reset data buffer
				this._doReset(); // Perform concrete-cipher logic
			},

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
			process: function (dataUpdate) {
				this._append(dataUpdate); // Append
				return this._process(); // Process available blocks
			},

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
			finalize: function (dataUpdate) {
				if (dataUpdate) this._append(dataUpdate); // Final data update
				return this._doFinalize(); //finalProcessedData Perform concrete-cipher logic
			},

			keySize: 128 / 32,

			ivSize: 128 / 32,

			_ENC_XFORM_MODE: 1,

			_DEC_XFORM_MODE: 2,

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
			_createHelper: (() => {
				const selectCipherStrategy = key => (typeof key == 'string' ? PasswordBasedCipher : SerializableCipher);
				return cipher => {
					return {
						encrypt: (message, key, cfg) => selectCipherStrategy(key).encrypt(cipher, message, key, cfg),
						decrypt: (ciphertext, key, cfg) =>
							selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg),
					};
				};
			})(),
		});
		/**
		 * Abstract base stream cipher template.
		 *
		 * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
		 */
		const StreamCipher = Cipher.extend({
			_doFinalize: function () {
				return this._process(!!'flush'); //finalProcessedBlocks Process partial blocks
			},

			blockSize: 1,
		});

		/**
		 * Abstract base block cipher mode template.
		 */
		const BlockCipherMode = Base.extend({
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
			createEncryptor: function (cipher, iv) {
				return this.Encryptor.create(cipher, iv);
			},

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
			createDecryptor: function (cipher, iv) {
				return this.Decryptor.create(cipher, iv);
			},

			/**
			 * Initializes a newly created mode.
			 *
			 * @param {Cipher} cipher A block cipher instance.
			 * @param {Array} iv The IV words.
			 *
			 * @example
			 *
			 *     const mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
			 */
			init: function (cipher, iv) {
				this._cipher = cipher;
				this._iv = iv;
			},
		});
		/**
		 * Cipher Block Chaining mode.
		 */
		const CBC = (function () {
			/**
			 * Abstract base CBC mode.
			 */
			const CBC = BlockCipherMode.extend();

			/**
			 * CBC encryptor.
			 */
			CBC.Encryptor = CBC.extend({
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
				processBlock: function (words, offset) {
					const cipher = this._cipher; // Shortcuts
					const blockSize = cipher.blockSize; // Shortcuts
					xorBlock.call(this, words, offset, blockSize); // XOR and encrypt
					cipher.encryptBlock(words, offset);
					this._prevBlock = words.slice(offset, offset + blockSize); // Remember this block to use with next block
				},
			});

			/**
			 * CBC decryptor.
			 */
			CBC.Decryptor = CBC.extend({
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
				processBlock: function (words, offset) {
					const cipher = this._cipher; // Shortcuts
					const blockSize = cipher.blockSize; // Shortcuts
					const thisBlock = words.slice(offset, offset + blockSize); // Remember this block to use with next block
					cipher.decryptBlock(words, offset); // Decrypt and XOR
					xorBlock.call(this, words, offset, blockSize);
					this._prevBlock = thisBlock; // This block becomes the previous block
				},
			});

			function xorBlock(words, offset, blockSize) {
				const iv = this._iv; // Shortcut
				const block = iv ? iv : this._prevBlock;
				if (iv) this._iv = undefined; // Choose mixing block// Remove IV for subsequent blocks
				for (let i = 0; i < blockSize; i++) words[offset + i] ^= block[i]; // XOR blocks
			}

			return CBC;
		})();

		/**
		 * PKCS #5/7 padding strategy.
		 */
		const Pkcs7 = {
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
			pad: function (data, blockSize) {
				const blockSizeBytes = blockSize * 4; // Shortcut
				const nPaddingBytes = blockSizeBytes - (data.sigBytes % blockSizeBytes); // Count padding bytes
				const paddingWord =
					(nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes; // Create padding word
				const paddingWords = []; // Create padding
				for (let i = 0; i < nPaddingBytes; i += 4) paddingWords.push(paddingWord);
				const padding = WordArray.create(paddingWords, nPaddingBytes);
				data.concat(padding); // Add padding
			},

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
			unpad: function (data) {
				const nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff; // Get number of padding bytes from last byte
				data.sigBytes -= nPaddingBytes; // Remove padding
			},
		};
		/**
		 * Abstract base block cipher template.
		 *
		 * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
		 */
		const BlockCipher = Cipher.extend({
			/**
			 * Configuration options.
			 *
			 * @property {Mode} mode The block mode to use. Default: CBC
			 * @property {Padding} padding The padding strategy to use. Default: Pkcs7
			 */
			cfg: Cipher.cfg.extend({
				mode: CBC,
				padding: Pkcs7,
			}),

			reset: function () {
				Cipher.reset.call(this); // Reset cipher
				const cfg = this.cfg; // Shortcuts
				const iv = cfg.iv; // Shortcuts
				const mode = cfg.mode; // Shortcuts
				const isRestBlockMode = this._xformMode == this._ENC_XFORM_MODE; // Reset block mode
				const modeCreator = isRestBlockMode ? mode.createEncryptor : mode.createDecryptor;
				if (!isRestBlockMode) this._minBufferSize = 1; /* if (this._xformMode == this._DEC_XFORM_MODE) */ // Keep at least one block in the buffer for unpadding
				if (this._mode && this._mode.__creator == modeCreator) {
					this._mode.init(this, iv && iv.words);
				} else {
					this._mode = modeCreator.call(mode, this, iv && iv.words);
					this._mode.__creator = modeCreator;
				}
			},

			_doProcessBlock: function (words, offset) {
				this._mode.processBlock(words, offset);
			},

			_doFinalize: function () {
				let finalProcessedBlocks;
				const padding = this.cfg.padding; // Shortcut
				// Finalize
				if (this._xformMode == this._ENC_XFORM_MODE) {
					padding.pad(this._data, this.blockSize); // Pad data
					finalProcessedBlocks = this._process(!!'flush'); // Process final blocks
				} /* if (this._xformMode == this._DEC_XFORM_MODE) */ else {
					finalProcessedBlocks = this._process(!!'flush'); // Process final blocks
					padding.unpad(finalProcessedBlocks); // Unpad data
				}
				return finalProcessedBlocks;
			},

			blockSize: 128 / 32,
		});
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
		const CipherParams = Base.extend({
			/**
			 * Initializes a newly created cipher params object.
			 *
			 * @param {Object} cipherParams An object with any of the possible cipher parameters.
			 *
			 * @example
			 *
			 *     const cipherParams = CryptoJS.lib.CipherParams.create({
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
			init: function (cipherParams) {
				this.mixIn(cipherParams);
			},

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
			toString: function (formatter) {
				return (formatter || this.formatter).stringify(this);
			},
		});

		/**
		 * OpenSSL formatting strategy.
		 */
		const OpenSSLFormatter = {
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
			stringify: function (cipherParams) {
				const ciphertext = cipherParams.ciphertext; // Shortcuts
				const salt = cipherParams.salt; // Shortcuts
				const wordArray = salt // Format
					? WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext)
					: ciphertext;
				return wordArray.toString(Base64);
			},

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
			parse: function (openSSLStr) {
				let salt;
				const ciphertext = Base64.parse(openSSLStr); // Parse base64
				const ciphertextWords = ciphertext.words; // Shortcut
				// Test for salt
				if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
					salt = WordArray.create(ciphertextWords.slice(2, 4)); // Extract salt
					ciphertextWords.splice(0, 4); // Remove salt from ciphertext
					ciphertext.sigBytes -= 16;
				}
				return CipherParams.create({ ciphertext, salt });
			},
		};
		/**
		 * A cipher wrapper that returns ciphertext as a serializable cipher params object.
		 */
		const SerializableCipher = Base.extend({
			/**
			 * Configuration options.
			 *
			 * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
			 */
			cfg: Base.extend({
				format: OpenSSLFormatter,
			}),

			/**
			 * Encrypts a message.
			 *
			 * @param {Cipher} cipher The cipher algorithm to use.
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
			encrypt: function (cipher, message, key, cfg) {
				const cfgExtended = this.cfg.extend(cfg); // Apply config defaults
				const encryptor = cipher.createEncryptor(key, cfgExtended); // Encrypt
				const ciphertext = encryptor.finalize(message);
				const cipherCfg = encryptor.cfg; // Shortcut
				// Create and return serializable cipher params
				return CipherParams.create({
					ciphertext,
					key: key,
					iv: cipherCfg.iv,
					algorithm: cipher,
					mode: cipherCfg.mode,
					padding: cipherCfg.padding,
					blockSize: cipher.blockSize,
					formatter: cfgExtended.format,
				});
			},

			/**
			 * Decrypts serialized ciphertext.
			 *
			 * @param {Cipher} cipher The cipher algorithm to use.
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
			decrypt: function (cipher, ciphertext, key, cfg) {
				const cfgExtended = this.cfg.extend(cfg); // Apply config defaults
				const ciphertextParsed = this._parse(ciphertext, cfgExtended.format); // Convert string to CipherParams
				return cipher.createDecryptor(key, cfgExtended).finalize(ciphertextParsed.ciphertext); //plaintext Decrypt
			},

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
			_parse: function (ciphertext, format) {
				return typeof ciphertext === 'string' ? format.parse(ciphertext, this) : ciphertext;
			},
		});

		/**
		 * OpenSSL key derivation function.
		 */
		const OpenSSLKdf = {
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
			execute: function (password, keySize, ivSize, salt, hasher) {
				const saltForUse = salt ? salt : WordArray.random(64 / 8); // Generate random salt
				const key = hasher // Derive key and IV
					? EvpKDF.create({ keySize: keySize + ivSize, hasher: hasher }).compute(password, saltForUse)
					: EvpKDF.create({ keySize: keySize + ivSize }).compute(password, saltForUse);
				const iv = WordArray.create(key.words.slice(keySize), ivSize * 4); // Separate key and IV
				key.sigBytes = keySize * 4;
				return CipherParams.create({ key: key, iv: iv, salt: saltForUse }); // Return params
			},
		};
		/**
		 * A serializable cipher wrapper that derives the key from a password,
		 * and returns ciphertext as a serializable cipher params object.
		 */
		const PasswordBasedCipher = SerializableCipher.extend({
			/**
			 * Configuration options.
			 *
			 * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
			 */
			cfg: SerializableCipher.cfg.extend({
				kdf: OpenSSLKdf,
			}),

			/**
			 * Encrypts a message using a password.
			 *
			 * @param {Cipher} cipher The cipher algorithm to use.
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
			encrypt: function (cipher, message, password, cfg) {
				const cfgExtended = this.cfg.extend(cfg); // Apply config defaults
				const derivedParams = cfgExtended.kdf.execute(
					password,
					cipher.keySize,
					cipher.ivSize,
					cfgExtended.salt,
					cfgExtended.hasher
				); // Derive key and other params
				cfgExtended.iv = derivedParams.iv; // Add IV to config
				const ciphertext = SerializableCipher.encrypt.call(
					this,
					cipher,
					message,
					derivedParams.key,
					cfgExtended
				); // Encrypt
				ciphertext.mixIn(derivedParams); // Mix in derived params
				return ciphertext;
			},

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
			decrypt: function (cipher, ciphertext, password, cfg) {
				const cfgExtended = this.cfg.extend(cfg); // Apply config defaults
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
				return SerializableCipher.decrypt.call(this, cipher, ciphertextParsed, derivedParams.key, cfgExtended); //plaintext// Decrypt
			},
		});

		/**
		 * Mode namespace.
		 */
		C.mode = { CBC };
		/**
		 * Padding namespace.
		 */
		C.pad = { Pkcs7 };

		/**
		 * Format namespace.
		 */
		C.format = { OpenSSL: OpenSSLFormatter };
		/**
		 * Key derivation function namespace.
		 */
		C.kdf = { OpenSSL: OpenSSLKdf };
		C_lib.Cipher = Cipher;
		C_lib.StreamCipher = StreamCipher;
		C_lib.BlockCipherMode = BlockCipherMode;
		C_lib.BlockCipher = BlockCipher;
		C_lib.CipherParams = CipherParams;
		C_lib.SerializableCipher = SerializableCipher;
		C_lib.PasswordBasedCipher = PasswordBasedCipher;
	})();
