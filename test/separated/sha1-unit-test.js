import { TestConfig } from './sha1-test-config.js';
const list = [];
const o = {};
export class UnitTest {
	static async init(chaiM, mochaM, describeM, itM, beforeM, afterM, beforeEachM, afterEachM) {
		o.mocha = mochaM;
		list.push((await TestConfig.im('enc-latin1-test.mocha.js')).UnitTestLatin1);
		list.push((await TestConfig.im('enc-utf8-test.mocha.js')).UnitTestUtf8);
		list.push((await TestConfig.im('lib-base-test.mocha.js')).UnitTestBase);
		list.push((await TestConfig.im('enc-hex-test.mocha.js')).UnitTestHex);
		list.push((await TestConfig.im('lib-typedarrays-test.mocha.js')).UnitTestTypedArrays);
		list.push((await TestConfig.im('lib-wordarray-test.mocha.js')).UnitTestWordArray);
		list.push((await TestConfig.im('sha1-test.mocha.js')).UnitTestSHA1);
		list.push((await TestConfig.im('sha1-profile.mocha.js')).UnitTestSHA1Profile);
		for (const test of list)
			await test.init(chaiM, mochaM, describeM, itM, beforeM, afterM, beforeEachM, afterEachM);
	}
	static run() {
		for (const test of list) test.run();
		o.mocha.run();
	}
}
