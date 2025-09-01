import { BlockCipherMode } from './abstract-block-cipher-mode.js';
/**
 * Cipher Feedback block mode.
 */

const generateKeystreamAndEncrypt = (self, words, offset, blockSize, cipher) => {
	const iv = self._iv; // Shortcut
	const keystream = iv ? iv.slice(0) : self._prevBlock; // Generate keystream
	if (iv) self._iv = undefined; // Remove IV for subsequent blocks
	cipher.encryptBlock(keystream, 0);
	for (let i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i]; // Encrypt
};
export class CFB extends BlockCipherMode {
	constructor(cipher, iv) {
		super(cipher, iv);
		this._prevBlock = iv ? iv.slice(0) : []; // Remember previous block
	}
}
class Decryptor extends CFB {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		const cipher = this._cipher; // Shortcuts
		const blockSize = cipher.blockSize; // Shortcuts
		const thisBlock = words.slice(offset, offset + blockSize); // Remember this block to use with next block
		generateKeystreamAndEncrypt(this, words, offset, blockSize, cipher);
		this._prevBlock = thisBlock; // This block becomes the previous block
	}
}
class Encryptor extends CFB {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		const cipher = this._cipher; // Shortcuts
		const blockSize = cipher.blockSize; // Shortcuts
		generateKeystreamAndEncrypt(this, words, offset, blockSize, cipher);
		this._prevBlock = words.slice(offset, offset + blockSize); // Remember this block to use with next block
	}
}
CFB.Encryptor = Encryptor;

CFB.Decryptor = Decryptor;
