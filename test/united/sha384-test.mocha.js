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

export class UnitTestSHA384 {
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
		describe('algo-sha384-test', function () {
			describe('SHA384', function () {
				it('testVector1', () =>
					assert.equal(
						'38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b',
						C.SHA384('').toString()
					));
				it('testVector2', () =>
					assert.equal(
						'ca737f1014a48f4c0b6dd43cb177b0afd9e5169367544c494011e3317dbf9a509cb1e5dc1e85a941bbee3d7f2afbc9b1',
						C.SHA384('The quick brown fox jumps over the lazy dog').toString()
					));
				it('testVector3', () =>
					assert.equal(
						'ed892481d8272ca6df370bf706e4d7bc1b5739fa2177aae6c50e946678718fc67a7af2819a021c2fc34e91bdb63409d7',
						C.SHA384('The quick brown fox jumps over the lazy dog.').toString()
					));
				it('testUpdateAndLongMessage', () => {
					const sha384 = new C.algo.SHA384();
					for (let i = 0; i < 100; i++) sha384.update('12345678901234567890123456789012345678901234567890');
					assert.equal(
						'297a519246d6f639a4020119e1f03fc8d77171647b2ff75ea4125b7150fed0cdcc93f8dca1c3c6a624d5e88d780d82cd',
						sha384.finalize().toString()
					);
				});
				it('testClone', () => {
					const sha384 = new C.algo.SHA384();
					assert.equal(C.SHA384('a').toString(), sha384.update('a').clone().finalize().toString());
					assert.equal(C.SHA384('ab').toString(), sha384.update('b').clone().finalize().toString());
					assert.equal(C.SHA384('abc').toString(), sha384.update('c').clone().finalize().toString());
				});
				it('testInputIntegrity', () => {
					const message = new C.lib.WordArray([0x12345678]);
					const expected = message.toString();
					C.SHA384(message);
					assert.equal(expected, message.toString());
				});
				it('testHelper', () =>
					assert.equal(new C.algo.SHA384().finalize('').toString(), C.SHA384('').toString()));
				it('testHmacHelper', () =>
					assert.equal(
						new C.algo.HMAC(C.algo.SHA384, C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b'))
							.finalize('Hi There')
							.toString(),
						C.HmacSHA384('Hi There', C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b')).toString()
					));
			});
		});
	}
}
