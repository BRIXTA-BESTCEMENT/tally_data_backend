import { pgTable, text, timestamp, uuid, jsonb,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const tallyRaw = pgTable("tally_raw", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	collectionName: text("collection_name").notNull(),
	rawData: jsonb("raw_data").notNull(),
	syncedAt: timestamp("synced_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const insertTallyRawTableSchema = createInsertSchema(tallyRaw);
export const selectTallyRawTableSchema = createSelectSchema(tallyRaw);