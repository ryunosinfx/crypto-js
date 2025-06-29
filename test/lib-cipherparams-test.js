YUI.add(
	'lib-cipherparams-test',
	Y => {
		const C = CryptoJS;
		const data = {};

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'CipherParams',

				setUp: () => {
					data.ciphertext = C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f');
					data.key = C.enc.Hex.parse('101112131415161718191a1b1c1d1e1f');
					data.iv = C.enc.Hex.parse('202122232425262728292a2b2c2d2e2f');
					data.salt = C.enc.Hex.parse('0123456789abcdef');
					data.algorithm = C.algo.AES;
					data.mode = C.mode.CBC;
					data.padding = C.pad.PKCS7;
					data.blockSize = data.algorithm.blockSize;
					data.formatter = C.format.OpenSSL;

					data.cipherParams = C.lib.CipherParams.create({
						ciphertext: data.ciphertext,
						key: data.key,
						iv: data.iv,
						salt: data.salt,
						algorithm: data.algorithm,
						mode: data.mode,
						padding: data.padding,
						blockSize: data.blockSize,
						formatter: data.formatter,
					});
				},

				testInit: () => {
					Y.Assert.areEqual(data.ciphertext, data.cipherParams.ciphertext);
					Y.Assert.areEqual(data.key, data.cipherParams.key);
					Y.Assert.areEqual(data.iv, data.cipherParams.iv);
					Y.Assert.areEqual(data.salt, data.cipherParams.salt);
					Y.Assert.areEqual(data.algorithm, data.cipherParams.algorithm);
					Y.Assert.areEqual(data.mode, data.cipherParams.mode);
					Y.Assert.areEqual(data.padding, data.cipherParams.padding);
					Y.Assert.areEqual(data.blockSize, data.cipherParams.blockSize);
					Y.Assert.areEqual(data.formatter, data.cipherParams.formatter);
				},

				testToString0: () =>
					Y.Assert.areEqual(C.format.OpenSSL.stringify(data.cipherParams), data.cipherParams.toString()),
				testToString1: () => {
					const JsonFormatter = {
						stringify: cipherParams =>
							'{ ct: ' + cipherParams.ciphertext + ', iv: ' + cipherParams.iv + ' }',
					};

					Y.Assert.areEqual(
						JsonFormatter.stringify(data.cipherParams),
						data.cipherParams.toString(JsonFormatter)
					);
				},
			})
		);
	},
	'$Rev$'
);
