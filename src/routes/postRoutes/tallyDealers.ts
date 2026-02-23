// src/routes/postRoutes/tallyDealers.ts
import { Request, Response, Express } from 'express';
import { db } from '../../lib/drizzle';
import { tallyDealers } from '../../drizzle/schema';

const getValStr = (obj: any, keys: string[]) => {
    const key = keys.find(k => obj[k] !== undefined && obj[k] !== null && obj[k] !== '');
    return key ? String(obj[key]).trim() : null;
};

const getValNum = (obj: any, keys: string[]) => {
    const val = getValStr(obj, keys);
    return val && !isNaN(Number(val)) ? val : null;
};

export default function setupTallyDealersPostRoutes(app: Express) {
    app.post('/api/tally/dealers', async (req: Request, res: Response): Promise<void> => {
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
                name: getValStr(row, ['Name', 'name']),
                alias: getValStr(row, ['Alias', 'alias']),
                
                address1: getValStr(row, ['Address1', 'address1']),
                address2: getValStr(row, ['Address2', 'address2']),
                address3: getValStr(row, ['Address3', 'address3']),
                address4: getValStr(row, ['Address4', 'address4']),
                address5: getValStr(row, ['Address5', 'address5']),
                
                billWiseDetails: getValStr(row, ['Bill Wise detls.', 'Bill Wise details', 'billWiseDetails']),
                phone: getValStr(row, ['Phone', 'phone']),
                mobile: getValStr(row, ['Mobile', 'mobile']),
                email: getValStr(row, ['EMAIL', 'Email', 'email']),
                
                group1: getValStr(row, ['Group1', 'group1']),
                group2: getValStr(row, ['Group2', 'group2']),
                group3: getValStr(row, ['Group3', 'group3']),
                group4: getValStr(row, ['Group4', 'group4']),
                
                pan: getValStr(row, ['PAN', 'pan']),
                tin: getValStr(row, ['TIN', 'tin']),
                cst: getValStr(row, ['CST', 'cst']),
                crLimit: getValNum(row, ['CR LIMIT', 'crLimit', 'cr_limit']),
                
                contactPerson: getValStr(row, ['Contact Person', 'contactPerson', 'contact_person']),
                state: getValStr(row, ['State', 'state']),
                pincode: getValStr(row, ['Pincode', 'pincode', 'pin']),
                
                gstRegType: getValStr(row, ['GSTReg.Type', 'GST Reg. Type', 'gstRegType', 'gst_reg_type']),
                gstNo: getValStr(row, ['GST No.', 'GST No', 'gstNo', 'gst_no']),
                
                listOfLedger: getValStr(row, ['List Of Ledger', 'listOfLedger', 'list_of_ledger']),
                sdLedger: getValStr(row, ['SD Ledger', 'sdLedger', 'sd_ledger']),
                
                salesmanName: getValStr(row, ['Salesman Name', 'salesmanName', 'salesman_name']),
                salesPromoter: getValStr(row, ['Sales Promoter', 'salesPromoter', 'sales_promoter']),
                securityBlankCheckNo: getValStr(row, ['Security Blank Check No', 'securityBlankCheckNo', 'security_blank_check_no']),
                
                destination: getValStr(row, ['Destination', 'destination']),
                district: getValStr(row, ['District', 'district']),
                zone: getValStr(row, ['Zone', 'zone']),
            }));

            const inserted = await db.insert(tallyDealers).values(payload).returning();

            res.status(201).json({ success: true, count: inserted.length, data: inserted });
        } catch (error: any) {
            console.error('POST Tally Dealers error:', error);
            res.status(500).json({ success: false, error: 'Failed to insert dealer data', details: error.message });
        }
    });

    console.log('✅ Tally Dealers POST endpoint setup complete');
}