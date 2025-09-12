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

export class UnitTestHmacSHA384 {
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
		describe('algo-hmac-sha384-test', function () {
			describe('HMAC SHA384', function () {
				it('testVector1', () =>
					assert.equal(
						'7afaa633e20d379b02395915fbc385ff8dc27dcd3885e1068ab942eeab52ec1f20ad382a92370d8b2e0ac8b83c4d53bf',
						C.HmacSHA384('Hi There', C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b')).toString()
					));
				it('testVector2', () =>
					assert.equal(
						'af45d2e376484031617f78d2b58a6b1b9c7ef464f5a01b47e42ec3736322445e8e2240ca5e69e2c78b3239ecfab21649',
						C.HmacSHA384('what do ya want for nothing?', 'Jefe').toString()
					));
				it('testVector3', () =>
					assert.equal(
						'1383e82e28286b91f4cc7afbd13d5b5c6f887c05e7c4542484043a37a5fe45802a9470fb663bd7b6570fe2f503fc92f5',
						C.HmacSHA384(
							C.enc.Hex.parse(
								'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
							),
							C.enc.Hex.parse('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
						).toString()
					));
				it('testVector4', () =>
					assert.equal(
						'365dfb271adb8e30fe6c74220b75df1b38c2d19b9d37f2e5a0ec2f3f22bd0406bf5b786e98d81b82c36d3d8a1be6cd07',
						C.HmacSHA384('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'A').toString()
					));
				it('testVector5', () =>
					assert.equal(
						'a8357d5e84da64140e41545562ae0782e2a58e39c6cd98939fad8d9080e774c84b7eaca4ba07f6dbf0f12eab912c5285',
						C.HmacSHA384('abcdefghijklmnopqrstuvwxyz', 'A').toString()
					));
				it('testUpdate', () => {
					const hmac = new C.algo.HMAC(C.algo.SHA384, C.enc.Hex.parse('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddddddd'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddd'));
					hmac.update(C.enc.Hex.parse('dddddddddddddddddddddddddddddddd'));

					assert.equal(
						C.HmacSHA384(
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

					C.HmacSHA384(message, key);

					assert.equal(expectedMessage, message.toString());
					assert.equal(expectedKey, key.toString());
				});

				it('testRespectKeySigBytes', () => {
					const key = C.lib.WordArray.random(8);
					key.sigBytes = 4;

					const keyClamped = key.clone();
					keyClamped.clamp();

					assert.equal(
						CryptoJS.HmacSHA384('Message', keyClamped).toString(),
						CryptoJS.HmacSHA384('Message', key).toString()
					);
				});
			});
		});
	}
}
