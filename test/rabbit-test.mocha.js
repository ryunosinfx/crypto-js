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

export class UnitTestRabbit {
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
		describe('algo-rabbit-test', function () {
			describe('Rabbit', function () {
				it('testVector1', () =>
					assert.equal(
						'02f74a1c26456bf5ecd6a536f05457b1',
						C.Rabbit.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('00000000000000000000000000000000')
						).ciphertext.toString()
					));
				it('testVector2', () =>
					assert.equal(
						'3d02e0c730559112b473b790dee018df',
						C.Rabbit.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('c21fcf3881cd5ee8628accb0a9890df8')
						).ciphertext.toString()
					));
				it('testVector3', () =>
					assert.equal(
						'a3a97abb80393820b7e50c4abb53823d',
						C.Rabbit.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('1d272c6a2d8e3dfcac14056b78d633a0')
						).ciphertext.toString()
					));
				it('testVector4', () =>
					assert.equal(
						'75d186d6bc6905c64f1b2dfdd51f7bfc',
						C.Rabbit.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('0053a6f94c9ff24598eb3e91e4378add'),
							{ iv: C.enc.Hex.parse('0d74db42a91077de') }
						).ciphertext.toString()
					));
				it('testVector5', () =>
					assert.equal(
						'476e2750c73856c93563b5f546f56a6a',
						C.Rabbit.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('0558abfe51a4f74a9df04396e93c8fe2'),
							{ iv: C.enc.Hex.parse('167de44bb21980e7') }
						).ciphertext.toString()
					));
				it('testVector6', () =>
					assert.equal(
						'921fcf4983891365a7dc901924b5e24b',
						C.Rabbit.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('0a5db00356a9fc4fa2f5489bee4194e7'),
							{ iv: C.enc.Hex.parse('1f86ed54bb2289f0') }
						).ciphertext.toString()
					));
				it('testVector7', () =>
					assert.equal(
						'613cb0ba96aff6cacf2a459a102a7f78',
						C.Rabbit.encrypt(
							C.enc.Hex.parse('00000000000000000000000000000000'),
							C.enc.Hex.parse('0f62b5085bae0154a7fa4da0f34699ec'),
							{ iv: C.enc.Hex.parse('288ff65dc42b92f9') }
						).ciphertext.toString()
					));
				it('testMultiPart', () => {
					const rabbit = C.algo.Rabbit.createEncryptor(C.enc.Hex.parse('00000000000000000000000000000000'));
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
					C.Rabbit.encrypt(message, key, { iv: iv });
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
						C.algo.Rabbit.createEncryptor(C.MD5('Jefe')).finalize('Hi There').toString(),
						C.Rabbit.encrypt('Hi There', C.MD5('Jefe')).ciphertext.toString()
					);
					assert.equal(
						C.lib.SerializableCipher.encrypt(C.algo.Rabbit, 'Hi There', C.MD5('Jefe')).toString(),
						C.Rabbit.encrypt('Hi There', C.MD5('Jefe')).toString()
					);
					assert.equal(
						C.lib.PasswordBasedCipher.encrypt(C.algo.Rabbit, 'Hi There', 'Jefe').toString(),
						C.Rabbit.encrypt('Hi There', 'Jefe').toString()
					);

					// Restore random method
					C.lib.WordArray.random = random;
				});
			});
		});
	}
}
