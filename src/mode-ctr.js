/**
 * Counter block mode.
 */
CryptoJS.mode.CTR = (function () {
	const CTR = CryptoJS.lib.BlockCipherMode.extend();

	const Encryptor = (CTR.Encryptor = CTR.extend({
		processBlock: function (words, offset) {
			const cipher = this._cipher; // Shortcuts
			const blockSize = cipher.blockSize; // Shortcuts
			const iv = this._iv; // Shortcuts
			const counter = iv ? (this._counter = iv.slice(0)) : this._counter; // Generate keystream
			if (iv) this._iv = undefined; // Remove IV for subsequent blocks
			const keystream = counter.slice(0);
			cipher.encryptBlock(keystream, 0);
			counter[blockSize - 1] = (counter[blockSize - 1] + 1) | 0; // Increment counter
			for (let i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i]; // Encrypt
		},
	}));

	CTR.Decryptor = Encryptor;

	return CTR;
})();
