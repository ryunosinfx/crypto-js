YUI.add(
	'lib-passwordbasedcipher-test',
	Y => {
		const C = CryptoJS;

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'PasswordBasedCipher',

				testEncrypt: () => {
					// Compute actual
					const actual = C.lib.PasswordBasedCipher.encrypt(C.algo.AES, 'Hello, World!', 'password');

					// Compute expected
					const aes = C.algo.AES.createEncryptor(actual.key, { iv: actual.iv });
					const expected = aes.finalize('Hello, World!');

					Y.Assert.areEqual(expected.toString(), actual.ciphertext.toString());
				},

				testDecrypt: () => {
					const ciphertext = C.lib.PasswordBasedCipher.encrypt(C.algo.AES, 'Hello, World!', 'password');
					const plaintext = C.lib.PasswordBasedCipher.decrypt(C.algo.AES, ciphertext, 'password');

					Y.Assert.areEqual('Hello, World!', plaintext.toString(C.enc.Utf8));
				},
			})
		);
	},
	'$Rev$'
);
