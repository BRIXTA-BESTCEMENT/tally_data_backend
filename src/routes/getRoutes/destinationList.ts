// src/routes/getRoutes/destinationList.ts
import { Request, Response, Express } from 'express';
import { db } from '../../lib/drizzle';
import { destinationList } from '../../drizzle/schema'; 
import { eq, and, desc, asc, SQL, ilike, getTableColumns } from 'drizzle-orm';

export default function setupDestinationListGetRoutes(app: Express) {

    const buildWhere = (q: any): SQL | undefined => {
        const conds: SQL[] = [];

        if (q.institution) {
            conds.push(eq(destinationList.institution, String(q.institution)));
        }

        if (q.destination) {
            conds.push(ilike(destinationList.destination, `%${String(q.destination)}%`));
        }

        if (q.district) {
            conds.push(ilike(destinationList.district, `%${String(q.district)}%`));
        }

        if (q.zone) {
            conds.push(ilike(destinationList.zone, `%${String(q.zone)}%`));
        }

        if (conds.length === 0) return undefined;
        return conds.length === 1 ? conds[0] : and(...conds);
    };

    const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
        const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
        switch (sortByRaw) {
            case 'destination':
                return direction === 'asc' ? asc(destinationList.destination) : desc(destinationList.destination);
            case 'district':
                return direction === 'asc' ? asc(destinationList.district) : desc(destinationList.district);
            case 'createdAt':
            default:
                return desc(destinationList.createdAt);
        }
    };

    const listHandler = async (req: Request, res: Response, baseWhere?: SQL) => {
        try {
            const { limit = '50', page = '1', sortBy, sortDir, ...filters } = req.query;
            const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
            const pg = Math.max(1, parseInt(String(page), 10) || 1);
            const offset = (pg - 1) * lmt;

            const extra = buildWhere(filters);
            const conds: SQL[] = [];
            if (baseWhere) conds.push(baseWhere);
            if (extra) conds.push(extra);
            
            const whereCondition = conds.length > 0 ? and(...conds) : undefined;
            const orderExpr = buildSort(String(sortBy), String(sortDir));

            let query = db.select(getTableColumns(destinationList))
                .from(destinationList)
                .$dynamic();

            if (whereCondition) query = query.where(whereCondition);

            const data = await query.orderBy(orderExpr).limit(lmt).offset(offset);
            res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
        } catch (error) {
            console.error(`Get Destination List error:`, error);
            res.status(500).json({ success: false, error: `Failed to fetch destination list` });
        }
    };

    // 1. GET ALL
    app.get('/api/tally/destinations', (req, res) => listHandler(req, res));

    // 2. GET BY ID
    app.get('/api/tally/destinations/:id', async (req: Request, res: Response) => {
        try {
            const [record] = await db.select()
                .from(destinationList)
                .where(eq(destinationList.id, String(req.params.id)))
                .limit(1);

            if (!record) return res.status(404).json({ success: false, error: 'Destination not found' });
            res.json({ success: true, data: record });
        } catch (error) {
            res.status(500).json({ success: false, error: `Failed to fetch destination` });
        }
    });

    console.log('✅ Destination List GET endpoints setup complete');
}