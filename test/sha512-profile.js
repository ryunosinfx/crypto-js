YUI.add(
	'algo-sha512-profile',
	Y => {
		const C = CryptoJS;

		Y.Profiler.add({
			name: 'SHA512',

			profileSinglePartMessage: () => {
				let singlePartMessage = '';
				for (let i = 0; i < 500; i++) singlePartMessage += '12345678901234567890123456789012345678901234567890';
				C.algo.SHA512.create().finalize(singlePartMessage) + '';
			},

			profileMultiPartMessage: () => {
				const sha512 = C.algo.SHA512.create();
				for (let i = 0; i < 500; i++) sha512.update('12345678901234567890123456789012345678901234567890');
				sha512.finalize() + '';
			},
		});
	},
	'$Rev$'
);
