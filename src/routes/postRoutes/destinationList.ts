// src/routes/postRoutes/destinationList.ts
import { Request, Response, Express } from 'express';
import { db } from '../../lib/drizzle';
import { destinationList } from '../../drizzle/schema';
import { z } from 'zod';

const getVal = (obj: any, possibleKeys: string[]) => {
    const key = possibleKeys.find(k => obj[k] !== undefined && obj[k] !== null && obj[k] !== '');
    return key ? String(obj[key]) : null;
};

export default function setupDestinationListPostRoutes(app: Express) {
    app.post('/api/tally/destinations', async (req: Request, res: Response): Promise<void> => {
        try {
            const institution = String(req.query.institution || '').toUpperCase();
            if (institution !== 'JSB' && institution !== 'JUD') {
                res.status(400).json({ success: false, error: "Invalid or missing institution parameter (?institution=JSB)" });
                return;
            }

            const data = Array.isArray(req.body) ? req.body : [req.body];
            if (data.length === 0) {
                res.status(400).json({ success: false, error: "Empty payload" });
                return;
            }

            const payload = data.map(row => ({
                institution,
                destination: getVal(row, ['Destination', 'destination']),
                district: getVal(row, ['District', 'district']),
                zone: getVal(row, ['Zone', 'zone']),
            }));

            const inserted = await db.insert(destinationList).values(payload).returning();

            res.status(201).json({ success: true, count: inserted.length, data: inserted });
        } catch (error: any) {
            console.error('POST Destination List error:', error);
            res.status(500).json({ success: false, error: 'Failed to insert destination data', details: error.message });
        }
    });

    console.log('✅ Destination List POST endpoint setup complete');
}