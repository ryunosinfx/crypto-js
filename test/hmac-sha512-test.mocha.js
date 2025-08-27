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

export class UnitTestHmacSHA512 {
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
		describe('algo-hmac-sha512-test', function () {
			describe('HMAC SHA512', function () {
				it('testVector1', () =>
					assert.equal(
						'7641c48a3b4aa8f887c07b3e83f96affb89c978fed8c96fcbbf4ad596eebfe496f9f16da6cd080ba393c6f365ad72b50d15c71bfb1d6b81f66a911786c6ce932',
						C.HmacSHA512('Hi There', C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b')).toString()
					));
				it('testVector2', () =>
					assert.equal(
						'164b7a7bfcf819e2e395fbe73b56e0a387bd64222e831fd610270cd7ea2505549758bf75c05a994a6d034f65f8f0e6fdcaeab1a34d4a6b4b636e070a38bce737',
						C.HmacSHA512('what do ya want for nothing?', 'Jefe').toString()
					));
				it('testVector3', () =>
					assert.equal(
						'ad9b5c7de72693737cd5e9d9f41170d18841fec1201c1c1b02e05cae116718009f771cad9946ddbf7e3cde3e818d9ae85d91b2badae94172d096a44a79c91e86',
						C.HmacSHA512(
							C.enc.Hex.parse(
								'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
							),
							C.enc.Hex.parse('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
						).toString()
					));
				it('testVector4', () =>
					assert.equal(
						'a303979f7c94bb39a8ab6ce05cdbe28f0255da8bb305263e3478ef7e855f0242729bf1d2be55398f14da8e63f0302465a8a3f76c297bd584ad028d18ed7f0195',
						C.HmacSHA512('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'A').toString()
					));
				it('testVector5', () =>
					assert.equal(
						'8c2d56f7628325e62124c0a870ad98d101327fc42696899a06ce0d7121454022fae597e42c25ac3a4c380fd514f553702a5b0afaa9b5a22050902f024368e9d9',
						C.HmacSHA512('abcdefghijklmnopqrstuvwxyz', 'A').toString()
					));
				it('testUpdate', () => {
					const hmac = new C.algo.HMAC(C.algo.SHA512, C.enc.Hex.parse('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddddddd'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddd'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddd'));

					assert.equal(
						C.HmacSHA512(
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

					C.HmacSHA512(message, key);

					assert.equal(expectedMessage, message.toString());
					assert.equal(expectedKey, key.toString());
				});

				it('testRespectKeySigBytes', () => {
					const key = C.lib.WordArray.random(8);
					key.sigBytes = 4;

					const keyClamped = key.clone();
					keyClamped.clamp();

					assert.equal(
						CryptoJS.HmacSHA512('Message', keyClamped).toString(),
						CryptoJS.HmacSHA512('Message', key).toString()
					);
				});
			});
		});
	}
}
