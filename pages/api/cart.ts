import type { NextApiRequest, NextApiResponse } from 'next'
import { addToCart, getCart, Line, relpaceCart, removeFromCart, RetryRequest } from '../../libs/cbpaas';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch(req.method){
        case 'GET': await get(req, res); break;
        case 'POST': await post(req, res); break;
        case 'PUT': await put(req, res); break;
        case 'DELETE': await del(req, res); break;
        default: 
            res.setHeader('allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
    const cart = await getCart({req, res});
    res.status(200).json(cart);
}

async function post(req: NextApiRequest, res: NextApiResponse) {
    const lines: Line[] = req.body;
    const cart = await addToCart({req, res}, lines);
    res.status(200).json(cart);
}

async function put(req: NextApiRequest, res: NextApiResponse) {
    const { id, lines } : { id:number, lines: Line[] } = req.body;
    const cart = await relpaceCart({req, res}, id, lines);
    res.status(200).json(cart);
}

async function del(req: NextApiRequest, res: NextApiResponse) {
    const { item } : { item: number } = req.body;
    const cart = await removeFromCart({req, res}, item);
    res.status(200).json(cart);
}