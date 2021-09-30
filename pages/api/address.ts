import type { NextApiRequest, NextApiResponse } from 'next'
import { searchZipCode } from '../../libs/cbpaas';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch(req.method){
        case 'GET': await get(req, res); break;
        default: 
            res.setHeader('allow', ['GET']);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
    const { zipcode } = req.query;

    if (!Array.isArray(zipcode)) {
        const result = await searchZipCode({req, res}, zipcode);
        res.status(200).json(result);
    }
    else {
        res.status(400).end();
    }
}
