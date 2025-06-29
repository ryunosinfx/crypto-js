YUI.add(
	'algo-rc4-profile',
	Y => {
		const C = CryptoJS;
		const data = {};

		Y.Profiler.add({
			name: 'RC4',

			setUp: () => {
				data.key = C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f');
			},
			profileSinglePartMessage: () => {
				const singlePartMessage = '';
				for (let i = 0; i < 500; i++) singlePartMessage += '12345678901234567890123456789012345678901234567890';
				C.algo.RC4.createEncryptor(data.key).finalize(singlePartMessage) + '';
			},
			profileMultiPartMessage: () => {
				const rc4 = C.algo.RC4.createEncryptor(data.key);
				for (let i = 0; i < 500; i++) rc4.process('12345678901234567890123456789012345678901234567890') + '';
				rc4.finalize() + '';
			},
		});
	},
	'$Rev$'
);
