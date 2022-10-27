import { NextApiRequest, NextApiResponse } from "next";
import httpProxyMiddleware from '../../../libs/proxy';
import https from 'https'

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

export default (req: NextApiRequest, res: NextApiResponse): Promise<any> => {
  const proxy = httpProxyMiddleware(req, res, {
    target: process.env.CBPAAS_EP,
    changeOrigin: true,
    headers: {
      'Authorization': process.env.CBPAAS_AUTHZ,
      'X-Template-Suffix': 'Json',
    },
    pathRewrite: [
      {
        patternStr: '^/api/ec',
        replaceStr: ''
      }
    ],
    agent:new https.Agent({
      rejectUnauthorized: false
    }),
  } as any)
  
  return proxy
}