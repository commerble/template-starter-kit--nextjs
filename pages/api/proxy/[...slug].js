import httpProxy from 'http-proxy';

const target = "https://dev.cbpaas.com/commerble.demo/front/";
const proxy = httpProxy.createProxyServer({ target, changeOrigin: true });

export default async function handler(req, res) {
    req.url = req.url.replace(new RegExp("^/api/proxy"), "");

    return new Promise((resolve, reject) => {
        try {
            proxy.web(req, res, { proxyTimeout: 300_000 }, (e) => {
                reject(e);
            })
            
	        resolve();
        } catch (e) {
            reject(e);
        }
    })
}