import type { NextApiRequest, NextApiResponse } from 'next'
import { loginAsGuest } from '../../libs/cbpaas';

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
    res.status(200).json({});
}

async function post(req: NextApiRequest, res: NextApiResponse) {
    const { guest } = req.body;

    if (guest) {
        await loginAsGuest({req, res});
        res.status(200).end();
    }
    else {

    }
}
