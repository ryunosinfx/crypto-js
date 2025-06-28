const data = {};
YUI.add(
	'format-openssl-test',
	Y => {
		const C = CryptoJS;

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'OpenSSLFormatter',

				setUp: () => {
					data.ciphertext = C.lib.WordArray.create([0x00010203, 0x04050607, 0x08090a0b, 0x0c0d0e0f]);
					data.salt = C.lib.WordArray.create([0x01234567, 0x89abcdef]);
				},

				testSaltedToString: () =>
					Y.Assert.areEqual(
						C.enc.Latin1.parse('Salted__').concat(data.salt).concat(data.ciphertext).toString(C.enc.Base64),
						C.format.OpenSSL.stringify(
							C.lib.CipherParams.create({ ciphertext: data.ciphertext, salt: data.salt })
						)
					),
				testUnsaltedToString: () =>
					Y.Assert.areEqual(
						data.ciphertext.toString(C.enc.Base64),
						C.format.OpenSSL.stringify(C.lib.CipherParams.create({ ciphertext: data.ciphertext }))
					),
				testSaltedFromString: () => {
					const openSSLStr = C.format.OpenSSL.stringify(
						C.lib.CipherParams.create({ ciphertext: data.ciphertext, salt: data.salt })
					);
					const cipherParams = C.format.OpenSSL.parse(openSSLStr);

					Y.Assert.areEqual(data.ciphertext.toString(), cipherParams.ciphertext.toString());
					Y.Assert.areEqual(data.salt.toString(), cipherParams.salt.toString());
				},

				testUnsaltedFromString: () => {
					const openSSLStr = C.format.OpenSSL.stringify(
						C.lib.CipherParams.create({ ciphertext: data.ciphertext })
					);
					const cipherParams = C.format.OpenSSL.parse(openSSLStr);

					Y.Assert.areEqual(data.ciphertext.toString(), cipherParams.ciphertext.toString());
				},
			})
		);
	},
	'$Rev$'
);
