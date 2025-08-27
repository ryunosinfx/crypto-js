import fs from 'fs';
import http from 'http';
const exts = {
	js: 'text/javascript',
	css: 'text/css',
	html: 'text/html',
};
const PORT = 8088;
const ProxySign = '/proxy';
const mapProxy = new Map();
const isProxy = req => {
	const url = req.url.replace('../', '/');
	console.log('isProxy url:', url);
	return url.indexOf(ProxySign) === 0;
};
const decodeFrom = querystring => {
	const d = querystring.split('&');
	const o = {};
	for (const e of d) {
		const f = e.split('=');
		if (f.length === 2) o[f[0]] = decodeURIComponent(f[1]);
	}
	d.splice(0, d.length);
	return o;
};
const proxy = async (req, res) => {
	const method = req.method;
	if (method === 'GET') {
		const parameter = decodeFrom(req.url.split('?')[1]);
		console.log('proxy GET:', parameter);
		const k = parameter.u;
		if (mapProxy.has(k)) {
			const { t, c } = mapProxy.get(k);
			res.writeHead(200, {
				'Content-Type': c,
			});
			res.end(t);
			console.log('proxy GET:cache:', k, mapProxy.get(k));
			return;
		}
		const a = await fetch(`https://${parameter.u}`);
		const t = await a.text();
		const c = a.headers.get('content-type');
		mapProxy.set(k, { t, c });
		res.writeHead(200, {
			'Content-Type': c,
		});
		res.end(t);
	}
};
//
http.createServer(function (req, res) {
	const url = req.url.replace('../', '/');
	const urls = url.split('.');
	const ext = urls[urls.length - 1];
	// console.log(`req url:${url}`);
	const contentType = exts[ext] ? exts[ext] : 'text/plain';
	try {
		if (isProxy(req)) {
			return proxy(req, res);
		}
		const file = fs.readFileSync(`.${url}`);
		const responseMessage = file;
		res.writeHead(200, {
			'Content-Type': contentType,
		});
		res.end(responseMessage);
	} catch (e) {
		console.log(`req e:${e}`);
		try {
			res.writeHead(404, {
				'Content-Type': contentType,
			});
			res.end('NOT FOUND');
		} catch (e2) {
			console.log(`req e2:${e2}`);
		}
	}
}).listen(PORT, '127.0.0.1');
