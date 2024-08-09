DO $$ BEGIN
 CREATE TYPE "public"."allowedAccess" AS ENUM('public', 'permissive', 'customers', 'permit', 'private', 'mixed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."amountOfPeople" AS ENUM('none', 'few', 'some', 'many', 'crowded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."difficulty" AS ENUM('accessible', 'normal', 'smallEffort', 'hard', 'dangerous');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."groundType" AS ENUM('sand', 'pebbles', 'rocks', 'concrete', 'dirt', 'pavimented');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."howNarrow" AS ENUM('extremlyNarrow', 'narrow', 'extraSpace', 'wide', 'veryWide');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."placeToArriveFrom" AS ENUM('townCenter', 'parking', 'beach', 'road');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."priceUnit" AS ENUM('eur', 'eur/minute', 'eur/hour', 'eur/day');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."scubaDivingLevel" AS ENUM('discoverScubaDiving', 'openWater', 'advancedOpenWater', 'specialtyDiver', 'technicalDiver');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."trainingLevel" AS ENUM('noTraining', 'amateur', 'entryLevel', 'advanced', 'professional', 'elite');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."gender" AS ENUM('masculine', 'feminine');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "externalLink" (
	"id" serial PRIMARY KEY NOT NULL,
	"placeId" integer,
	"routeId" integer,
	"isOfficialWebsite" boolean,
	"url" text NOT NULL,
	"title" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "externalLink_translation" (
	"id" serial PRIMARY KEY NOT NULL,
	"externalLink_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"url" text NOT NULL,
	"title" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature" (
	"id" serial PRIMARY KEY NOT NULL,
	"amountOfPeople" "amountOfPeople",
	"difficulty" "difficulty",
	"groundType" "groundType",
	"hasBus" boolean,
	"hasParking" boolean,
	"parkingSpaces" integer,
	"hasToilet" boolean,
	"hasRestaurant" boolean,
	"hasDrinkingWater" boolean,
	"hasShower" boolean,
	"hasLifeguard" boolean,
	"hasLeisure" boolean,
	"isNudist" boolean,
	"hasUnofficialName" boolean,
	"hasInacurateLocation" boolean,
	"date" text,
	"isBoatOnly" boolean,
	"trainingLevel" "trainingLevel",
	"hasMissingInfo" boolean,
	"height" integer,
	"depth" integer,
	"depthMin" integer,
	"depthMax" integer,
	"scubaDivingLevel" "scubaDivingLevel",
	"notThereAnymore" boolean,
	"isOutOfTheMunicipality" boolean,
	"hasBench" boolean,
	"allowedAccess" "allowedAccess",
	"dimensions" text,
	"price" double precision,
	"priceUnit" "priceUnit",
	"isCovered" boolean,
	"duration" integer,
	"distance" integer,
	"slope" integer,
	"timeToArrive" integer,
	"placeToArriveFrom" "placeToArriveFrom",
	"isFreeWithLocalStamp" boolean,
	"howNarrow" "howNarrow",
	"difficultyNotes" text,
	"priceNotes" text,
	"allowedAccessNotes" text,
	"hasInacurateLocationNotes" text,
	"hasMissingInfoNotes" text,
	"notThereAnymoreNotes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature_translation" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"difficultyNotes" text,
	"priceNotes" text,
	"allowedAccessNotes" text,
	"hasInacurateLocationNotes" text,
	"hasMissingInfoNotes" text,
	"notThereAnymoreNotes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "image" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(1024) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"source" text,
	"captureDate" timestamp,
	"alt" text,
	"blurDataURL" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "placeCategory" (
	"id" serial PRIMARY KEY NOT NULL,
	"icon" text NOT NULL,
	"color" text NOT NULL,
	"hasVisitMission" boolean DEFAULT true NOT NULL,
	"order" integer,
	"name" text NOT NULL,
	"namePlural" text NOT NULL,
	"nameGender" "gender"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "placeCategory_translation" (
	"id" serial PRIMARY KEY NOT NULL,
	"placeCategory_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"namePlural" text NOT NULL,
	"nameGender" "gender"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "placeToPlaceCategory" (
	"placeId" integer NOT NULL,
	"categoryId" integer NOT NULL,
	CONSTRAINT "placeToPlaceCategory_categoryId_placeId_pk" PRIMARY KEY("categoryId","placeId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "placeCategoryToPlaceCategoryGroup" (
	"categoryGroupId" integer NOT NULL,
	"categoryId" integer NOT NULL,
	"highlight" boolean,
	CONSTRAINT "placeCategoryToPlaceCategoryGroup_categoryGroupId_categoryId_pk" PRIMARY KEY("categoryGroupId","categoryId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "placeCategoryGroup" (
	"id" serial PRIMARY KEY NOT NULL,
	"icon" text NOT NULL,
	"color" text NOT NULL,
	"order" integer,
	"name" text NOT NULL,
	"nameGender" "gender"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "placeCategoryGroup_translation" (
	"id" serial PRIMARY KEY NOT NULL,
	"placeCategoryGroup_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"nameGender" "gender"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "placeListToPlace" (
	"placeListId" integer NOT NULL,
	"placeId" integer NOT NULL,
	"addedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "placeListToPlace_placeId_placeListId_pk" PRIMARY KEY("placeId","placeListId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "placeList" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "place" (
	"id" serial PRIMARY KEY NOT NULL,
	"mainImageId" integer,
	"googleMapsId" text,
	"location" geometry(point,25831) NOT NULL,
	"mainCategoryId" integer NOT NULL,
	"featuresId" integer NOT NULL,
	"verificationRequirementsId" integer,
	"importance" double precision,
	"name" text NOT NULL,
	"description" text,
	"content" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "place_translation" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"content" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "routeCategory" (
	"id" serial PRIMARY KEY NOT NULL,
	"icon" text NOT NULL,
	"color" text NOT NULL,
	"hasVisitMission" boolean DEFAULT true NOT NULL,
	"order" integer,
	"name" text NOT NULL,
	"namePlural" text NOT NULL,
	"nameGender" "gender"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "routeCategory_translation" (
	"id" serial PRIMARY KEY NOT NULL,
	"routeCategory_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"namePlural" text NOT NULL,
	"nameGender" "gender"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "routeToRouteCategory" (
	"routeId" integer NOT NULL,
	"categoryId" integer NOT NULL,
	CONSTRAINT "routeToRouteCategory_categoryId_routeId_pk" PRIMARY KEY("categoryId","routeId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "route" (
	"id" serial PRIMARY KEY NOT NULL,
	"mainImageId" integer,
	"path" Geometry(MultiLineString,25831) NOT NULL,
	"mainCategoryId" integer NOT NULL,
	"featuresId" integer NOT NULL,
	"verificationRequirementsId" integer,
	"importance" double precision,
	"name" text NOT NULL,
	"description" text,
	"content" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "routeToPlace" (
	"routeId" integer NOT NULL,
	"placeId" integer NOT NULL,
	CONSTRAINT "routeToPlace_placeId_routeId_pk" PRIMARY KEY("placeId","routeId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "route_translation" (
	"id" serial PRIMARY KEY NOT NULL,
	"route_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"content" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" text,
	"hashedPassword" varchar(255),
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"visitedPlaceListId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationRequirement" (
	"id" serial PRIMARY KEY NOT NULL,
	"isLocationRequired" boolean DEFAULT true NOT NULL,
	"maxLocationDistance" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"placeId" integer NOT NULL,
	"userId" varchar(255) NOT NULL,
	"validatedOn" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deviceLocation" geometry(point,25831),
	"deviceLocationAccuracy" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
