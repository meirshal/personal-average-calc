CREATE TABLE "admin_school" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_school" ADD CONSTRAINT "admin_school_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_school" ADD CONSTRAINT "admin_school_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_school_admin_id_school_id_idx" ON "admin_school" USING btree ("admin_id","school_id");--> statement-breakpoint
INSERT INTO "admin_school" ("admin_id", "school_id") SELECT "id", "school_id" FROM "admin";--> statement-breakpoint
ALTER TABLE "admin" DROP CONSTRAINT "admin_school_id_school_id_fk";
--> statement-breakpoint
ALTER TABLE "admin" DROP COLUMN "school_id";