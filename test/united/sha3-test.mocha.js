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

export class UnitTestSHA3 {
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
		describe('algo-sha3-test', function () {
			describe('SHA3', function () {
				it('testVector1', () =>
					assert.equal(
						'0eab42de4c3ceb9235fc91acffe746b29c29a8c366b7c60e4e67c466f36a4304c00fa9caf9d87976ba469bcbe06713b435f091ef2769fb160cdab33d3670680e',
						C.SHA3('', { outputLength: 512 }).toString()
					));
				it('testVector2', () =>
					assert.equal(
						'81950e7096d31d4f22e3db71cac725bf59e81af54c7ca9e6aeee71c010fc5467466312a01aa5c137cfb140646941556796f612c9351268737c7e9a2b9631d1fa',
						C.SHA3(
							C.enc.Hex.parse(
								'3a3a819c48efde2ad914fbf00e18ab6bc4f14513ab27d0c178a188b61431e7f5623cb66b23346775d386b50e982c493adbbfc54b9a3cd383382336a1a0b2150a15358f336d03ae18f666c7573d55c4fd181c29e6ccfde63ea35f0adf5885cfc0a3d84a2b2e4dd24496db789e663170cef74798aa1bbcd4574ea0bba40489d764b2f83aadc66b148b4a0cd95246c127d5871c4f11418690a5ddf01246a0c80a43c70088b6183639dcfda4125bd113a8f49ee23ed306faac576c3fb0c1e256671d817fc2534a52f5b439f72e424de376f4c565cca82307dd9ef76da5b7c4eb7e085172e328807c02d011ffbf33785378d79dc266f6a5be6bb0e4a92eceebaeb1'
							),
							{ outputLength: 512 }
						).toString()
					));
				it('testVector3', () =>
					assert.equal(
						'2c23146a63a29acf99e73b88f8c24eaa7dc60aa771780ccc006afbfa8fe2479b2dd2b21362337441ac12b515911957ff',
						C.SHA3('', { outputLength: 384 }).toString()
					));
				it('testVector4', () =>
					assert.equal(
						'6bff1c8405a3fe594e360e3bccea1ebcd509310dc79b9e45c263783d7a5dd662c6789b18bd567dbdda1554f5bee6a860',
						C.SHA3(
							C.enc.Hex.parse(
								'3a3a819c48efde2ad914fbf00e18ab6bc4f14513ab27d0c178a188b61431e7f5623cb66b23346775d386b50e982c493adbbfc54b9a3cd383382336a1a0b2150a15358f336d03ae18f666c7573d55c4fd181c29e6ccfde63ea35f0adf5885cfc0a3d84a2b2e4dd24496db789e663170cef74798aa1bbcd4574ea0bba40489d764b2f83aadc66b148b4a0cd95246c127d5871c4f11418690a5ddf01246a0c80a43c70088b6183639dcfda4125bd113a8f49ee23ed306faac576c3fb0c1e256671d817fc2534a52f5b439f72e424de376f4c565cca82307dd9ef76da5b7c4eb7e085172e328807c02d011ffbf33785378d79dc266f6a5be6bb0e4a92eceebaeb1'
							),
							{ outputLength: 384 }
						).toString()
					));
				it('testVector5', () =>
					assert.equal(
						'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470',
						C.SHA3('', { outputLength: 256 }).toString()
					));
				it('testVector6', () =>
					assert.equal(
						'348fb774adc970a16b1105669442625e6adaa8257a89effdb5a802f161b862ea',
						C.SHA3(
							C.enc.Hex.parse(
								'3a3a819c48efde2ad914fbf00e18ab6bc4f14513ab27d0c178a188b61431e7f5623cb66b23346775d386b50e982c493adbbfc54b9a3cd383382336a1a0b2150a15358f336d03ae18f666c7573d55c4fd181c29e6ccfde63ea35f0adf5885cfc0a3d84a2b2e4dd24496db789e663170cef74798aa1bbcd4574ea0bba40489d764b2f83aadc66b148b4a0cd95246c127d5871c4f11418690a5ddf01246a0c80a43c70088b6183639dcfda4125bd113a8f49ee23ed306faac576c3fb0c1e256671d817fc2534a52f5b439f72e424de376f4c565cca82307dd9ef76da5b7c4eb7e085172e328807c02d011ffbf33785378d79dc266f6a5be6bb0e4a92eceebaeb1'
							),
							{ outputLength: 256 }
						).toString()
					));
				it('testVector7', () =>
					assert.equal(
						'f71837502ba8e10837bdd8d365adb85591895602fc552b48b7390abd',
						C.SHA3('', { outputLength: 224 }).toString()
					));
				it('testVector8', () =>
					assert.equal(
						'5af56987ea9cf11fcd0eac5ebc14b037365e9b1123e31cb2dfc7929a',
						C.SHA3(
							C.enc.Hex.parse(
								'3a3a819c48efde2ad914fbf00e18ab6bc4f14513ab27d0c178a188b61431e7f5623cb66b23346775d386b50e982c493adbbfc54b9a3cd383382336a1a0b2150a15358f336d03ae18f666c7573d55c4fd181c29e6ccfde63ea35f0adf5885cfc0a3d84a2b2e4dd24496db789e663170cef74798aa1bbcd4574ea0bba40489d764b2f83aadc66b148b4a0cd95246c127d5871c4f11418690a5ddf01246a0c80a43c70088b6183639dcfda4125bd113a8f49ee23ed306faac576c3fb0c1e256671d817fc2534a52f5b439f72e424de376f4c565cca82307dd9ef76da5b7c4eb7e085172e328807c02d011ffbf33785378d79dc266f6a5be6bb0e4a92eceebaeb1'
							),
							{ outputLength: 224 }
						).toString()
					));
				it('testDefaultOutputLength', () =>
					assert.equal(
						'0eab42de4c3ceb9235fc91acffe746b29c29a8c366b7c60e4e67c466f36a4304c00fa9caf9d87976ba469bcbe06713b435f091ef2769fb160cdab33d3670680e',
						C.SHA3('').toString()
					));
				it('testClone', () => {
					const sha3 = new C.algo.SHA3();
					assert.equal(C.SHA3('a').toString(), sha3.update('a').clone().finalize().toString());
					assert.equal(C.SHA3('ab').toString(), sha3.update('b').clone().finalize().toString());
					assert.equal(C.SHA3('abc').toString(), sha3.update('c').clone().finalize().toString());
				});
				it('testInputIntegrity', () => {
					const message = new C.lib.WordArray([0x12345678]);
					const expected = message.toString();
					C.SHA3(message);
					assert.equal(expected, message.toString());
				});
				it('testHelper', () =>
					assert.equal(
						new C.algo.SHA3({ outputLength: 256 }).finalize('').toString(),
						C.SHA3('', { outputLength: 256 }).toString()
					));
				it('testHmacHelper', () =>
					assert.equal(
						new C.algo.HMAC(C.algo.SHA3, C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b'))
							.finalize('Hi There')
							.toString(),
						C.HmacSHA3('Hi There', C.enc.Hex.parse('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b')).toString()
					));
			});
		});
	}
}
