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

export class UnitTestHmacSHA256 {
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
		describe('algo-hmac-sha256-test', function () {
			describe('HMAC SHA256', function () {
				it('testVector1', () =>
					assert.equal(
						'492ce020fe2534a5789dc3848806c78f4f6711397f08e7e7a12ca5a4483c8aa6',
						C.HmacSHA256('Hi There', C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b')).toString()
					));
				it('testVector2', () =>
					assert.equal(
						'5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
						C.HmacSHA256('what do ya want for nothing?', 'Jefe').toString()
					));
				it('testVector3', () =>
					assert.equal(
						'7dda3cc169743a6484649f94f0eda0f9f2ff496a9733fb796ed5adb40a44c3c1',
						C.HmacSHA256(
							C.enc.Hex.parse(
								'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
							),
							C.enc.Hex.parse('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
						).toString()
					));
				it('testVector4', () =>
					assert.equal(
						'a89dc8178c1184a62df87adaa77bf86e93064863d93c5131140b0ae98b866687',
						C.HmacSHA256('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'A').toString()
					));
				it('testVector5', () =>
					assert.equal(
						'd8cb78419c02fe20b90f8b77427dd9f81817a751d74c2e484e0ac5fc4e6ca986',
						C.HmacSHA256('abcdefghijklmnopqrstuvwxyz', 'A').toString()
					));
				it('testUpdate', () => {
					const hmac = new C.algo.HMAC(C.algo.SHA256, C.enc.Hex.parse('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddddddd'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddd'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddd'));

					assert.equal(
						C.HmacSHA256(
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

					C.HmacSHA256(message, key);

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
