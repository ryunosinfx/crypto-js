YUI.add(
	'algo-evpkdf-profile',
	Y => {
		const C = CryptoJS;

		Y.Profiler.add({
			name: 'EvpKDF',

			profileKeySize256Iterations20: () =>
				C.algo.EvpKDF.create({ keySize: 256 / 32, iterations: 20 }).compute(
					'password',
					'ATHENA.MIT.EDUraeburn'
				),
		});
	},
	'$Rev$'
);
