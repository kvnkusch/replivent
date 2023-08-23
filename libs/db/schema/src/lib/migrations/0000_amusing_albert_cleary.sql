DO $$ BEGIN
 CREATE TYPE "compliance_rule_attribute" AS ENUM('rocket_trip_start_minus_passenger_health_check_in_days', 'percent_healthy_passengers', 'percent_at_risk_passengers', 'percent_unhealthy_passengers', 'passenger_age');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "health_check_status" AS ENUM('healthy', 'at_risk', 'unhealthy');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "op" AS ENUM('eq', 'ne', 'ge', 'gt', 'le', 'lt');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "sync_action_type" AS ENUM('insert', 'update', 'delete');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "launch_pad" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified_version" integer NOT NULL,
	"deleted" boolean DEFAULT false,
	"name" text NOT NULL,
	"location_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "location" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified_version" integer NOT NULL,
	"deleted" boolean DEFAULT false,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "location_compliance_rule" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified_version" integer NOT NULL,
	"deleted" boolean DEFAULT false,
	"location_id" uuid NOT NULL,
	"attribute" "compliance_rule_attribute" NOT NULL,
	"op" "op" NOT NULL,
	"value" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "person" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified_version" integer NOT NULL,
	"deleted" boolean DEFAULT false,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"birth_date" date,
	"phone_number" text,
	"email" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "person_health_check" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified_version" integer NOT NULL,
	"deleted" boolean DEFAULT false,
	"date" date NOT NULL,
	"person_id" uuid NOT NULL,
	"weight_lbs" numeric NOT NULL,
	"status" "health_check_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rocket" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified_version" integer NOT NULL,
	"deleted" boolean DEFAULT false,
	"model_id" uuid NOT NULL,
	"serial_number" text NOT NULL,
	CONSTRAINT "rocket_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rocket_model" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified_version" integer NOT NULL,
	"deleted" boolean DEFAULT false,
	"name" text NOT NULL,
	"max_passenger_capacity" integer,
	"weight_limit_lbs" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rocket_trip" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified_version" integer NOT NULL,
	"deleted" boolean DEFAULT false,
	"rocket_id" uuid NOT NULL,
	"start" timestamp NOT NULL,
	"start_launch_pad_id" uuid NOT NULL,
	"end" timestamp NOT NULL,
	"end_launch_pad_id" uuid NOT NULL,
	"passenger_capacity" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rocket_trip_compliance_rule" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified_version" integer NOT NULL,
	"deleted" boolean DEFAULT false,
	"rocket_trip_id" uuid NOT NULL,
	"attribute" "compliance_rule_attribute" NOT NULL,
	"op" "op" NOT NULL,
	"value" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rocket_trip_passenger" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified_version" integer NOT NULL,
	"deleted" boolean DEFAULT false,
	"rocket_trip_id" uuid NOT NULL,
	"person_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_action" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"model_name" text NOT NULL,
	"model_id" uuid NOT NULL,
	"type" "sync_action_type" NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "global_replicache_client" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"client_group_id" uuid NOT NULL,
	"last_mutation_id" integer NOT NULL,
	"last_modified_version" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "global_replicache_client_group" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "global_replicache_space" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_action_replicache_client" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"client_group_id" uuid NOT NULL,
	"last_mutation_id" integer NOT NULL,
	"last_sync_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_action_replicache_client_group" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "model_index" ON "sync_action" ("model_name","model_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "launch_pad" ADD CONSTRAINT "launch_pad_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "location_compliance_rule" ADD CONSTRAINT "location_compliance_rule_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person_health_check" ADD CONSTRAINT "person_health_check_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rocket" ADD CONSTRAINT "rocket_model_id_rocket_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "rocket_model"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rocket_trip" ADD CONSTRAINT "rocket_trip_rocket_id_rocket_id_fk" FOREIGN KEY ("rocket_id") REFERENCES "rocket"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rocket_trip" ADD CONSTRAINT "rocket_trip_start_launch_pad_id_launch_pad_id_fk" FOREIGN KEY ("start_launch_pad_id") REFERENCES "launch_pad"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rocket_trip" ADD CONSTRAINT "rocket_trip_end_launch_pad_id_launch_pad_id_fk" FOREIGN KEY ("end_launch_pad_id") REFERENCES "launch_pad"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rocket_trip_compliance_rule" ADD CONSTRAINT "rocket_trip_compliance_rule_rocket_trip_id_rocket_trip_id_fk" FOREIGN KEY ("rocket_trip_id") REFERENCES "rocket_trip"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rocket_trip_passenger" ADD CONSTRAINT "rocket_trip_passenger_rocket_trip_id_rocket_trip_id_fk" FOREIGN KEY ("rocket_trip_id") REFERENCES "rocket_trip"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rocket_trip_passenger" ADD CONSTRAINT "rocket_trip_passenger_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "global_replicache_client" ADD CONSTRAINT "global_replicache_client_client_group_id_global_replicache_client_group_id_fk" FOREIGN KEY ("client_group_id") REFERENCES "global_replicache_client_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sync_action_replicache_client" ADD CONSTRAINT "sync_action_replicache_client_client_group_id_sync_action_replicache_client_group_id_fk" FOREIGN KEY ("client_group_id") REFERENCES "sync_action_replicache_client_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
