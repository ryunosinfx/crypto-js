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

export class UnitTestTripleDES {
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
			TripleDES = C.TripleDES;
		describe('algo-tripledes-test', function () {
			describe('TripleDES', function () {
				it('testEncrypt1', () =>
					assert.equal(
						'95a8d72813daa94d',
						C.TripleDES.encrypt(
							C.enc.Hex.parse('0000000000000000'),
							C.enc.Hex.parse('800101010101010180010101010101018001010101010101'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).ciphertext.toString()
					));
				it('testEncrypt2', () =>
					assert.equal(
						'869efd7f9f265a09',
						C.TripleDES.encrypt(
							C.enc.Hex.parse('0000000000000000'),
							C.enc.Hex.parse('010101010101010201010101010101020101010101010102'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).ciphertext.toString()
					));
				it('testEncrypt3', () =>
					assert.equal(
						'95f8a5e5dd31d900',
						C.TripleDES.encrypt(
							C.enc.Hex.parse('8000000000000000'),
							C.enc.Hex.parse('010101010101010101010101010101010101010101010101'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).ciphertext.toString()
					));
				it('testEncrypt4', () =>
					assert.equal(
						'166b40b44aba4bd6',
						C.TripleDES.encrypt(
							C.enc.Hex.parse('0000000000000001'),
							C.enc.Hex.parse('010101010101010101010101010101010101010101010101'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).ciphertext.toString()
					));
				it('testDecrypt1', () =>
					assert.equal(
						'0000000000000000',
						C.TripleDES.decrypt(
							new C.lib.CipherParams({ ciphertext: C.enc.Hex.parse('95a8d72813daa94d') }),
							C.enc.Hex.parse('800101010101010180010101010101018001010101010101'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testDecrypt2', () =>
					assert.equal(
						'0000000000000000',
						C.TripleDES.decrypt(
							new C.lib.CipherParams({ ciphertext: C.enc.Hex.parse('869efd7f9f265a09') }),
							C.enc.Hex.parse('010101010101010201010101010101020101010101010102'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testDecrypt3', () =>
					assert.equal(
						'8000000000000000',
						C.TripleDES.decrypt(
							new C.lib.CipherParams({ ciphertext: C.enc.Hex.parse('95f8a5e5dd31d900') }),
							C.enc.Hex.parse('010101010101010101010101010101010101010101010101'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testDecrypt4', () =>
					assert.equal(
						'0000000000000001',
						C.TripleDES.decrypt(
							new C.lib.CipherParams({ ciphertext: C.enc.Hex.parse('166b40b44aba4bd6') }),
							C.enc.Hex.parse('010101010101010101010101010101010101010101010101'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).toString()
					));
				it('testMultiPart', () => {
					const des = C.algo.TripleDES.createEncryptor(
						C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f1011121314151617'),
						{ mode: C.mode.ECB, padding: C.pad.NoPadding }
					);
					const ciphertext1 = des.process(C.enc.Hex.parse('001122334455'));
					const ciphertext2 = des.process(C.enc.Hex.parse('66778899aa'));
					const ciphertext3 = des.process(C.enc.Hex.parse('bbccddeeff'));
					const ciphertext4 = des.finalize();

					assert.equal(
						C.TripleDES.encrypt(
							C.enc.Hex.parse('00112233445566778899aabbccddeeff'),
							C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f1011121314151617'),
							{ mode: C.mode.ECB, padding: C.pad.NoPadding }
						).ciphertext.toString(),
						ciphertext1.concat(ciphertext2).concat(ciphertext3).concat(ciphertext4).toString()
					);
				});

				it('testInputIntegrity', () => {
					const message = C.enc.Hex.parse('00112233445566778899aabbccddeeff');
					const key = C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f1011121314151617');
					const iv = C.enc.Hex.parse('08090a0b0c0d0e0f');

					const expectedMessage = message.toString();
					const expectedKey = key.toString();
					const expectedIv = iv.toString();

					C.TripleDES.encrypt(message, key, { iv: iv });

					assert.equal(expectedMessage, message.toString());
					assert.equal(expectedKey, key.toString());
					assert.equal(expectedIv, iv.toString());
				});

				it('test64BitKey', () => {
					const message = C.enc.Hex.parse('00112233445566778899aabbccddeeff');
					const key = C.enc.Hex.parse('0011223344556677');
					const extendedKey = C.enc.Hex.parse('001122334455667700112233445566770011223344556677');

					const output1 = C.TripleDES.encrypt(message, key, { mode: C.mode.ECB }).toString();
					const output2 = C.TripleDES.encrypt(message, extendedKey, { mode: C.mode.ECB }).toString();

					assert.equal(output1, output2);
				});

				it('test128BitKey', () => {
					const message = C.enc.Hex.parse('00112233445566778899aabbccddeeff');
					const key = C.enc.Hex.parse('00112233445566778899aabbccddeeff');
					const extendedKey = C.enc.Hex.parse('00112233445566778899aabbccddeeff0011223344556677');

					const output1 = C.TripleDES.encrypt(message, key, { mode: C.mode.ECB }).toString();
					const output2 = C.TripleDES.encrypt(message, extendedKey, { mode: C.mode.ECB }).toString();

					assert.equal(output1, output2);
				});

				it('test256BitKey', () => {
					const message = C.enc.Hex.parse('00112233445566778899aabbccddeeff');
					const key = C.enc.Hex.parse('00112233445566778899aabbccddeeff0112233445566778899aabbccddeeff0');
					const truncatedKey = C.enc.Hex.parse('00112233445566778899aabbccddeeff0112233445566778');

					const output1 = C.TripleDES.encrypt(message, key, { mode: C.mode.ECB }).toString();
					const output2 = C.TripleDES.encrypt(message, truncatedKey, { mode: C.mode.ECB }).toString();

					assert.equal(output1, output2);
				});

				it('testHelper', () => {
					// Save original random method
					const random = C.lib.WordArray.random;

					// Replace random method with one that returns a predictable value
					C.lib.WordArray.random = function (nBytes) {
						const words = [];
						for (let i = 0; i < nBytes; i += 4) words.push([0x11223344]);
						return new C.lib.WordArray(words, nBytes);
					};

					// Test
					assert.equal(
						C.algo.TripleDES.createEncryptor(C.SHA256('Jefe'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						})
							.finalize('Hi There')
							.toString(),
						C.TripleDES.encrypt('Hi There', C.SHA256('Jefe'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).ciphertext.toString()
					);
					assert.equal(
						C.lib.SerializableCipher.encrypt(C.algo.TripleDES, 'Hi There', C.SHA256('Jefe'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).toString(),
						C.TripleDES.encrypt('Hi There', C.SHA256('Jefe'), {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).toString()
					);
					assert.equal(
						C.lib.PasswordBasedCipher.encrypt(C.algo.TripleDES, 'Hi There', 'Jefe', {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).toString(),
						C.TripleDES.encrypt('Hi There', 'Jefe', {
							mode: C.mode.ECB,
							padding: C.pad.NoPadding,
						}).toString()
					);

					// Restore random method
					C.lib.WordArray.random = random;
				});
			});
		});
	}
}
