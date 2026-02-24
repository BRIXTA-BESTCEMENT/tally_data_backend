import { pgTable, text, timestamp, uuid, jsonb, numeric, date, varchar, 
	index, uniqueIndex, unique
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const tallyRaw = pgTable("tally_raw", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	collectionName: text("collection_name").notNull(),
	rawData: jsonb("raw_data").notNull(),
	syncedAt: timestamp("synced_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const tallyDealers = pgTable("tally_dealers", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  institution: varchar("institution", { length: 10 }), // 'JSB' or 'JUD'
  
  name: varchar("name", { length: 255 }),
  alias: varchar("alias", { length: 255 }),
  
  address1: text("address1"),
  address2: text("address2"),
  address3: text("address3"),
  address4: text("address4"),
  address5: text("address5"),
  
  billWiseDetails: text("bill_wise_details"),
  phone: varchar("phone", { length: 100 }),
  mobile: varchar("mobile", { length: 100 }),
  email: varchar("email", { length: 255 }),
  
  group1: varchar("group1", { length: 255 }),
  group2: varchar("group2", { length: 255 }),
  group3: varchar("group3", { length: 255 }),
  group4: varchar("group4", { length: 255 }),
  
  pan: varchar("pan", { length: 50 }),
  tin: varchar("tin", { length: 50 }),
  cst: varchar("cst", { length: 50 }),
  crLimit: numeric("cr_limit", { precision: 14, scale: 2 }), // Credit Limit
  
  contactPerson: varchar("contact_person", { length: 255 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 20 }),
  
  gstRegType: varchar("gst_reg_type", { length: 100 }),
  gstNo: varchar("gst_no", { length: 50 }),
  
  listOfLedger: text("list_of_ledger"),
  sdLedger: text("sd_ledger"),
  
  salesmanName: varchar("salesman_name", { length: 255 }),
  salesPromoter: varchar("sales_promoter", { length: 255 }),
  securityBlankCheckNo: varchar("security_blank_check_no", { length: 100 }),
  
  destination: varchar("destination", { length: 255 }),
  district: varchar("district", { length: 255 }),
  zone: varchar("zone", { length: 255 }),

  createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  index("idx_tally_dealers_inst").using("btree", table.institution.asc().nullsLast()),
  index("idx_tally_dealers_name").using("btree", table.name.asc().nullsLast()),
  index("idx_tally_dealers_mobile").using("btree", table.mobile.asc().nullsLast()),
  index("idx_tally_dealers_gst").using("btree", table.gstNo.asc().nullsLast()),
]);

export const freightList = pgTable("freight_list", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  institution: varchar("institution", { length: 10 }), 

  dateEffective: date("date_effective"),
  destFrom: varchar("dest_from", { length: 255 }),
  destTo: varchar("dest_to", { length: 255 }),
  km: numeric("km", { precision: 10, scale: 2 }),
  
  // JUD SPECIFIC COLUMN
  ratePerMt: numeric("rate_per_mt", { precision: 10, scale: 2 }),
  
  // JSB SPECIFIC COLUMNS
  ratePerMtAbove4: numeric("rate_per_mt_above_4", { precision: 10, scale: 2 }),
  ratePerMtUpto4: numeric("rate_per_mt_upto_4", { precision: 10, scale: 2 }),

  // Timestamps (Still auto-generate, but don't strictly enforce Not Null)
  createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  // Indexes work perfectly fine with nullable columns
  index("idx_freight_institution_date").using("btree", table.institution.asc().nullsLast(), table.dateEffective.asc().nullsLast()),
]);

export const destinationList = pgTable("destination_list", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  institution: varchar("institution", { length: 10 }), 
  
  // SHARED COLUMNS
  destination: varchar("destination", { length: 255 }),
  district: varchar("district", { length: 255 }),
  zone: varchar("zone", { length: 255 }),

  createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  index("idx_destination_institution").using("btree", table.institution.asc().nullsLast()),
  index("idx_destination_name").using("btree", table.destination.asc().nullsLast()),
]);

