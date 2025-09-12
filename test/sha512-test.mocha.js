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

export class UnitTestSHA512 {
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
		describe('algo-sha512-test', function () {
			describe('SHA512', function () {
				it('testVector1', () =>
					assert.equal(
						'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
						C.SHA512('').toString()
					));
				it('testVector2', () =>
					assert.equal(
						'07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb642e93a252a954f23912547d1e8a3b5ed6e1bfd7097821233fa0538f3db854fee6',
						C.SHA512('The quick brown fox jumps over the lazy dog').toString()
					));
				it('testVector3', () =>
					assert.equal(
						'91ea1245f20d46ae9a037a989f54f1f790f0a47607eeb8a14d12890cea77a1bbc6c7ed9cf205e67b7f2b8fd4c7dfd3a7a8617e45f3c463d481c7e586c39ac1ed',
						C.SHA512('The quick brown fox jumps over the lazy dog.').toString()
					));
				it('testUpdateAndLongMessage', () => {
					const sha512 = new C.algo.SHA512();
					for (let i = 0; i < 100; i++) sha512.update('12345678901234567890123456789012345678901234567890');
					assert.equal(
						'9bc64f37c54606dff234b6607e06683c7ba248558d0ec74a11525d9f59e0be566489cc9413c00ca5e9db705fc52ba71214bcf118f65072fe284af8f8cf9500af',
						sha512.finalize().toString()
					);
				});
				it('testClone', () => {
					const sha512 = new C.algo.SHA512();
					assert.equal(C.SHA512('a').toString(), sha512.update('a').clone().finalize().toString());
					assert.equal(C.SHA512('ab').toString(), sha512.update('b').clone().finalize().toString());
					assert.equal(C.SHA512('abc').toString(), sha512.update('c').clone().finalize().toString());
				});
				it('testInputIntegrity', () => {
					const message = new C.lib.WordArray([0x12345678]);
					const expected = message.toString();
					C.SHA512(message);
					assert.equal(expected, message.toString());
				});
				it('testHelper', () =>
					assert.equal(new C.algo.SHA512().finalize('').toString(), C.SHA512('').toString()));
				it('testHmacHelper', () =>
					assert.equal(
						new C.algo.HMAC(C.algo.SHA512, C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b'))
							.finalize('Hi There')
							.toString(),
						C.HmacSHA512('Hi There', C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b')).toString()
					));
			});
		});
	}
}
