import { BlockCipherMode } from './cipher-core.js';

/**
 * Output Feedback block mode.
 */

export class OFB extends BlockCipherMode {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	static Decryptor = null;
}
class Encryptor extends OFB {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		const cipher = this._cipher; // Shortcuts
		const blockSize = cipher.blockSize; // Shortcuts
		const iv = this._iv; // Shortcuts
		const keystream = iv ? iv.slice(0) : this._keystream; // Generate keystream
		this._keystream = keystream;
		if (iv) this._iv = undefined; // Remove IV for subsequent blocks
		cipher.encryptBlock(keystream, 0);
		for (let i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i]; // Encrypt
	}
}
OFB.Encryptor = Encryptor;
OFB.Decryptor = Encryptor;
