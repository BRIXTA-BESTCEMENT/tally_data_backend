CREATE TABLE "tally_dealers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution" varchar(10),
	"name" varchar(255),
	"alias" varchar(255),
	"address1" text,
	"address2" text,
	"address3" text,
	"address4" text,
	"address5" text,
	"bill_wise_details" text,
	"phone" varchar(100),
	"mobile" varchar(100),
	"email" varchar(255),
	"group1" varchar(255),
	"group2" varchar(255),
	"group3" varchar(255),
	"group4" varchar(255),
	"pan" varchar(50),
	"tin" varchar(50),
	"cst" varchar(50),
	"cr_limit" numeric(14, 2),
	"contact_person" varchar(255),
	"state" varchar(100),
	"pincode" varchar(20),
	"gst_reg_type" varchar(100),
	"gst_no" varchar(50),
	"list_of_ledger" text,
	"sd_ledger" text,
	"salesman_name" varchar(255),
	"sales_promoter" varchar(255),
	"security_blank_check_no" varchar(100),
	"destination" varchar(255),
	"district" varchar(255),
	"zone" varchar(255),
	"created_at" timestamp(6) with time zone DEFAULT now(),
	"updated_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_tally_dealers_inst" ON "tally_dealers" USING btree ("institution");--> statement-breakpoint
CREATE INDEX "idx_tally_dealers_name" ON "tally_dealers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_tally_dealers_mobile" ON "tally_dealers" USING btree ("mobile");--> statement-breakpoint
CREATE INDEX "idx_tally_dealers_gst" ON "tally_dealers" USING btree ("gst_no");