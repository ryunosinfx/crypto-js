import { CryptoJS } from '../src/crypto.js';
const o = {
	describe: 'describe',
	it: 'it',
	before: 'before',
	after: 'after',
	beforeEach: 'beforeEach',
	afterEach: 'afterEach',
	expect: 'expect',
	should: 'should',
	assertEqual: 'assertEqual',
};
let chai = null;
let mocha = null;
let assert = null;
const C = CryptoJS;

export class UnitTestEvpKDF {
	static init(chaiM, mochaM, describeM, itM, beforeM, afterM, beforeEachM, afterEachM) {
		if (chaiM) {
			chai = chaiM;
			mocha = mochaM;
			o.it = itM;
			o.describe = describeM;
			o.before = beforeM;
			o.after = afterM;
			o.beforeEach = beforeEachM;
			o.afterEach = afterEachM;
			assert = chai.assert;
			return;
		}
	}
	static run() {
		const describe = o.describe,
			it = o.it;
		describe('algo-evpkdf-test', function () {
			describe('EvpKDF', function () {
				it('testVector', () =>
					assert.equal(
						'fdbdf3419fff98bdb0241390f62a9db35f4aba29d77566377997314ebfc709f20b5ca7b1081f94b1ac12e3c8ba87d05a',
						C.EvpKDF('password', 'saltsalt', { keySize: (256 + 128) / 32 }).toString()
					));
				// There are no official test vectors that I could find, and the EVP implementation is short on comments.
				// Need to use the C code to generate more test vectors.
				// The iteration count in particular needs to be tested.

				it('testInputIntegrity', () => {
					const password = new C.lib.WordArray([0x12345678]);
					const salt = new C.lib.WordArray([0x12345678]);

					const expectedPassword = password.toString();
					const expectedSalt = salt.toString();

					C.EvpKDF(password, salt);

					assert.equal(expectedPassword, password.toString());
					assert.equal(expectedSalt, salt.toString());
				});

				it('testHelper', () =>
					assert.equal(
						new C.algo.EvpKDF({ keySize: (256 + 128) / 32 }).compute('password', 'saltsalt').toString(),
						C.EvpKDF('password', 'saltsalt', { keySize: (256 + 128) / 32 }).toString()
					));
			});
		});
	}
}
