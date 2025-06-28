const data = {};
YUI.add(
	'algo-hmac-md5-profile',
	Y => {
		const C = CryptoJS;

		Y.Profiler.add({
			name: 'HMAC MD5',

			setUp: () => {
				data.key = C.lib.WordArray.random(128 / 8);
			},

			profileSinglePartMessage: () => {
				const singlePartMessage = '';
				for (let i = 0; i < 500; i++) singlePartMessage += '12345678901234567890123456789012345678901234567890';
				C.algo.HMAC.create(C.algo.MD5, data.key).finalize(singlePartMessage) + '';
			},

			profileMultiPartMessage: () => {
				const hmac = C.algo.HMAC.create(C.algo.MD5, data.key);
				for (let i = 0; i < 500; i++) hmac.update('12345678901234567890123456789012345678901234567890');
				hmac.finalize() + '';
			},
		});
	},
	'$Rev$'
);
