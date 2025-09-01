import { BlockCipherMode } from './abstract-block-cipher-mode.js';
/**
 * Counter block mode.
 */

export class CTR extends BlockCipherMode {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
}

class Encryptor extends CTR {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		const cipher = this._cipher; // Shortcuts
		const blockSize = cipher.blockSize; // Shortcuts
		const iv = this._iv; // Shortcuts
		const counter = iv ? iv.slice(0) : this._counter; // Generate keystream
		this._counter = counter;
		if (iv) this._iv = undefined; // Remove IV for subsequent blocks
		const keystream = counter.slice(0);
		cipher.encryptBlock(keystream, 0);
		counter[blockSize - 1] = (counter[blockSize - 1] + 1) | 0; // Increment counter
		for (let i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i]; // Encrypt
	}
}
CTR.Encryptor = Encryptor;
CTR.Decryptor = Encryptor;
