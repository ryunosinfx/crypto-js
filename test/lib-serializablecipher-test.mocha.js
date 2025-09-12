import { TestConfig } from './test-config.js';
const module = await import(TestConfig.CryptoJSPath);
const CryptoJS = module.CryptoJS;
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

export class UnitTestSerializableCipher {
	static C = C;
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
		describe('lib-serializablecipher-test', function () {
			describe('SerializableCipher', function () {
				beforeEach(() => {
					data.message = new C.lib.WordArray([0x00010203, 0x04050607, 0x08090a0b, 0x0c0d0e0f]);
					data.key = new C.lib.WordArray([0x10111213, 0x14151617, 0x18191a1b, 0x1c1d1e1f]);
					data.iv = new C.lib.WordArray([0x20212223, 0x24252627, 0x28292a2b, 0x2c2d2e2f]);
				});

				it('testEncrypt', () => {
					// Compute expected
					const aes = C.algo.AES.createEncryptor(data.key, { iv: data.iv });
					const ciphertext = aes.finalize(data.message);
					const expected = new C.lib.CipherParams({
						ciphertext: ciphertext,
						key: data.key,
						iv: data.iv,
						algorithm: C.algo.AES,
						mode: aes.cfg.mode,
						padding: aes.cfg.padding,
						blockSize: aes.blockSize,
						formatter: C.format.OpenSSL,
					});

					// Compute actual
					const actual = C.lib.SerializableCipher.encrypt(C.algo.AES, data.message, data.key, {
						iv: data.iv,
					});
					// Test
					assert.equal(expected.toString(), actual.toString());
					assert.equal(expected.ciphertext.toString(), actual.ciphertext.toString());
					assert.equal(expected.key.toString(), actual.key.toString());
					assert.equal(expected.iv.toString(), actual.iv.toString());
					assert.equal(expected.algorithm, actual.algorithm);
					assert.equal(expected.mode, actual.mode);
					assert.equal(expected.padding, actual.padding);
					assert.equal(expected.blockSize, actual.blockSize);
				});

				it('testDecrypt', () => {
					const encrypted =
						C.lib.SerializableCipher.encrypt(C.algo.AES, data.message, data.key, {
							iv: data.iv,
						}) + '';
					const decrypted = C.lib.SerializableCipher.decrypt(C.algo.AES, encrypted, data.key, {
						iv: data.iv,
					});

					assert.equal(data.message.toString(), decrypted.toString());
				});
			});
		});
	}
}
