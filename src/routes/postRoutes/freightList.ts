// src/routes/postRoutes/freightList.ts
import { Request, Response, Express } from 'express';
import { db } from '../../lib/drizzle';
import { freightList } from '../../drizzle/schema';

const getVal = (obj: any, possibleKeys: string[]) => {
    const key = possibleKeys.find(k => obj[k] !== undefined && obj[k] !== null && obj[k] !== '');
    return key ? obj[key] : null;
};

export default function setupFreightListPostRoutes(app: Express) {
    app.post('/api/tally/freight', async (req: Request, res: Response): Promise<void> => {
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

            const payload = data.map(row => {
                const dateVal = getVal(row, ['DateEffective', 'dateEffective', 'date_effective']);
                
                const baseData: any = {
                    institution,
                    dateEffective: dateVal ? new Date(dateVal).toISOString().split('T')[0] : null,
                    destFrom: getVal(row, ['DestFrom', 'destFrom', 'dest_from']) ? String(getVal(row, ['DestFrom', 'destFrom', 'dest_from'])) : null,
                    destTo: getVal(row, ['DestTo', 'DestTO', 'destTo', 'dest_to']) ? String(getVal(row, ['DestTo', 'DestTO', 'destTo', 'dest_to'])) : null,
                    km: getVal(row, ['KM', 'km']) ? String(getVal(row, ['KM', 'km'])) : null,
                };

                // Dynamic Column Mapping based on Institution
                if (institution === 'JUD') {
                    baseData.ratePerMt = getVal(row, ['Rate/MT', 'ratePerMt', 'rate_per_mt']) ? String(getVal(row, ['Rate/MT', 'ratePerMt', 'rate_per_mt'])) : null;
                } else if (institution === 'JSB') {
                    baseData.ratePerMtAbove4 = getVal(row, ['Rate/MT (above 4MT)', 'ratePerMtAbove4', 'rate_per_mt_above_4']) ? String(getVal(row, ['Rate/MT (above 4MT)', 'ratePerMtAbove4', 'rate_per_mt_above_4'])) : null;
                    baseData.ratePerMtUpto4 = getVal(row, ['Rate/MT (untill 4MT)', 'Rate/MT (until 4MT)', 'ratePerMtUpto4', 'rate_per_mt_upto_4']) ? String(getVal(row, ['Rate/MT (untill 4MT)', 'Rate/MT (until 4MT)', 'ratePerMtUpto4', 'rate_per_mt_upto_4'])) : null;
                }

                return baseData;
            });

            const inserted = await db.insert(freightList).values(payload).returning();

            res.status(201).json({ success: true, count: inserted.length, data: inserted });
        } catch (error: any) {
            console.error('POST Freight List error:', error);
            res.status(500).json({ success: false, error: 'Failed to insert freight data', details: error.message });
        }
    });

    console.log('✅ Freight List POST endpoint setup complete');
}