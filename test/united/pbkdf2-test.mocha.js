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

export class UnitTestPBKDF2 {
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
		describe('algo-pbkdf2-test', function () {
			describe('PBKDF2', function () {
				it('testKeySize128', () =>
					assert.equal(
						'62929ab995a1111c75c37bc562261ea3',
						C.PBKDF2('password', 'ATHENA.MIT.EDUraeburn', { keySize: 128 / 32 }).toString()
					)).timeout(60 * 1000);
				it('testKeySize256', () =>
					assert.equal(
						'62929ab995a1111c75c37bc562261ea3fb3cdc7e725c4ca87c03cec5bb7663e1',
						C.PBKDF2('password', 'ATHENA.MIT.EDUraeburn', { keySize: 256 / 32 }).toString()
					)).timeout(60 * 1000);
				it('testKeySize128Iterations2', () =>
					assert.equal(
						'262fb72ea65b44ab5ceba7f8c8bfa781',
						C.PBKDF2('password', 'ATHENA.MIT.EDUraeburn', { keySize: 128 / 32, iterations: 2 }).toString()
					));
				it('testKeySize256Iterations2', () =>
					assert.equal(
						'262fb72ea65b44ab5ceba7f8c8bfa7815ff9939204eb7357a59a75877d745777',
						C.PBKDF2('password', 'ATHENA.MIT.EDUraeburn', { keySize: 256 / 32, iterations: 2 }).toString()
					));
				it('testKeySize128Iterations1200', () =>
					assert.equal(
						'c76a982415f1acc71dc197273c5b6ada',
						C.PBKDF2('password', 'ATHENA.MIT.EDUraeburn', {
							keySize: 128 / 32,
							iterations: 1200,
						}).toString()
					));
				it('testKeySize256Iterations1200', () =>
					assert.equal(
						'c76a982415f1acc71dc197273c5b6ada32f62915ed461718aad32843762433fa',
						C.PBKDF2('password', 'ATHENA.MIT.EDUraeburn', {
							keySize: 256 / 32,
							iterations: 1200,
						}).toString()
					));
				it('testKeySize128Iterations5', () =>
					assert.equal(
						'74e98b2e9eeddaab3113c1efc6d82b07',
						C.PBKDF2('password', C.enc.Hex.parse('1234567878563412'), {
							keySize: 128 / 32,
							iterations: 5,
						}).toString()
					));
				it('testKeySize256Iterations5', () =>
					assert.equal(
						'74e98b2e9eeddaab3113c1efc6d82b073c4860195b3e0737fa21a4778f376321',
						C.PBKDF2('password', C.enc.Hex.parse('1234567878563412'), {
							keySize: 256 / 32,
							iterations: 5,
						}).toString()
					));
				it('testKeySize128Iterations1200PassPhraseEqualsBlockSize', () =>
					assert.equal(
						'c1dfb29a4d2f2fb67c6f78d074d66367',
						C.PBKDF2(
							'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
							'pass phrase equals block size',
							{ keySize: 128 / 32, iterations: 1200 }
						).toString()
					));
				it('testKeySize256Iterations1200PassPhraseEqualsBlockSize', () =>
					assert.equal(
						'c1dfb29a4d2f2fb67c6f78d074d663671e6fd4da1e598572b1fecf256cb7cf61',
						C.PBKDF2(
							'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
							'pass phrase equals block size',
							{ keySize: 256 / 32, iterations: 1200 }
						).toString()
					));
				it('testKeySize128Iterations1200PassPhraseExceedsBlockSize', () =>
					assert.equal(
						'22344bc4b6e32675a8090f3ea80be01d',
						C.PBKDF2(
							'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
							'pass phrase exceeds block size',
							{ keySize: 128 / 32, iterations: 1200 }
						).toString()
					));
				it('testKeySize256Iterations1200PassPhraseExceedsBlockSize', () =>
					assert.equal(
						'22344bc4b6e32675a8090f3ea80be01d5f95126a2cddc3facc4a5e6dca04ec58',
						C.PBKDF2(
							'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
							'pass phrase exceeds block size',
							{ keySize: 256 / 32, iterations: 1200 }
						).toString()
					));
				it('testKeySize128Iterations50', () =>
					assert.equal(
						'44b0781253db3141ac4174af29325818',
						C.PBKDF2(C.enc.Hex.parse('f09d849e'), 'EXAMPLE.COMpianist', {
							keySize: 128 / 32,
							iterations: 50,
						}).toString()
					));
				it('testKeySize256Iterations50', () =>
					assert.equal(
						'44b0781253db3141ac4174af29325818584698d507a79f9879033dec308a2b77',
						C.PBKDF2(C.enc.Hex.parse('f09d849e'), 'EXAMPLE.COMpianist', {
							keySize: 256 / 32,
							iterations: 50,
						}).toString()
					));
				it('testInputIntegrity', () => {
					const password = new C.lib.WordArray([0x12345678]);
					const salt = new C.lib.WordArray([0x12345678]);

					const expectedPassword = password.toString();
					const expectedSalt = salt.toString();

					C.PBKDF2(password, salt);

					assert.equal(expectedPassword, password.toString());
					assert.equal(expectedSalt, salt.toString());
				}).timeout(60 * 1000);

				it('testHelper', () =>
					assert.equal(
						new C.algo.PBKDF2({ keySize: 128 / 32 })
							.compute('password', 'ATHENA.MIT.EDUraeburn')
							.toString(),
						C.PBKDF2('password', 'ATHENA.MIT.EDUraeburn', { keySize: 128 / 32 }).toString()
					)).timeout(60 * 1000);
			});
		});
	}
}
