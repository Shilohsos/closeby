CREATE TABLE "hush_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizer_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"flyer_url" text,
	"payment_proof_url" text,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"ticket_price" integer NOT NULL,
	"event_date" timestamp NOT NULL,
	"location" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"capacity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hush_fees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hush_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"buyer_id" text NOT NULL,
	"buyer_name" text NOT NULL,
	"reference_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hush_tickets_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"location" text NOT NULL,
	"price" integer NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storefronts" (
	"user_id" text PRIMARY KEY NOT NULL,
	"bio" text,
	"avatar_url" text,
	"phone" text,
	"social_links" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
ALTER TABLE "hush_fees" ADD CONSTRAINT "hush_fees_ticket_id_hush_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."hush_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hush_tickets" ADD CONSTRAINT "hush_tickets_event_id_hush_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."hush_events"("id") ON DELETE no action ON UPDATE no action;