YUI.add(
	'lib-serializablecipher-test',
	Y => {
		const C = CryptoJS;
		const data = {};

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'SerializableCipher',

				setUp: () => {
					data.message = C.lib.WordArray.create([0x00010203, 0x04050607, 0x08090a0b, 0x0c0d0e0f]);
					data.key = C.lib.WordArray.create([0x10111213, 0x14151617, 0x18191a1b, 0x1c1d1e1f]);
					data.iv = C.lib.WordArray.create([0x20212223, 0x24252627, 0x28292a2b, 0x2c2d2e2f]);
				},

				testEncrypt() {
					// Compute expected
					const aes = C.algo.AES.createEncryptor(data.key, { iv: data.iv });
					const ciphertext = aes.finalize(data.message);
					const expected = C.lib.CipherParams.create({
						ciphertext: ciphertext,
						key: data.key,
						iv: data.iv,
						algorithm: C.algo.AES,
						mode: aes.cfg.mode,
						padding: aes.cfg.padding,
						blockSize: aes.blockSize,
						formatter: C.format.OpenSSL,
					});

					// Compute actual
					const actual = C.lib.SerializableCipher.encrypt(C.algo.AES, data.message, data.key, {
						iv: data.iv,
					});

					// Test
					Y.Assert.areEqual(expected.toString(), actual.toString());
					Y.Assert.areEqual(expected.ciphertext.toString(), actual.ciphertext.toString());
					Y.Assert.areEqual(expected.key.toString(), actual.key.toString());
					Y.Assert.areEqual(expected.iv.toString(), actual.iv.toString());
					Y.Assert.areEqual(expected.algorithm, actual.algorithm);
					Y.Assert.areEqual(expected.mode, actual.mode);
					Y.Assert.areEqual(expected.padding, actual.padding);
					Y.Assert.areEqual(expected.blockSize, actual.blockSize);
				},

				testDecrypt() {
					const encrypted =
						C.lib.SerializableCipher.encrypt(C.algo.AES, data.message, data.key, {
							iv: data.iv,
						}) + '';
					const decrypted = C.lib.SerializableCipher.decrypt(C.algo.AES, encrypted, data.key, {
						iv: data.iv,
					});

					Y.Assert.areEqual(data.message.toString(), decrypted.toString());
				},
			})
		);
	},
	'$Rev$'
);
