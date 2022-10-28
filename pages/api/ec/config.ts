import { NextApiRequest, NextApiResponse } from "next";
import { URL } from "url";

export default (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.json({
        rootPrefix: new URL(process.env.CBPAAS_EP).pathname,
        loginUrl: '/cart#login'
    });
}