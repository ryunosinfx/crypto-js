YUI.add(
	'config-test',
	Y => {
		const C = CryptoJS;
		const data = {};

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'Config',

				setUp: () => {
					data.saltA = CryptoJS.enc.Hex.parse('AA00000000000000');
					data.saltB = CryptoJS.enc.Hex.parse('BB00000000000000');
				},

				testEncrypt: () => {
					Y.Assert.areEqual(
						C.AES.encrypt('Test', 'Pass', { salt: data.saltA }).toString(),
						C.AES.encrypt('Test', 'Pass', { salt: data.saltA }).toString()
					);
					Y.Assert.areNotEqual(
						C.AES.encrypt('Test', 'Pass', { salt: data.saltA }).toString(),
						C.AES.encrypt('Test', 'Pass', { salt: data.saltB }).toString()
					);
				},

				testDecrypt: () => {
					const encryptedA = C.AES.encrypt('Test', 'Pass', { salt: data.saltA });
					const encryptedB = C.AES.encrypt('Test', 'Pass', { salt: data.saltB });
					Y.Assert.areEqual('Test', C.AES.decrypt(encryptedA, 'Pass').toString(C.enc.Utf8));
					Y.Assert.areEqual('Test', C.AES.decrypt(encryptedB, 'Pass').toString(C.enc.Utf8));
				},

				testCustomKDFHasher: () => {
					//SHA1
					const encryptedSHA1 = C.AES.encrypt('Test', 'Pass', {
						salt: data.saltA,
						hasher: C.algo.SHA1,
					}).toString();
					Y.Assert.areEqual(
						'Test',
						C.AES.decrypt(encryptedSHA1, 'Pass', { hasher: C.algo.SHA1 }).toString(C.enc.Utf8)
					);

					//SHA256
					const encryptedSHA256 = C.AES.encrypt('Test', 'Pass', {
						salt: data.saltA,
						hasher: C.algo.SHA256,
					}).toString();
					Y.Assert.areEqual(
						'Test',
						C.AES.decrypt(encryptedSHA256, 'Pass', { hasher: C.algo.SHA256 }).toString(C.enc.Utf8)
					);

					//SHA512
					const encryptedSHA512 = C.AES.encrypt('Test', 'Pass', {
						salt: data.saltA,
						hasher: C.algo.SHA512,
					}).toString();
					Y.Assert.areEqual(
						'Test',
						C.AES.decrypt(encryptedSHA512, 'Pass', { hasher: C.algo.SHA512 }).toString(C.enc.Utf8)
					);

					//Default: MD5
					const encryptedDefault = C.AES.encrypt('Test', 'Pass', { salt: data.saltA }).toString();
					const encryptedMD5 = C.AES.encrypt('Test', 'Pass', {
						salt: data.saltA,
						hasher: C.algo.MD5,
					}).toString();
					Y.Assert.areEqual(
						'Test',
						C.AES.decrypt(encryptedMD5, 'Pass', { hasher: C.algo.MD5 }).toString(C.enc.Utf8)
					);
					Y.Assert.areEqual(encryptedDefault, encryptedMD5);

					//Different KDFHasher
					Y.Assert.areNotEqual(encryptedDefault, encryptedSHA1);
					Y.Assert.areNotEqual(encryptedDefault, encryptedSHA256);
					Y.Assert.areNotEqual(encryptedDefault, encryptedSHA512);
				},
			})
		);
	},
	'$Rev$'
);
