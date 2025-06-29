YUI.add(
	'algo-aes-profile',
	Y => {
		const C = CryptoJS;
		const data = {};

		Y.Profiler.add({
			name: 'AES',

			setUp: () => {
				data.key = C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
				data.iv = C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f');
			},

			profileSinglePartMessage: () => {
				const singlePartMessage = [];
				for (let i = 0; i < 500; i++)
					singlePartMessage.push('12345678901234567890123456789012345678901234567890');
				C.algo.AES.createEncryptor(data.key, { iv: data.iv }).finalize(singlePartMessage.join('')) + '';
			},

			profileMultiPartMessage: () => {
				const aes = C.algo.AES.createEncryptor(data.key, { iv: data.iv });
				for (let i = 0; i < 500; i++) aes.process('12345678901234567890123456789012345678901234567890') + '';
				aes.finalize() + '';
			},
		});
	},
	'$Rev$'
);
