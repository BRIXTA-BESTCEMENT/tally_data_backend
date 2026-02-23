// src/routes/getRoutes/tallyRaw.ts
import { Request, Response, Express } from 'express';
import { db } from '../../lib/drizzle';
import { tallyRaw } from '../../drizzle/schema'; 
import { eq, desc, asc, getTableColumns } from 'drizzle-orm';

export default function setupTallyRawGetRoutes(app: Express) {

    app.get('/api/tally/raw', async (req: Request, res: Response) => {
        try {
            const { limit = '50', page = '1', collectionName } = req.query;
            const lmt = Math.max(1, Math.min(200, parseInt(String(limit), 10) || 50));
            const offset = (Math.max(1, parseInt(String(page), 10) || 1) - 1) * lmt;

            let query = db.select(getTableColumns(tallyRaw)).from(tallyRaw).$dynamic();
            
            if (collectionName) {
                query = query.where(eq(tallyRaw.collectionName, String(collectionName)));
            }

            const data = await query.orderBy(desc(tallyRaw.syncedAt)).limit(lmt).offset(offset);
            res.json({ success: true, count: data.length, data });
        } catch (error) {
            console.error(`Get Tally Raw error:`, error);
            res.status(500).json({ success: false, error: `Failed to fetch raw sync logs` });
        }
    });

    app.get('/api/tally/raw/:id', async (req: Request, res: Response) => {
        try {
            const [record] = await db.select()
                .from(tallyRaw)
                .where(eq(tallyRaw.id, String(req.params.id)))
                .limit(1);

            if (!record) return res.status(404).json({ success: false, error: 'Raw log not found' });
            res.json({ success: true, data: record });
        } catch (error) {
            res.status(500).json({ success: false, error: `Failed to fetch raw log` });
        }
    });

    console.log('✅ Tally Raw GET endpoints setup complete');
}