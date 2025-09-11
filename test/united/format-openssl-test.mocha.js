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

export class UnitTestOpenSSLFormatter {
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
			it = o.it,
			beforeEach = o.beforeEach,
			data = {};
		describe('format-openssl-test', function () {
			describe('OpenSSLFormatter', function () {
				beforeEach(() => {
					data.ciphertext = new C.lib.WordArray([0x00010203, 0x04050607, 0x08090a0b, 0x0c0d0e0f]);
					data.salt = new C.lib.WordArray([0x01234567, 0x89abcdef]);
				});

				it('testSaltedToString', () =>
					assert.equal(
						C.enc.Latin1.parse('Salted__').concat(data.salt).concat(data.ciphertext).toString(C.enc.Base64),
						C.format.OpenSSL.stringify(
							new C.lib.CipherParams({ ciphertext: data.ciphertext, salt: data.salt })
						)
					));
				it('testUnsaltedToString', () =>
					assert.equal(
						data.ciphertext.toString(C.enc.Base64),
						C.format.OpenSSL.stringify(new C.lib.CipherParams({ ciphertext: data.ciphertext }))
					));
				it('testSaltedFromString', () => {
					const openSSLStr = C.format.OpenSSL.stringify(
						new C.lib.CipherParams({ ciphertext: data.ciphertext, salt: data.salt })
					);
					const cipherParams = C.format.OpenSSL.parse(openSSLStr);

					assert.equal(data.ciphertext.toString(), cipherParams.ciphertext.toString());
					assert.equal(data.salt.toString(), cipherParams.salt.toString());
				});

				it('testUnsaltedFromString', () => {
					const openSSLStr = C.format.OpenSSL.stringify(
						new C.lib.CipherParams({ ciphertext: data.ciphertext })
					);
					const cipherParams = C.format.OpenSSL.parse(openSSLStr);

					assert.equal(data.ciphertext.toString(), cipherParams.ciphertext.toString());
				});
			});
		});
	}
}
