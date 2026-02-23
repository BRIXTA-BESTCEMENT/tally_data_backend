// src/routes/postRoutes/tallyRaw.ts
import { Request, Response, Express } from 'express';
import { db } from '../../lib/drizzle';
import { tallyRaw } from '../../drizzle/schema';

export default function setupTallyRawPostRoutes(app: Express) {
    app.post('/api/tally/raw', async (req: Request, res: Response): Promise<void> => {
        try {
            const { collectionName } = req.query;
            
            if (!collectionName) {
                res.status(400).json({ success: false, error: "Missing ?collectionName= parameter" });
                return;
            }

            const data = Array.isArray(req.body) ? req.body : [req.body];
            if (data.length === 0) {
                res.status(400).json({ success: false, error: "Empty payload" });
                return;
            }

            const payload = data.map(item => ({
                collectionName: String(collectionName),
                rawData: item // Storing the direct JSON payload
            }));

            const inserted = await db.insert(tallyRaw).values(payload).returning();

            res.status(201).json({ success: true, count: inserted.length, data: inserted });
        } catch (error: any) {
            console.error('POST Tally Raw error:', error);
            res.status(500).json({ success: false, error: 'Failed to insert raw tally data', details: error.message });
        }
    });

    console.log('✅ Tally Raw POST endpoint setup complete');
}