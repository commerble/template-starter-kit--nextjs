import type { NextApiRequest, NextApiResponse } from 'next'
import { getPaymentForm, setPaymentForm } from '../../../../libs/cbpaas';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch(req.method){
        case 'GET': await get(req, res); break;
        case 'POST': await post(req, res); break;
        default: 
            res.setHeader('allow', ['GET', 'POST']);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
    const cartId = parseInt(req.query.cartId as string);

    const result = await getPaymentForm({req, res}, cartId);

    res.status(200).json(result);
}

async function post(req: NextApiRequest, res: NextApiResponse) {
    const cartId = parseInt(req.query.cartId as string);

    const result = await setPaymentForm({req, res}, cartId, req.body);

    res.status(200).json(result);
}