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

export class UnitTestDES {
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
		describe('algo-des-test', function () {
			describe('DES', function () {
				it('testEncrypt1', () =>
					assert.equal(
						'95a8d72813daa94d',
						C.DES.encrypt(C.enc.Hex.parse('0000000000000000'), C.enc.Hex.parse('8000000000000000'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).ciphertext.toString()
					));
				it('testEncrypt2', () =>
					assert.equal(
						'1de5279dae3bed6f',
						C.DES.encrypt(C.enc.Hex.parse('0000000000000000'), C.enc.Hex.parse('0000000000002000'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).ciphertext.toString()
					));
				it('testEncrypt3', () =>
					assert.equal(
						'1d1ca853ae7c0c5f',
						C.DES.encrypt(C.enc.Hex.parse('0000000000002000'), C.enc.Hex.parse('0000000000000000'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).ciphertext.toString()
					));
				it('testEncrypt4', () =>
					assert.equal(
						'ac978c247863388f',
						C.DES.encrypt(C.enc.Hex.parse('3232323232323232'), C.enc.Hex.parse('3232323232323232'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).ciphertext.toString()
					));
				it('testEncrypt5', () =>
					assert.equal(
						'3af1703d76442789',
						C.DES.encrypt(C.enc.Hex.parse('6464646464646464'), C.enc.Hex.parse('6464646464646464'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).ciphertext.toString()
					));
				it('testEncrypt6', () =>
					assert.equal(
						'a020003c5554f34c',
						C.DES.encrypt(C.enc.Hex.parse('9696969696969696'), C.enc.Hex.parse('9696969696969696'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).ciphertext.toString()
					));
				it('testDecrypt1', () =>
					assert.equal(
						'0000000000000000',
						C.DES.decrypt(
							new C.lib.CipherParams({ ciphertext: C.enc.Hex.parse('95a8d72813daa94d') }),
							C.enc.Hex.parse('8000000000000000'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testDecrypt2', () =>
					assert.equal(
						'0000000000000000',
						C.DES.decrypt(
							new C.lib.CipherParams({ ciphertext: C.enc.Hex.parse('1de5279dae3bed6f') }),
							C.enc.Hex.parse('0000000000002000'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testDecrypt3', () =>
					assert.equal(
						'0000000000002000',
						C.DES.decrypt(
							new C.lib.CipherParams({ ciphertext: C.enc.Hex.parse('1d1ca853ae7c0c5f') }),
							C.enc.Hex.parse('0000000000000000'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testDecrypt4', () =>
					assert.equal(
						'3232323232323232',
						C.DES.decrypt(
							new C.lib.CipherParams({ ciphertext: C.enc.Hex.parse('ac978c247863388f') }),
							C.enc.Hex.parse('3232323232323232'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testDecrypt5', () =>
					assert.equal(
						'6464646464646464',
						C.DES.decrypt(
							new C.lib.CipherParams({ ciphertext: C.enc.Hex.parse('3af1703d76442789') }),
							C.enc.Hex.parse('6464646464646464'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testDecrypt6', () =>
					assert.equal(
						'9696969696969696',
						C.DES.decrypt(
							new C.lib.CipherParams({ ciphertext: C.enc.Hex.parse('a020003c5554f34c') }),
							C.enc.Hex.parse('9696969696969696'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testMultiPart', () => {
					const des = C.algo.DES.createEncryptor(C.enc.Hex.parse('0123456789abcdef'), {
						mode: C.mode.ECB,
						padding: C.pad.NoPadding,
					});
					const ciphertext1 = des.process(C.enc.Hex.parse('001122334455'));
					const ciphertext2 = des.process(C.enc.Hex.parse('66778899aa'));
					const ciphertext3 = des.process(C.enc.Hex.parse('bbccddeeff'));
					const ciphertext4 = des.finalize();

					assert.equal(
						C.DES.encrypt(
							C.enc.Hex.parse('00112233445566778899aabbccddeeff'),
							C.enc.Hex.parse('0123456789abcdef'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).ciphertext.toString(),
						ciphertext1.concat(ciphertext2).concat(ciphertext3).concat(ciphertext4).toString()
					);
				});

				it('testInputIntegrity', () => {
					const message = C.enc.Hex.parse('00112233445566778899aabbccddeeff');
					const key = C.enc.Hex.parse('0001020304050607');
					const iv = C.enc.Hex.parse('08090a0b0c0d0e0f');

					const expectedMessage = message.toString();
					const expectedKey = key.toString();
					const expectedIv = iv.toString();

					C.DES.encrypt(message, key, { iv: iv });

					assert.equal(expectedMessage, message.toString());
					assert.equal(expectedKey, key.toString());
					assert.equal(expectedIv, iv.toString());
				});

				it('testHelper', () => {
					// Save original random method
					const random = C.lib.WordArray.random;

					// Replace random method with one that returns a predictable value
					C.lib.WordArray.random = nBytes => {
						const words = [];
						for (let i = 0; i < nBytes; i += 4) words.push([0x11223344]);
						return new C.lib.WordArray(words, nBytes);
					};

					// Test
					assert.equal(
						C.algo.DES.createEncryptor(C.SHA256('Jefe'), { mode: C.mode.ECB, padding: C.pad.NoPadding })
							.finalize('Hi There')
							.toString(),
						C.DES.encrypt('Hi There', C.SHA256('Jefe'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).ciphertext.toString()
					);
					assert.equal(
						C.lib.SerializableCipher.encrypt(C.algo.DES, 'Hi There', C.SHA256('Jefe'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).toString(),
						C.DES.encrypt('Hi There', C.SHA256('Jefe'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).toString()
					);
					assert.equal(
						C.lib.PasswordBasedCipher.encrypt(C.algo.DES, 'Hi There', 'Jefe', {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).toString(),
						C.DES.encrypt('Hi There', 'Jefe', { mode: C.mode.ECB, padding: C.pad.NoPadding }).toString()
					);

					// Restore random method
					C.lib.WordArray.random = random;
				});
			});
		});
	}
}
