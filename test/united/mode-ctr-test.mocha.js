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

export class UnitTestCTR {
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
		describe('mode-ctr-test', function () {
			describe('CTR', function () {
				beforeEach(() => {
					data.message = new C.lib.WordArray([
						0x00010203, 0x04050607, 0x08090a0b, 0x0c0d0e0f, 0x10111213, 0x14151617, 0x18191a1b, 0x1c1d1e1f,
					]);
					data.key = new C.lib.WordArray([0x20212223, 0x24252627, 0x28292a2b, 0x2c2d2e2f]);
					data.iv = new C.lib.WordArray([0x30313233, 0x34353637, 0x38393a3b, 0x3c3d3e3f]);
				});

				it('testEncryptor', () => {
					// Compute expected
					const expected = data.message.clone();
					const aes = C.algo.AES.createEncryptor(data.key);

					// Counter initialized with IV
					const counter = data.iv.words.slice(0);

					// First block XORed with encrypted counter
					const keystream1 = counter.slice(0);
					aes.encryptBlock(keystream1, 0);
					for (let i = 0; i < 4; i++) expected.words[i] ^= keystream1[i];

					// Subsequent blocks XORed with encrypted incremented counter
					counter[3]++;
					const keystream2 = counter.slice(0);
					aes.encryptBlock(keystream2, 0);
					for (let i = 4; i < 8; i++) expected.words[i] ^= keystream2[i % 4];

					// Compute actual
					const actual = C.AES.encrypt(data.message, data.key, {
						iv: data.iv,
						mode: C.mode.CTR,
						padding: C.pad.NoPadding,
					}).ciphertext;

					// Test
					assert.equal(expected.toString(), actual.toString());
				});

				it('testDecryptor', () => {
					const encrypted = C.AES.encrypt(data.message, data.key, {
						iv: data.iv,
						mode: C.mode.CTR,
						padding: C.pad.NoPadding,
					});
					const decrypted = C.AES.decrypt(encrypted, data.key, {
						iv: data.iv,
						mode: C.mode.CTR,
						padding: C.pad.NoPadding,
					});

					assert.equal(data.message.toString(), decrypted.toString());
				});
			});
		});
	}
}