export const salesRegister = pgTable("sales_register", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  institution: varchar("institution", { length: 10 }),
  
  date: date("date"),
  particulars: varchar("particulars", { length: 255 }),
  buyer: varchar("buyer", { length: 255 }),
  buyerAddress: text("buyer_address"),
  consignee: varchar("consignee", { length: 255 }),
  consigneeAddress: text("consignee_address"),
  
  voucherType: varchar("voucher_type", { length: 100 }),
  voucherNo: varchar("voucher_no", { length: 100 }),
  voucherRefNo: varchar("voucher_ref_no", { length: 100 }),
  
  salesOrderNo: varchar("sales_order_no", { length: 100 }),
  salesOrderDate: date("sales_order_date"),
  dispatchOrderNo: varchar("dispatch_order_no", { length: 100 }),
  dispatchOrderDate: date("dispatch_order_date"),
  
  zone: varchar("zone", { length: 100 }),
  district: varchar("district", { length: 100 }),
  destination: varchar("destination", { length: 255 }),
  
  freightRate: numeric("freight_rate", { precision: 14, scale: 2 }),
  freightAmount: numeric("freight_amount", { precision: 14, scale: 2 }),
  
  parent1: varchar("parent_1", { length: 255 }),
  parent2: varchar("parent_2", { length: 255 }),
  parent3: varchar("parent_3", { length: 255 }),
  
  termsOfPayment: text("terms_of_payment"),
  termsOfDelivery: text("terms_of_delivery"),
  dispatchDocNo: varchar("dispatch_doc_no", { length: 100 }),
  dispatchThroughPartyName: varchar("dispatch_through_party_name", { length: 255 }),
  
  lrNo: varchar("lr_no", { length: 100 }),
  lrDate: date("lr_date"),
  vehicleNo: varchar("vehicle_no", { length: 50 }),
  ewayBillNo: varchar("eway_bill_no", { length: 100 }),
  
  gstinUin: varchar("gstin_uin", { length: 50 }),
  salesTaxNo: varchar("sales_tax_no", { length: 50 }),
  serviceTaxNo: varchar("service_tax_no", { length: 50 }),
  panNo: varchar("pan_no", { length: 50 }),
  cstNo: varchar("cst_no", { length: 50 }),
  
  narration: text("narration"),
  orderAndDate: varchar("order_and_date", { length: 255 }),
  otherReferences: varchar("other_references", { length: 255 }),
  deliveryNoteNoAndDate: varchar("delivery_note_no_and_date", { length: 255 }),
  
  placeOfReceiptByShipper: varchar("place_of_receipt_by_shipper", { length: 255 }),
  vesselFlightNo: varchar("vessel_flight_no", { length: 100 }),
  portOfLoading: varchar("port_of_loading", { length: 255 }),
  portOfDischarge: varchar("port_of_discharge", { length: 255 }),
  countryTo: varchar("country_to", { length: 100 }),
  shippingNo: varchar("shipping_no", { length: 100 }),
  shippingDate: date("shipping_date"),
  portCode: varchar("port_code", { length: 50 }),
  
  item: varchar("item", { length: 255 }),
  itemCode: varchar("item_code", { length: 100 }),
  quantity: numeric("quantity", { precision: 14, scale: 3 }),
  uom: varchar("uom", { length: 50 }),
  altUnits: numeric("alt_units", { precision: 14, scale: 3 }),
  altUom: varchar("alt_uom", { length: 50 }),
  
  rate: numeric("rate", { precision: 14, scale: 2 }),
  ratePerBag: numeric("rate_per_bag", { precision: 14, scale: 2 }),
  value: numeric("value", { precision: 14, scale: 2 }),
  grossTotal: numeric("gross_total", { precision: 14, scale: 2 }),
  
  interStateSales: numeric("inter_state_sales", { precision: 14, scale: 2 }),
  interStateSales5Percent: numeric("inter_state_sales_5_percent", { precision: 14, scale: 2 }),
  roundOff: numeric("round_off", { precision: 14, scale: 2 }),
  
  igst: numeric("igst", { precision: 14, scale: 2 }),
  cgst: numeric("cgst", { precision: 14, scale: 2 }),
  sgst: numeric("sgst", { precision: 14, scale: 2 }),
  interGroupSale: numeric("inter_group_sale", { precision: 14, scale: 2 }),
  
  salesAssam: numeric("sales_assam", { precision: 14, scale: 2 }),
  salesMizoram: numeric("sales_mizoram", { precision: 14, scale: 2 }),
  salesMeghalaya: numeric("sales_meghalaya", { precision: 14, scale: 2 }),
  salesNagaland: numeric("sales_nagaland", { precision: 14, scale: 2 }),
  salesArunachal: numeric("sales_arunachal", { precision: 14, scale: 2 }),
  salesTripura: numeric("sales_tripura", { precision: 14, scale: 2 }),
  salesManipur: numeric("sales_manipur", { precision: 14, scale: 2 }),

  createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  index("idx_sales_reg_inst_date").using("btree", table.institution.asc().nullsLast(), table.date.asc().nullsLast()),
  index("idx_sales_reg_voucher").using("btree", table.voucherNo.asc().nullsLast()),
  index("idx_sales_reg_buyer").using("btree", table.buyer.asc().nullsLast()),
]);

/* ================================= XXXXXXXXXXX ================================ */
/* ========================= drizzle-zod insert schemas ========================= */
/* ================================= XXXXXXXXXXX ================================ */

export const insertTallyRawTableSchema = createInsertSchema(tallyRaw);
export const insertTallyDealersSchema = createInsertSchema(tallyDealers);
export const insertFreightListSchema = createInsertSchema(freightList);
export const insertDestinationListSchema = createInsertSchema(destinationList);
export const insertSalesRegisterSchema = createInsertSchema(salesRegister);

/* ================================= XXXXXXXXXXX ================================ */
/* ========================= drizzle-zod select schemas ========================= */
/* ================================= XXXXXXXXXXX ================================ */

export const selectTallyRawTableSchema = createSelectSchema(tallyRaw);
export const selectTallyDealersSchema = createSelectSchema(tallyDealers);
export const selectFreightListSchema = createSelectSchema(freightList);
export const selectDestinationListSchema = createSelectSchema(destinationList);
export const selectSalesRegisterSchema = createSelectSchema(salesRegister);