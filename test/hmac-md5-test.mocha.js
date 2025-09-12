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

export class UnitTestHmacMD5 {
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
		describe('algo-hmac-md5-test', function () {
			describe('HMAC MD5', function () {
				it('testVector1', () =>
					assert.equal(
						'9294727a3638bb1c13f48ef8158bfc9d',
						C.HmacMD5('Hi There', C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b')).toString()
					));
				it('testVector2', () =>
					assert.equal(
						'750c783e6ab0b503eaa86e310a5db738',
						C.HmacMD5('what do ya want for nothing?', 'Jefe').toString()
					));
				it('testVector3', () =>
					assert.equal(
						'56be34521d144c88dbb8c733f0e8b3f6',
						C.HmacMD5(
							C.enc.Hex.parse(
								'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
							),
							C.enc.Hex.parse('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
						).toString()
					));
				it('testVector4', () =>
					assert.equal(
						'7ee2a3cc979ab19865704644ce13355c',
						C.HmacMD5('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'A').toString()
					));
				it('testVector5', () =>
					assert.equal(
						'0e1bd89c43e3e6e3b3f8cf1d5ba4f77a',
						C.HmacMD5('abcdefghijklmnopqrstuvwxyz', 'A').toString()
					));
				it('testUpdate', () => {
					const hmac = new C.algo.HMAC(C.algo.MD5, C.enc.Hex.parse('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddddddd'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddd'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddd'));

					assert.equal(
						C.HmacMD5(
							C.enc.Hex.parse(
								'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
							),
							C.enc.Hex.parse('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
						).toString(),
						hmac.finalize().toString()
					);
				});

				it('testInputIntegrity', () => {
					const message = new C.lib.WordArray([0x12345678]);
					const key = new C.lib.WordArray([0x12345678]);

					const expectedMessage = message.toString();
					const expectedKey = key.toString();

					C.HmacMD5(message, key);

					assert.equal(expectedMessage, message.toString());
					assert.equal(expectedKey, key.toString());
				});

				it('testRespectKeySigBytes', () => {
					const key = C.lib.WordArray.random(8);
					key.sigBytes = 4;

					const keyClamped = key.clone();
					keyClamped.clamp();

					assert.equal(
						CryptoJS.HmacSHA256('Message', keyClamped).toString(),
						CryptoJS.HmacSHA256('Message', key).toString()
					);
				});
			});
		});
	}
}
