import type { NextApiRequest, NextApiResponse } from 'next'
import { getConfirm } from '../../../../libs/cbpaas';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch(req.method){
        case 'GET': await get(req, res); break;
        default: 
            res.setHeader('allow', ['GET']);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
    const cartId = parseInt(req.query.cartId as string);
    const cart = await getConfirm({req, res}, cartId);
    res.status(200).json(cart);
}
