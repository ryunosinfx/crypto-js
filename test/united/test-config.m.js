export class TestConfig {
	static path = '../../test/';
	static CryptoJSPath = globalThis.CryptoJSPath ? globalThis.CryptoJSPath : '../../src/united/crypto.m.js';
	static im = async path => {
		const module = await import(`${TestConfig.path}${path}`);
		console.log('min', globalThis.CryptoJSPath, module);
		return module;
	};
}
if (!globalThis.CryptoJSPath) globalThis.CryptoJSPath = TestConfig.CryptoJSPath;
