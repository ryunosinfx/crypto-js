import { BlockCipherMode } from './abstract-block-cipher-mode.js';

/**
 * Cipher Block Chaining mode.
 * Abstract base CBC mode.
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
