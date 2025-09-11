import { CryptoJS } from '../../src/united/crypto.js';
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

export class UnitTestPasswordBasedCipher {
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
		describe('lib-passwordbasedcipher-test', function () {
			describe('PasswordBasedCipher', function () {
				it('testEncrypt', () => {
					// Compute actual
					const actual = C.lib.PasswordBasedCipher.encrypt(C.algo.AES, 'Hello, World!', 'password');

					// Compute expected
					const aes = C.algo.AES.createEncryptor(actual.key, { iv: actual.iv });
					const expected = aes.finalize('Hello, World!');

					assert.equal(expected.toString(), actual.ciphertext.toString());
				});

				it('testDecrypt', () => {
					const ciphertext = C.lib.PasswordBasedCipher.encrypt(C.algo.AES, 'Hello, World!', 'password');
					const plaintext = C.lib.PasswordBasedCipher.decrypt(C.algo.AES, ciphertext, 'password');

					assert.equal('Hello, World!', plaintext.toString(C.enc.Utf8));
				});
			});
		});
	}
}
