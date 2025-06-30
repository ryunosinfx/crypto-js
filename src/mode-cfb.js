/**
 * Cipher Feedback block mode.
 */
CryptoJS.mode.CFB = (function () {
	const CFB = CryptoJS.lib.BlockCipherMode.extend();

	CFB.Encryptor = CFB.extend({
		processBlock: function (words, offset) {
			const cipher = this._cipher; // Shortcuts
			const blockSize = cipher.blockSize; // Shortcuts
			generateKeystreamAndEncrypt(this, words, offset, blockSize, cipher);
			this._prevBlock = words.slice(offset, offset + blockSize); // Remember this block to use with next block
		},
	});

	CFB.Decryptor = CFB.extend({
		processBlock: function (words, offset) {
			const cipher = this._cipher; // Shortcuts
			const blockSize = cipher.blockSize; // Shortcuts
			const thisBlock = words.slice(offset, offset + blockSize); // Remember this block to use with next block
			generateKeystreamAndEncrypt(this, words, offset, blockSize, cipher);
			this._prevBlock = thisBlock; // This block becomes the previous block
		},
	});

	function generateKeystreamAndEncrypt(self, words, offset, blockSize, cipher) {
		const iv = self._iv; // Shortcut
		const keystream = iv ? iv.slice(0) : self._prevBlock; // Generate keystream
		if (iv) self._iv = undefined; // Remove IV for subsequent blocks
		cipher.encryptBlock(keystream, 0);
		for (let i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i]; // Encrypt
	}

	return CFB;
})();
