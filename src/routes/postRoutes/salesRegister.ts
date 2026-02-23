// src/routes/postRoutes/salesRegister.ts
import { Request, Response, Express } from 'express';
import { db } from '../../lib/drizzle';
import { salesRegister } from '../../drizzle/schema';

const getValStr = (obj: any, keys: string[]) => {
    const key = keys.find(k => obj[k] !== undefined && obj[k] !== null && obj[k] !== '');
    return key ? String(obj[key]) : null;
};

const getValNum = (obj: any, keys: string[]) => {
    const val = getValStr(obj, keys);
    return val && !isNaN(Number(val)) ? val : null;
};

const getValDate = (obj: any, keys: string[]) => {
    const val = getValStr(obj, keys);
    return val ? new Date(val).toISOString().split('T')[0] : null;
};

export default function setupSalesRegisterPostRoutes(app: Express) {
    app.post('/api/tally/sales-register', async (req: Request, res: Response): Promise<void> => {
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
                date: getValDate(row, ['Date', 'date']),
                particulars: getValStr(row, ['Particulars', 'particulars']),
                buyer: getValStr(row, ['Buyer', 'buyer']),
                buyerAddress: getValStr(row, ['Buyer Address', 'buyerAddress', 'buyer_address']),
                consignee: getValStr(row, ['Consignee', 'consignee']),
                consigneeAddress: getValStr(row, ['Consignee Address', 'consigneeAddress', 'consignee_address']),
                
                voucherType: getValStr(row, ['Voucher Type', 'voucherType', 'voucher_type']),
                voucherNo: getValStr(row, ['Voucher No.', 'Voucher No', 'voucherNo', 'voucher_no']),
                voucherRefNo: getValStr(row, ['Voucher Ref. No.', 'voucherRefNo', 'voucher_ref_no']),
                
                salesOrderNo: getValStr(row, ['Sales Order No.', 'salesOrderNo', 'sales_order_no']),
                salesOrderDate: getValDate(row, ['Sales Order Date', 'salesOrderDate', 'sales_order_date']),
                dispatchOrderNo: getValStr(row, ['Dispatch Order No.', 'dispatchOrderNo', 'dispatch_order_no']),
                dispatchOrderDate: getValDate(row, ['Dispatch Order Date', 'dispatchOrderDate', 'dispatch_order_date']),
                
                zone: getValStr(row, ['Zone', 'zone']),
                district: getValStr(row, ['District', 'district']),
                destination: getValStr(row, ['Destination', 'destination']),
                
                freightRate: getValNum(row, ['Freight Rate', 'freightRate', 'freight_rate']),
                freightAmount: getValNum(row, ['Freight Amount', 'freightAmount', 'freight_amount']),
                
                parent1: getValStr(row, ['Parent 1', 'parent1']),
                parent2: getValStr(row, ['Parent 2', 'parent2']),
                parent3: getValStr(row, ['Parent 3', 'parent3']),
                
                termsOfPayment: getValStr(row, ['Terms of Payment', 'termsOfPayment', 'terms_of_payment']),
                termsOfDelivery: getValStr(row, ['Terms of Delivery', 'termsOfDelivery', 'terms_of_delivery']),
                dispatchDocNo: getValStr(row, ['Dispatch Document .No.', 'Despatch Doc. No', 'dispatchDocNo', 'dispatch_doc_no']),
                dispatchThroughPartyName: getValStr(row, ['Despatch Through party name', 'dispatchThroughPartyName', 'dispatch_through_party_name']),
                
                lrNo: getValStr(row, ['LR No.', 'lrNo', 'lr_no']),
                lrDate: getValDate(row, ['LR Date', 'lrDate', 'lr_date']),
                vehicleNo: getValStr(row, ['Vehicle No.', 'vehicleNo', 'vehicle_no']),
                ewayBillNo: getValStr(row, ['e-Way Bill No.', 'ewayBillNo', 'eway_bill_no']),
                
                gstinUin: getValStr(row, ['GSTIN/UIN', 'gstinUin', 'gstin_uin']),
                salesTaxNo: getValStr(row, ['Sales Tax No.', 'salesTaxNo', 'sales_tax_no']),
                serviceTaxNo: getValStr(row, ['Service Tax No.', 'serviceTaxNo', 'service_tax_no']),
                panNo: getValStr(row, ['PAN No.', 'panNo', 'pan_no']),
                cstNo: getValStr(row, ['CST No.', 'cstNo', 'cst_no']),
                
                narration: getValStr(row, ['Narration', 'narration']),
                orderAndDate: getValStr(row, ['Order & Date', 'orderAndDate', 'order_and_date']),
                otherReferences: getValStr(row, ['Other References', 'otherReferences', 'other_references']),
                deliveryNoteNoAndDate: getValStr(row, ['Delivery Note No. & Date', 'deliveryNoteNoAndDate', 'delivery_note_no_and_date']),
                
                placeOfReceiptByShipper: getValStr(row, ['Place of Receipt by Shipper', 'placeOfReceiptByShipper', 'place_of_receipt_by_shipper']),
                vesselFlightNo: getValStr(row, ['Vessel/Flight No.', 'vesselFlightNo', 'vessel_flight_no']),
                portOfLoading: getValStr(row, ['Port of Loading', 'portOfLoading', 'port_of_loading']),
                portOfDischarge: getValStr(row, ['Port of Discharge', 'portOfDischarge', 'port_of_discharge']),
                countryTo: getValStr(row, ['Country To', 'countryTo', 'country_to']),
                shippingNo: getValStr(row, ['Shipping No.', 'shippingNo', 'shipping_no']),
                shippingDate: getValDate(row, ['Shipping Date', 'shippingDate', 'shipping_date']),
                portCode: getValStr(row, ['Port Code', 'portCode', 'port_code']),
                
                item: getValStr(row, ['Item', 'item']),
                itemCode: getValStr(row, ['Item Code', 'itemCode', 'item_code']),
                quantity: getValNum(row, ['Quantity', 'quantity']),
                uom: getValStr(row, ['UOM', 'uom']),
                altUnits: getValNum(row, ['Alt. Units', 'altUnits', 'alt_units']),
                altUom: getValStr(row, ['ALT UOM', 'altUom', 'alt_uom']),
                
                rate: getValNum(row, ['Rate', 'rate']),
                ratePerBag: getValNum(row, ['Rate/Bag', 'ratePerBag', 'rate_per_bag']),
                value: getValNum(row, ['Value', 'value']),
                grossTotal: getValNum(row, ['Gross Total', 'grossTotal', 'gross_total']),
                
                interStateSales: getValNum(row, ['Inter_state Sales', 'interStateSales', 'inter_state_sales']),
                interStateSales5Percent: getValNum(row, ['Inter_state Sales 5%', 'interStateSales5Percent', 'inter_state_sales_5_percent']),
                roundOff: getValNum(row, ['Round Off_', 'roundOff', 'round_off']),
                
                igst: getValNum(row, ['IGST', 'igst']),
                cgst: getValNum(row, ['CGST', 'cgst']),
                sgst: getValNum(row, ['SGST', 'sgst']),
                interGroupSale: getValNum(row, ['Inter Group Sale', 'interGroupSale', 'inter_group_sale']),
                
                salesAssam: getValNum(row, ['Sales (Assam)', 'salesAssam', 'sales_assam']),
                salesMizoram: getValNum(row, ['Sales (Mizoram)', 'salesMizoram', 'sales_mizoram']),
                salesMeghalaya: getValNum(row, ['Sales (Meghalaya)', 'salesMeghalaya', 'sales_meghalaya']),
                salesNagaland: getValNum(row, ['Sales (Nagaland)', 'salesNagaland', 'sales_nagaland']),
                salesArunachal: getValNum(row, ['Sales (Arunachal)', 'salesArunachal', 'sales_arunachal']),
                salesTripura: getValNum(row, ['Sales (Tripura)', 'salesTripura', 'sales_tripura']),
            }));

            // Optional: Insert in chunks if data is massive
            const inserted = await db.insert(salesRegister).values(payload).returning();

            res.status(201).json({ success: true, count: inserted.length, data: inserted });
        } catch (error: any) {
            console.error('POST Sales Register error:', error);
            res.status(500).json({ success: false, error: 'Failed to insert sales register data', details: error.message });
        }
    });

    console.log('✅ Sales Register POST endpoint setup complete');
}