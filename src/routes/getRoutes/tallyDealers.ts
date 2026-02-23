// src/routes/getRoutes/tallyDealers.ts
import { Request, Response, Express } from 'express';
import { db } from '../../lib/drizzle';
import { tallyDealers } from '../../drizzle/schema';
import { eq, and, desc, asc, SQL, ilike, getTableColumns } from 'drizzle-orm';

export default function setupTallyDealersGetRoutes(app: Express) {

    const buildWhere = (q: any): SQL | undefined => {
        const conds: SQL[] = [];

        if (q.institution) conds.push(eq(tallyDealers.institution, String(q.institution)));
        if (q.name) conds.push(ilike(tallyDealers.name, `%${String(q.name)}%`));
        if (q.mobile) conds.push(ilike(tallyDealers.mobile, `%${String(q.mobile)}%`));
        if (q.gstNo) conds.push(ilike(tallyDealers.gstNo, `%${String(q.gstNo)}%`));
        if (q.district) conds.push(ilike(tallyDealers.district, `%${String(q.district)}%`));
        if (q.zone) conds.push(ilike(tallyDealers.zone, `%${String(q.zone)}%`));

        if (conds.length === 0) return undefined;
        return conds.length === 1 ? conds[0] : and(...conds);
    };

    const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
        const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
        switch (sortByRaw) {
            case 'name': return direction === 'asc' ? asc(tallyDealers.name) : desc(tallyDealers.name);
            case 'crLimit': return direction === 'asc' ? asc(tallyDealers.crLimit) : desc(tallyDealers.crLimit);
            case 'createdAt':
            default: return desc(tallyDealers.createdAt);
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
            
            let query = db.select(getTableColumns(tallyDealers)).from(tallyDealers).$dynamic();
            if (conds.length > 0) query = query.where(and(...conds));

            const data = await query.orderBy(buildSort(String(sortBy), String(sortDir))).limit(lmt).offset(offset);
            res.json({ success: true, count: data.length, page: parseInt(String(page)), data });
        } catch (error) {
            console.error(`Get Tally Dealers error:`, error);
            res.status(500).json({ success: false, error: `Failed to fetch dealer entries` });
        }
    };

    app.get('/api/tally/dealers', (req, res) => listHandler(req, res));

    app.get('/api/tally/dealers/:id', async (req: Request, res: Response): Promise<void> => {
        try {
            const [record] = await db.select()
                .from(tallyDealers)
                .where(eq(tallyDealers.id, String(req.params.id)))
                .limit(1);
            
            if (!record) {
                res.status(404).json({ success: false, error: 'Dealer entry not found' });
                return;
            }
            res.json({ success: true, data: record });
        } catch (error) {
            res.status(500).json({ success: false, error: `Failed to fetch dealer entry` });
        }
    });

    console.log('✅ Tally Dealers GET endpoints setup complete');
}