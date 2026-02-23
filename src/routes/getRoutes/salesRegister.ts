// src/routes/getRoutes/salesRegister.ts
import { Request, Response, Express } from 'express';
import { db } from '../../lib/drizzle';
import { salesRegister } from '../../drizzle/schema'; 
import { eq, and, desc, asc, SQL, gte, lte, ilike, getTableColumns } from 'drizzle-orm';

export default function setupSalesRegisterGetRoutes(app: Express) {

    const buildWhere = (q: any): SQL | undefined => {
        const conds: SQL[] = [];

        if (q.institution) conds.push(eq(salesRegister.institution, String(q.institution)));
        if (q.voucherNo) conds.push(eq(salesRegister.voucherNo, String(q.voucherNo)));
        if (q.buyer) conds.push(ilike(salesRegister.buyer, `%${String(q.buyer)}%`));
        if (q.destination) conds.push(ilike(salesRegister.destination, `%${String(q.destination)}%`));
        if (q.item) conds.push(ilike(salesRegister.item, `%${String(q.item)}%`));

        if (q.startDate && q.endDate) {
            conds.push(gte(salesRegister.date, String(q.startDate)));
            conds.push(lte(salesRegister.date, String(q.endDate)));
        }

        if (conds.length === 0) return undefined;
        return conds.length === 1 ? conds[0] : and(...conds);
    };

    const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
        const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
        switch (sortByRaw) {
            case 'date': return direction === 'asc' ? asc(salesRegister.date) : desc(salesRegister.date);
            case 'value': return direction === 'asc' ? asc(salesRegister.value) : desc(salesRegister.value);
            case 'grossTotal': return direction === 'asc' ? asc(salesRegister.grossTotal) : desc(salesRegister.grossTotal);
            case 'createdAt':
            default: return desc(salesRegister.createdAt);
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
            
            let query = db.select(getTableColumns(salesRegister)).from(salesRegister).$dynamic();
            if (conds.length > 0) query = query.where(and(...conds));

            const data = await query.orderBy(buildSort(String(sortBy), String(sortDir))).limit(lmt).offset(offset);
            res.json({ success: true, page: parseInt(String(page)), count: data.length, data });
        } catch (error) {
            console.error(`Get Sales Register error:`, error);
            res.status(500).json({ success: false, error: `Failed to fetch sales register entries` });
        }
    };

    app.get('/api/tally/sales-register', (req, res) => listHandler(req, res));

    app.get('/api/tally/sales-register/:id', async (req: Request, res: Response) => {
        try {
            const [record] = await db.select()
                .from(salesRegister)
                .where(eq(salesRegister.id, String(req.params.id)))
                .limit(1);

            if (!record) return res.status(404).json({ success: false, error: 'Sales Register entry not found' });
            res.json({ success: true, data: record });
        } catch (error) {
            res.status(500).json({ success: false, error: `Failed to fetch sales register entry` });
        }
    });

    console.log('✅ Sales Register GET endpoints setup complete');
}