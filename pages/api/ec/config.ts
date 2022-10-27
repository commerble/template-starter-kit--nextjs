import { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.json({
        rootPrefix: process.env.CBPAAS_PREFIX,
        loginUrl: '/cart#login'
    });
}