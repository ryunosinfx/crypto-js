/** @preserve
 * Counter block mode compatible with  Dr Brian Gladman fileenc.c
 * derived from CryptoJS.mode.CTR
 * Jan Hruby jhruby.web@gmail.com
 */
CryptoJS.mode.CTRGladman = (function () {
	const CTRGladman = CryptoJS.lib.BlockCipherMode.extend();

	const incWord = word => {
		if (((word >> 24) & 0xff) === 0xff) {
			//overflow
			let b1 = (word >> 16) & 0xff;
			let b2 = (word >> 8) & 0xff;
			let b3 = word & 0xff;
			if (b1 === 0xff) {
				b1 = 0; // overflow b1
				if (b2 === 0xff) {
					b2 = 0;
					if (b3 === 0xff) b3 = 0;
					else ++b3;
				} else ++b2;
			} else ++b1;
			word = 0;
			word += b1 << 16;
			word += b2 << 8;
			word += b3;
		} else word += 0x01 << 24;
		return word;
	};

	const incCounter = counter => {
		if ((counter[0] = incWord(counter[0])) === 0) counter[1] = incWord(counter[1]); // encr_data in fileenc.c from  Dr Brian Gladman's counts only with DWORD j < 8
		return counter;
	};

	const Encryptor = (CTRGladman.Encryptor = CTRGladman.extend({
		processBlock: function (words, offset) {
			const cipher = this._cipher; // Shortcuts
			const blockSize = cipher.blockSize; // Shortcuts
			const iv = this._iv; // Shortcuts
			const counter = iv ? (this._counter = iv.slice(0)) : this._counter; // Generate keystream// encr_data in fileenc.c from  Dr Brian Gladman's counts only with DWORD j < 8
			if (iv) this._iv = undefined; // Remove IV for subsequent blocks
			incCounter(counter);
			const keystream = counter.slice(0);
			cipher.encryptBlock(keystream, 0);
			for (let i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i]; // Encrypt
		},
	}));

	CTRGladman.Decryptor = Encryptor;

	return CTRGladman;
})();
