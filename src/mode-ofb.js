/**
 * Output Feedback block mode.
 */
CryptoJS.mode.OFB = (function () {
	const OFB = CryptoJS.lib.BlockCipherMode.extend();
	const Encryptor = (OFB.Encryptor = OFB.extend({
		processBlock: function (words, offset) {
			const cipher = this._cipher; // Shortcuts
			const blockSize = cipher.blockSize; // Shortcuts
			const iv = this._iv; // Shortcuts
			const keystream = iv ? (this._keystream = iv.slice(0)) : this._keystream; // Generate keystream
			if (iv) this._iv = undefined; // Remove IV for subsequent blocks
			cipher.encryptBlock(keystream, 0);
			for (let i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i]; // Encrypt
		},
	}));
	OFB.Decryptor = Encryptor;
	return OFB;
})();
