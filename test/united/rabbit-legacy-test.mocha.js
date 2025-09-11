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

export class UnitTestRabbitLegacy {
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
		describe('algo-rabbit-legacy-test', function () {
			describe('RabbitLegacy', function () {
				it('testVector1', () =>
					assert.equal(
						'02f74a1c26456bf5ecd6a536f05457b1',
						C.RabbitLegacy.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('00000000000000000000000000000000')
						).ciphertext.toString()
					));
				it('testVector2', () =>
					assert.equal(
						'9c51e28784c37fe9a127f63ec8f32d3d',
						C.RabbitLegacy.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('dc51c3ac3bfc62f12e3d36fe91281329')
						).ciphertext.toString()
					));
				it('testVector3', () =>
					assert.equal(
						'9b60d002fd5ceb32accd41a0cd0db10c',
						C.RabbitLegacy.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('c09b0043e9e9ab0187e0c73383957415')
						).ciphertext.toString()
					));
				it('testVector4', () =>
					assert.equal(
						'edb70567375dcd7cd89554f85e27a7c6',
						C.RabbitLegacy.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('00000000000000000000000000000000'),
							{ iv: C.enc.Hex.parse('0000000000000000') }
						).ciphertext.toString()
					));
				it('testVector5', () =>
					assert.equal(
						'6d7d012292ccdce0e2120058b94ecd1f',
						C.RabbitLegacy.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('00000000000000000000000000000000'),
							{ iv: C.enc.Hex.parse('597e26c175f573c3') }
						).ciphertext.toString()
					));
				it('testVector6', () =>
					assert.equal(
						'4d1051a123afb670bf8d8505c8d85a44',
						C.RabbitLegacy.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('00000000000000000000000000000000'),
							{ iv: C.enc.Hex.parse('2717f4d21a56eba6') }
						).ciphertext.toString()
					));
				it('testMultiPart', () => {
					const rabbit = C.algo.RabbitLegacy.createEncryptor(
						C.enc.Hex.parse('00000000000000000000000000000000')
					);
					const ciphertext1 = rabbit.process(C.enc.Hex.parse('000000000000'));
					const ciphertext2 = rabbit.process(C.enc.Hex.parse('0000000000'));
					const ciphertext3 = rabbit.process(C.enc.Hex.parse('0000000000'));
					const ciphertext4 = rabbit.finalize();

					assert.equal(
						'02f74a1c26456bf5ecd6a536f05457b1',
						ciphertext1.concat(ciphertext2).concat(ciphertext3).concat(ciphertext4).toString()
					);
				});

				it('testInputIntegrity', () => {
					const message = C.enc.Hex.parse('00000000000000000000000000000000');
					const key = C.enc.Hex.parse('00000000000000000000000000000000');
					const iv = C.enc.Hex.parse('0000000000000000');

					const expectedMessage = message.toString();
					const expectedKey = key.toString();
					const expectedIv = iv.toString();

					C.RabbitLegacy.encrypt(message, key, { iv: iv });

					assert.equal(expectedMessage, message.toString());
					assert.equal(expectedKey, key.toString());
					assert.equal(expectedIv, iv.toString());
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
						C.algo.RabbitLegacy.createEncryptor(C.MD5('Jefe')).finalize('Hi There').toString(),
						C.RabbitLegacy.encrypt('Hi There', C.MD5('Jefe')).ciphertext.toString()
					);
					assert.equal(
						C.lib.SerializableCipher.encrypt(C.algo.RabbitLegacy, 'Hi There', C.MD5('Jefe')).toString(),
						C.RabbitLegacy.encrypt('Hi There', C.MD5('Jefe')).toString()
					);
					assert.equal(
						C.lib.PasswordBasedCipher.encrypt(C.algo.RabbitLegacy, 'Hi There', 'Jefe').toString(),
						C.RabbitLegacy.encrypt('Hi There', 'Jefe').toString()
					);

					// Restore random method
					C.lib.WordArray.random = random;
				});
			});
		});
	}
}
