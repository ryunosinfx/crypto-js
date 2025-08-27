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

export class UnitTestHmacSHA224 {
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
		describe('algo-hmac-sha224-test', function () {
			describe('HMAC SHA224', function () {
				it('testVector1', () =>
					assert.equal(
						'4e841ce7a4ae83fbcf71e3cd64bfbf277f73a14680aae8c518ac7861',
						C.HmacSHA224('Hi There', C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b')).toString()
					));
				it('testVector2', () =>
					assert.equal(
						'a30e01098bc6dbbf45690f3a7e9e6d0f8bbea2a39e6148008fd05e44',
						C.HmacSHA224('what do ya want for nothing?', 'Jefe').toString()
					));
				it('testVector3', () =>
					assert.equal(
						'cbff7c2716bbaa7c77bed4f491d3e8456cb6c574e92f672b291acf5b',
						C.HmacSHA224(
							C.enc.Hex.parse(
								'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
							),
							C.enc.Hex.parse('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
						).toString()
					));
				it('testVector4', () =>
					assert.equal(
						'61bf669da4fdcd8e5c3bd09ebbb4a986d3d1b298d3ca05c511f7aeff',
						C.HmacSHA224('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'A').toString()
					));
				it('testVector5', () =>
					assert.equal(
						'16fc69ada3c3edc1fe9144d6b98d93393833ae442bedf681110a1176',
						C.HmacSHA224('abcdefghijklmnopqrstuvwxyz', 'A').toString()
					));
				it('testUpdate', () => {
					const hmac = new C.algo.HMAC(C.algo.SHA224, C.enc.Hex.parse('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddddddd'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddd'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddd'));

					assert.equal(
						C.HmacSHA224(
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

					C.HmacSHA224(message, key);

					assert.equal(expectedMessage, message.toString());
					assert.equal(expectedKey, key.toString());
				});

				it('testRespectKeySigBytes', () => {
					const key = C.lib.WordArray.random(8);
					key.sigBytes = 4;

					const keyClamped = key.clone();
					keyClamped.clamp();

					assert.equal(
						CryptoJS.HmacSHA224('Message', keyClamped).toString(),
						CryptoJS.HmacSHA224('Message', key).toString()
					);
				});
			});
		});
	}
}
