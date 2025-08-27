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

export class UnitTestSHA256 {
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
		describe('algo-sha256-test', function () {
			describe('SHA256', function () {
				it('testVector1', () =>
					assert.equal(
						'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
						C.SHA256('').toString()
					));
				it('testVector2', () =>
					assert.equal(
						'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
						C.SHA256('a').toString()
					));
				it('testVector3', () =>
					assert.equal(
						'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
						C.SHA256('abc').toString()
					));
				it('testVector4', () =>
					assert.equal(
						'f7846f55cf23e14eebeab5b4e1550cad5b509e3348fbc4efa3a1413d393cb650',
						C.SHA256('message digest').toString()
					));
				it('testVector5', () =>
					assert.equal(
						'71c480df93d6ae2f1efad1447c66c9525e316218cf51fc8d9ed832f2daf18b73',
						C.SHA256('abcdefghijklmnopqrstuvwxyz').toString()
					));
				it('testVector6', () =>
					assert.equal(
						'db4bfcbd4da0cd85a60c3c37d3fbd8805c77f15fc6b1fdfe614ee0a7c8fdb4c0',
						C.SHA256('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789').toString()
					));
				it('testVector7', () =>
					assert.equal(
						'f371bc4a311f2b009eef952dd83ca80e2b60026c8e935592d0f9c308453c813e',
						C.SHA256(
							'12345678901234567890123456789012345678901234567890123456789012345678901234567890'
						).toString()
					));
				it('testUpdateAndLongMessage', () => {
					const sha256 = new C.algo.SHA256();
					for (let i = 0; i < 100; i++) sha256.update('12345678901234567890123456789012345678901234567890');
					assert.equal(
						'f8146961d9b73d8da49ccd526fca65439cdd5b402f76971556d5f52fd129843e',
						sha256.finalize().toString()
					);
				});
				it('testClone', () => {
					const sha256 = new C.algo.SHA256();
					assert.equal(C.SHA256('a').toString(), sha256.update('a').clone().finalize().toString());
					assert.equal(C.SHA256('ab').toString(), sha256.update('b').clone().finalize().toString());
					assert.equal(C.SHA256('abc').toString(), sha256.update('c').clone().finalize().toString());
				});
				it('testInputIntegrity', () => {
					const message = new C.lib.WordArray([0x12345678]);
					const expected = message.toString();
					C.SHA256(message);
					assert.equal(expected, message.toString());
				});
				it('testHelper', () =>
					assert.equal(new C.algo.SHA256().finalize('').toString(), C.SHA256('').toString()));
				it('testHmacHelper', () =>
					assert.equal(
						new C.algo.HMAC(C.algo.SHA256, C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b'))
							.finalize('Hi There')
							.toString(),
						C.HmacSHA256('Hi There', C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b')).toString()
					));
			});
		});
	}
}
