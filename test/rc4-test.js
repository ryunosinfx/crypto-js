YUI.add(
	'algo-rc4-test',
	Y => {
		const C = CryptoJS;

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'RC4',

				testVector1: () =>
					Y.Assert.areEqual(
						'7494c2e7104b0879',
						C.RC4.encrypt(
							C.enc.Hex.parse('0000000000000000'),
							C.enc.Hex.parse('0123456789abcdef')
						).ciphertext.toString()
					),
				testVector2: () =>
					Y.Assert.areEqual(
						'f13829c9de',
						C.RC4.encrypt(
							C.enc.Hex.parse('dcee4cf92c'),
							C.enc.Hex.parse('618a63d2fb')
						).ciphertext.toString()
					),
				testDrop: () =>
					Y.Assert.areEqual(
						C.RC4.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('0123456789abcdef')
						)
							.ciphertext.toString()
							.substr(16),
						C.RC4Drop.encrypt(C.enc.Hex.parse('0000000000000000'), C.enc.Hex.parse('0123456789abcdef'), {
							drop: 2,
						}).ciphertext.toString()
					),
				testMultiPart: () => {
					const rc4 = C.algo.RC4.createEncryptor(C.enc.Hex.parse('0123456789abcdef'));
					const ciphertext1 = rc4.process(C.enc.Hex.parse('00000000'));
					const ciphertext2 = rc4.process(C.enc.Hex.parse('0000'));
					const ciphertext3 = rc4.process(C.enc.Hex.parse('0000'));
					const ciphertext4 = rc4.finalize();
					Y.Assert.areEqual(
						'7494c2e7104b0879',
						ciphertext1.concat(ciphertext2).concat(ciphertext3).concat(ciphertext4).toString()
					);
				},
				testInputIntegrity: () => {
					const message = C.enc.Hex.parse('0000000000000000');
					const key = C.enc.Hex.parse('0123456789abcdef');
					const expectedMessage = message.toString();
					const expectedKey = key.toString();
					C.RC4.encrypt(message, key);
					Y.Assert.areEqual(expectedMessage, message.toString());
					Y.Assert.areEqual(expectedKey, key.toString());
				},
				testHelper: () => {
					// Save original random method
					const random = C.lib.WordArray.random;

					// Replace random method with one that returns a predictable value
					C.lib.WordArray.random = nBytes => {
						const words = [];
						for (let i = 0; i < nBytes; i += 4) words.push([0x11223344]);
						return C.lib.WordArray.create(words, nBytes);
					};

					// Test
					Y.Assert.areEqual(
						C.algo.RC4.createEncryptor(C.SHA256('Jefe')).finalize('Hi There').toString(),
						C.RC4.encrypt('Hi There', C.SHA256('Jefe')).ciphertext.toString()
					);
					Y.Assert.areEqual(
						C.lib.SerializableCipher.encrypt(C.algo.RC4, 'Hi There', C.SHA256('Jefe')).toString(),
						C.RC4.encrypt('Hi There', C.SHA256('Jefe')).toString()
					);
					Y.Assert.areEqual(
						C.lib.PasswordBasedCipher.encrypt(C.algo.RC4, 'Hi There', 'Jefe').toString(),
						C.RC4.encrypt('Hi There', 'Jefe').toString()
					);

					// Restore random method
					C.lib.WordArray.random = random;
				},
			})
		);
	},
	'$Rev$'
);
