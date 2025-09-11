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

export class UnitTestRC4 {
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
		describe('algo-rc4-test', function () {
			describe('RC4', function () {
				it('testVector1', () =>
					assert.equal(
						'7494c2e7104b0879',
						C.RC4.encrypt(
							C.enc.Hex.parse('0000000000000000'),
							C.enc.Hex.parse('0123456789abcdef')
						).ciphertext.toString()
					));
				it('testVector2', () =>
					assert.equal(
						'f13829c9de',
						C.RC4.encrypt(
							C.enc.Hex.parse('dcee4cf92c'),
							C.enc.Hex.parse('618a63d2fb')
						).ciphertext.toString()
					));
				it('testDrop', () =>
					assert.equal(
						C.RC4.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('0123456789abcdef')
						)
							.ciphertext.toString()
							.substr(16),
						C.RC4Drop.encrypt(C.enc.Hex.parse('0000000000000000'), C.enc.Hex.parse('0123456789abcdef'), {
							drop: 2,
						}).ciphertext.toString()
					));
				it('testMultiPart', () => {
					const rc4 = C.algo.RC4.createEncryptor(C.enc.Hex.parse('0123456789abcdef'));
					const ciphertext1 = rc4.process(C.enc.Hex.parse('00000000'));
					const ciphertext2 = rc4.process(C.enc.Hex.parse('0000'));
					const ciphertext3 = rc4.process(C.enc.Hex.parse('0000'));
					const ciphertext4 = rc4.finalize();
					assert.equal(
						'7494c2e7104b0879',
						ciphertext1.concat(ciphertext2).concat(ciphertext3).concat(ciphertext4).toString()
					);
				});
				it('testInputIntegrity', () => {
					const message = C.enc.Hex.parse('0000000000000000');
					const key = C.enc.Hex.parse('0123456789abcdef');
					const expectedMessage = message.toString();
					const expectedKey = key.toString();
					C.RC4.encrypt(message, key);
					assert.equal(expectedMessage, message.toString());
					assert.equal(expectedKey, key.toString());
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
						C.algo.RC4.createEncryptor(C.SHA256('Jefe')).finalize('Hi There').toString(),
						C.RC4.encrypt('Hi There', C.SHA256('Jefe')).ciphertext.toString()
					);
					assert.equal(
						C.lib.SerializableCipher.encrypt(C.algo.RC4, 'Hi There', C.SHA256('Jefe')).toString(),
						C.RC4.encrypt('Hi There', C.SHA256('Jefe')).toString()
					);
					assert.equal(
						C.lib.PasswordBasedCipher.encrypt(C.algo.RC4, 'Hi There', 'Jefe').toString(),
						C.RC4.encrypt('Hi There', 'Jefe').toString()
					);

					// Restore random method
					C.lib.WordArray.random = random;
				});
			});
		});
	}
}
