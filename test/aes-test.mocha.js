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

export class UnitTestAes {
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
			it = o.it;
		describe('algo-aes-test', function () {
			describe('AES', function () {
				it('testEncryptKeySize128', () =>
					assert.equal(
						'69c4e0d86a7b0430d8cdb78070b4c55a',
						C.AES.encrypt(
							C.enc.Hex.parse('00112233445566778899aabbccddeeff'),
							C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).ciphertext.toString()
					));
				it('testEncryptKeySize192', () =>
					assert.equal(
						'dda97ca4864cdfe06eaf70a0ec0d7191',
						C.AES.encrypt(
							C.enc.Hex.parse('00112233445566778899aabbccddeeff'),
							C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f1011121314151617'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).ciphertext.toString()
					));
				it('testEncryptKeySize256', () =>
					assert.equal(
						'8ea2b7ca516745bfeafc49904b496089',
						C.AES.encrypt(
							C.enc.Hex.parse('00112233445566778899aabbccddeeff'),
							C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).ciphertext.toString()
					));
				it('testDecryptKeySize128', () =>
					assert.equal(
						'00112233445566778899aabbccddeeff',
						C.AES.decrypt(
							new C.lib.CipherParams({
								ciphertext: C.enc.Hex.parse('69c4e0d86a7b0430d8cdb78070b4c55a'),
							}),
							C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testDecryptKeySize192', () =>
					assert.equal(
						'00112233445566778899aabbccddeeff',
						C.AES.decrypt(
							new C.lib.CipherParams({
								ciphertext: C.enc.Hex.parse('dda97ca4864cdfe06eaf70a0ec0d7191'),
							}),
							C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f1011121314151617'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testDecryptKeySize256', () =>
					assert.equal(
						'00112233445566778899aabbccddeeff',
						C.AES.decrypt(
							new C.lib.CipherParams({
								ciphertext: C.enc.Hex.parse('8ea2b7ca516745bfeafc49904b496089'),
							}),
							C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testMultiPart', () => {
					const aes = C.algo.AES.createEncryptor(C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f'), {
						mode: C.mode.ECB,
						padding: C.pad.NoPadding,
					});
					const ciphertext1 = aes.process(C.enc.Hex.parse('001122334455'));
					const ciphertext2 = aes.process(C.enc.Hex.parse('66778899aa'));
					const ciphertext3 = aes.process(C.enc.Hex.parse('bbccddeeff'));
					const ciphertext4 = aes.finalize();

					assert.equal(
						'69c4e0d86a7b0430d8cdb78070b4c55a',
						ciphertext1.concat(ciphertext2).concat(ciphertext3).concat(ciphertext4).toString()
					);
				});

				it('testInputIntegrity', () => {
					const message = C.enc.Hex.parse('00112233445566778899aabbccddeeff');
					const key = C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f');
					const iv = C.enc.Hex.parse('101112131415161718191a1b1c1d1e1f');

					const expectedMessage = message.toString();
					const expectedKey = key.toString();
					const expectedIv = iv.toString();

					C.AES.encrypt(message, key, { iv: iv });

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
						C.algo.AES.createEncryptor(C.SHA256('Jefe'), { mode: C.mode.ECB, padding: C.pad.NoPadding })
							.finalize('Hi There')
							.toString(),
						C.AES.encrypt('Hi There', C.SHA256('Jefe'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).ciphertext.toString()
					);
					assert.equal(
						C.lib.SerializableCipher.encrypt(C.algo.AES, 'Hi There', C.SHA256('Jefe'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).toString(),
						C.AES.encrypt('Hi There', C.SHA256('Jefe'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).toString()
					);
					assert.equal(
						C.lib.PasswordBasedCipher.encrypt(C.algo.AES, 'Hi There', 'Jefe', {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).toString(),
						C.AES.encrypt('Hi There', 'Jefe', { mode: C.mode.ECB, padding: C.pad.NoPadding }).toString()
					);

					// Restore random method
					C.lib.WordArray.random = random;
				});
			});
		});
	}
}
