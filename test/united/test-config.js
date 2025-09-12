export class TestConfig {
	static path = '../../test/';
	static CryptoJSPath = globalThis.CryptoJSPath ? globalThis.CryptoJSPath : '../../src/united/crypto.js';
	static im = async path => {
		const module = await import(`${TestConfig.path}${path}`);
		console.log(module);
		return module;
	};
}
if (!globalThis.CryptoJSPath) globalThis.CryptoJSPath = TestConfig.CryptoJSPath;
