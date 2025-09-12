export class TestConfig {
	static path = './';
	static CryptoJSPath = globalThis.CryptoJSPath ? globalThis.CryptoJSPath : '../src/crypto.js';
	static im = async path => {
		const module = await import(`${TestConfig.path}${path}`);
		console.log(module);
		return module;
	};
}
if (!globalThis.CryptoJSPath) globalThis.CryptoJSPath = TestConfig.CryptoJSPath;
