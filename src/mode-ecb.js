import { BlockCipherMode } from './cipher-core.js';
/**
 * Electronic Codebook block mode.
 */

export class ECB extends BlockCipherMode {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
}

class Encryptor extends ECB {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		this._cipher.encryptBlock(words, offset);
	}
}
class Decryptor extends ECB {
	constructor(cipher, iv) {
		super(cipher, iv);
	}
	processBlock(words, offset) {
		this._cipher.decryptBlock(words, offset);
	}
}
ECB.Encryptor = Encryptor;
ECB.Decryptor = Decryptor;
