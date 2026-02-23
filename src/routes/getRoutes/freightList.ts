// src/routes/getRoutes/freightList.ts
import { Request, Response, Express } from 'express';
import { db } from '../../lib/drizzle';
import { freightList } from '../../drizzle/schema'; 
import { eq, and, desc, asc, SQL, gte, lte, ilike, getTableColumns } from 'drizzle-orm';

export default function setupFreightListGetRoutes(app: Express) {

    const buildWhere = (q: any): SQL | undefined => {
        const conds: SQL[] = [];

        if (q.institution) conds.push(eq(freightList.institution, String(q.institution)));
        if (q.destFrom) conds.push(ilike(freightList.destFrom, `%${String(q.destFrom)}%`));
        if (q.destTo) conds.push(ilike(freightList.destTo, `%${String(q.destTo)}%`));

        if (q.startDate && q.endDate) {
            conds.push(gte(freightList.dateEffective, String(q.startDate)));
            conds.push(lte(freightList.dateEffective, String(q.endDate)));
        }

        if (conds.length === 0) return undefined;
        return conds.length === 1 ? conds[0] : and(...conds);
    };

    const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
        const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
        switch (sortByRaw) {
            case 'dateEffective': return direction === 'asc' ? asc(freightList.dateEffective) : desc(freightList.dateEffective);
            case 'km': return direction === 'asc' ? asc(freightList.km) : desc(freightList.km);
            case 'createdAt':
            default: return desc(freightList.createdAt);
        }
    };

    const listHandler = async (req: Request, res: Response, baseWhere?: SQL) => {
        try {
            const { limit = '50', page = '1', sortBy, sortDir, ...filters } = req.query;
            const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
            const offset = (Math.max(1, parseInt(String(page), 10) || 1) - 1) * lmt;

            const extra = buildWhere(filters);
            const conds: SQL[] = [];
            if (baseWhere) conds.push(baseWhere);
            if (extra) conds.push(extra);
            
            let query = db.select(getTableColumns(freightList)).from(freightList).$dynamic();
            if (conds.length > 0) query = query.where(and(...conds));

            const data = await query.orderBy(buildSort(String(sortBy), String(sortDir))).limit(lmt).offset(offset);
            res.json({ success: true, count: data.length, data });
        } catch (error) {
            console.error(`Get Freight List error:`, error);
            res.status(500).json({ success: false, error: `Failed to fetch freight entries` });
        }
    };

    app.get('/api/tally/freight', (req, res) => listHandler(req, res));

    app.get('/api/tally/freight/:id', async (req: Request, res: Response) => {
        try {
            const [record] = await db.select()
                .from(freightList)
                .where(eq(freightList.id, String(req.params.id)))
                .limit(1);
            if (!record) return res.status(404).json({ success: false, error: 'Freight entry not found' });
            res.json({ success: true, data: record });
        } catch (error) {
            res.status(500).json({ success: false, error: `Failed to fetch freight entry` });
        }
    });

    console.log('✅ Freight List GET endpoints setup complete');
}