YUI.add(
	'algo-aes-test',
	Y => {
		const C = CryptoJS;
		const data = {};

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'Blowfish',

				setUp: () => {
					data.saltA = CryptoJS.enc.Hex.parse('AA00000000000000');
				},

				testEncrypt: () => {
					const encryptedA = C.Blowfish.encrypt('Test', 'pass', {
						salt: data.saltA,
						hasher: CryptoJS.algo.SHA256,
					}).toString();
					Y.Assert.areEqual('U2FsdGVkX1+qAAAAAAAAAKTIU8MPrBdH', encryptedA);
				},

				testDecrypt: () => {
					const encryptedA = C.Blowfish.encrypt('Test', 'pass', {
						salt: data.saltA,
						hasher: CryptoJS.algo.SHA256,
					}).toString();
					Y.Assert.areEqual(
						'Test',
						C.Blowfish.decrypt(encryptedA, 'pass', { hasher: CryptoJS.algo.SHA256 }).toString(C.enc.Utf8)
					);
				},
			})
		);
	},
	'$Rev$'
);
