import { NextApiRequest, NextApiResponse } from "next";
import httpProxyMiddleware from '../../../modules/commerble-nextjs-sdk/server/proxy';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await httpProxyMiddleware(req, res);
}