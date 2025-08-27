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

export class UnitTestSHA1 {
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
		describe('algo-sha1-test', function () {
			describe('SHA1', function () {
				it('testVector1', () =>
					assert.equal('da39a3ee5e6b4b0d3255bfef95601890afd80709', C.SHA1('').toString()));
				it('testVector2', () =>
					assert.equal('86f7e437faa5a7fce15d1ddcb9eaeaea377667b8', C.SHA1('a').toString()));
				it('testVector3', () =>
					assert.equal('a9993e364706816aba3e25717850c26c9cd0d89d', C.SHA1('abc').toString()));
				it('testVector4', () =>
					assert.equal('c12252ceda8be8994d5fa0290a47231c1d16aae3', C.SHA1('message digest').toString()));
				it('testVector5', () =>
					assert.equal(
						'32d10c7b8cf96570ca04ce37f2a19d84240d3a89',
						C.SHA1('abcdefghijklmnopqrstuvwxyz').toString()
					));
				it('testVector6', () =>
					assert.equal(
						'761c457bf73b14d27e9e9265c46f4b4dda11f940',
						C.SHA1('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789').toString()
					));
				it('testVector7', () =>
					assert.equal(
						'50abf5706a150990a08b2c5ea40fa0e585554732',
						C.SHA1(
							'12345678901234567890123456789012345678901234567890123456789012345678901234567890'
						).toString()
					));
				it('testUpdateAndLongMessage', () => {
					const sha1 = new C.algo.SHA1();
					for (let i = 0; i < 100; i++) sha1.update('12345678901234567890123456789012345678901234567890');
					assert.equal('85e4c4b3933d5553ebf82090409a9d90226d845c', sha1.finalize().toString());
				});
				it('testClone', () => {
					const sha1 = new C.algo.SHA1();
					assert.equal(C.SHA1('a').toString(), sha1.update('a').clone().finalize().toString());
					assert.equal(C.SHA1('ab').toString(), sha1.update('b').clone().finalize().toString());
					assert.equal(C.SHA1('abc').toString(), sha1.update('c').clone().finalize().toString());
				});
				it('testInputIntegrity', () => {
					const message = new C.lib.WordArray([0x12345678]);
					const expected = message.toString();
					C.SHA1(message);
					assert.equal(expected, message.toString());
				});
				it('testHelper', () => assert.equal(new C.algo.SHA1().finalize('').toString(), C.SHA1('').toString()));
				it('testHmacHelper', () =>
					assert.equal(
						new C.algo.HMAC(C.algo.SHA1, C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b'))
							.finalize('Hi There')
							.toString(),
						C.HmacSHA1('Hi There', C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b')).toString()
					));
			});
		});
	}
}
