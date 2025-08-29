import { CryptoJS, Base, BufferedBlockAlgorithm, WordArray } from './core.js';
/**
 * Cipher core components.
 */
CryptoJS.lib.Cipher;
// Shortcuts
const C = CryptoJS;
const C_lib = C.lib;
/**
 * Abstract base cipher template.
 *
 * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
 * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
 * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
 * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
 */
export class Cipher extends BufferedBlockAlgorithm {
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
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize }); // Apply config defaults
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
export class StreamCipher extends Cipher {
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.blockSize = 1;
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
	}
	_doFinalize() {
		return this._process(!!'flush'); //finalProcessedBlocks Process partial blocks
	}
}

/**
 * Abstract base block cipher mode template.
 */
export class BlockCipherMode extends Base {
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
 * Cipher Block Chaining mode.
 */
/**
 * Abstract base CBC mode.
 */

/**
 * CBC encryptor.
 */
export class Encryptor extends BlockCipherMode {
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
export class Decryptor extends BlockCipherMode {
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
export class CBC extends BlockCipherMode {
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

/**
 * PKCS #5/7 padding strategy.
 */
export class Pkcs7 {
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
 * Abstract base block cipher template.
 *
 * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
 */
export class BlockCipher extends Cipher {
	/**
	 * Configuration options.
	 *
	 * @property {Mode} mode The block mode to use. Default: CBC
	 * @property {Padding} padding The padding strategy to use. Default: Pkcs7
	 */
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.cfg = Base.mixIn(this.cfg, {
			mode: CBC,
			padding: Pkcs7,
		});
		this.blockSize = 128 / 32;
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
export class CipherParams extends Base {
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
	constructor(cipherParams = {}) {
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
 * OpenSSL formatting strategy.
 */
export class OpenSSLFormatter {
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
		return wordArray.toString(C.enc.Base64);
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
		const ciphertext = C.enc.Base64.parse(openSSLStr); // Parse base64
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
export class SerializableCipher extends Base {
	/**
	 * Configuration options.
	 *
	 * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
	 */
	constructor() {
		super();
		this.cfg = Base.mixIn(this.cfg, {
			format: OpenSSLFormatter,
		});
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
		const cfgCurrent = Base.mixIn({}, this.cfg); // Apply config defaults
		const cfgExtended = Base.mixIn(cfgCurrent, cfg); // Apply config defaults
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
		const cfgCurrent = Base.mixIn({}, this.cfg); // Apply config defaults
		const cfgExtended = Base.mixIn(cfgCurrent, cfg); // Apply config defaults
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
export class OpenSSLKdf {
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
			? new C.algo.EvpKDF({ keySize: keySize + ivSize, hasher: hasher }).compute(password, saltForUse)
			: new C.algo.EvpKDF({ keySize: keySize + ivSize }).compute(password, saltForUse);
		const iv = new WordArray(key.words.slice(keySize), ivSize * 4); // Separate key and IV
		key.sigBytes = keySize * 4;
		return new CipherParams({ key: key, iv: iv, salt: saltForUse }); // Return params
	};
}
/**
 * A serializable cipher wrapper that derives the key from a password,
 * and returns ciphertext as a serializable cipher params object.
 */
class PasswordBasedCipher extends SerializableCipher {
	/**
	 * Configuration options.
	 *
	 * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
	 */
	constructor() {
		super();
		this.cfg = Base.mixIn(this.cfg, {
			kdf: OpenSSLKdf,
		});
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
C_lib.SerializableCipher = new SerializableCipher();
C_lib.PasswordBasedCipher = new PasswordBasedCipher();
Cipher.PasswordBasedCipher = new PasswordBasedCipher();
Cipher.SerializableCipher = new SerializableCipher();
