YUI.add(
	'algo-sha256-profile',
	Y => {
		const C = CryptoJS;

		Y.Profiler.add({
			name: 'SHA256',

			profileSinglePartMessage: () => {
				let singlePartMessage = '';
				for (let i = 0; i < 500; i++) singlePartMessage += '12345678901234567890123456789012345678901234567890';
				C.algo.SHA256.create().finalize(singlePartMessage) + '';
			},
			profileMultiPartMessage: () => {
				const sha256 = C.algo.SHA256.create();
				for (let i = 0; i < 500; i++) sha256.update('12345678901234567890123456789012345678901234567890');
				sha256.finalize() + '';
			},
		});
	},
	'$Rev$'
);
