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

export class UnitTestMD5 {
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
		describe('algo-md5-test', function () {
			describe('MD5', function () {
				it('testVector1', () => assert.equal('d41d8cd98f00b204e9800998ecf8427e', C.MD5('').toString()));
				it('testVector2', () => assert.equal('0cc175b9c0f1b6a831c399e269772661', C.MD5('a').toString()));
				it('testVector3', () => assert.equal('900150983cd24fb0d6963f7d28e17f72', C.MD5('abc').toString()));
				it('testVector4', () =>
					assert.equal('f96b697d7cb7938d525a2f31aaf161d0', C.MD5('message digest').toString()));
				it('testVector5', () =>
					assert.equal('c3fcd3d76192e4007dfb496cca67e13b', C.MD5('abcdefghijklmnopqrstuvwxyz').toString()));
				it('testVector6', () =>
					assert.equal(
						'd174ab98d277d9f5a5611c2c9f419d9f',
						C.MD5('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789').toString()
					));
				it('testVector7', () =>
					assert.equal(
						'57edf4a22be3c955ac49da2e2107b67a',
						C.MD5(
							'12345678901234567890123456789012345678901234567890123456789012345678901234567890'
						).toString()
					));
				it('testUpdateAndLongMessage', () => {
					const md5 = new C.algo.MD5();
					for (let i = 0; i < 100; i++) md5.update('12345678901234567890123456789012345678901234567890');
					assert.equal('7d017545e0268a6a12f2b507871d0429', md5.finalize().toString());
				});
				it('testClone', () => {
					const md5 = new C.algo.MD5();
					assert.equal(C.MD5('a').toString(), md5.update('a').clone().finalize().toString());
					assert.equal(C.MD5('ab').toString(), md5.update('b').clone().finalize().toString());
					assert.equal(C.MD5('abc').toString(), md5.update('c').clone().finalize().toString());
				});
				it('testInputIntegrity', () => {
					const message = new C.lib.WordArray([0x12345678]);
					const expected = message.toString();
					C.MD5(message);
					assert.equal(expected, message.toString());
				});
				it('testHelper', () => assert.equal(new C.algo.MD5().finalize('').toString(), C.MD5('').toString()));
				it('testHmacHelper', () =>
					assert.equal(
						new C.algo.HMAC(C.algo.MD5, C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b'))
							.finalize('Hi There')
							.toString(),
						C.HmacMD5('Hi There', C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b')).toString()
					));
			});
		});
	}
}
