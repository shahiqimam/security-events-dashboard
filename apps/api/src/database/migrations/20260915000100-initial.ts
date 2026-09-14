import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial20260915000100 implements MigrationInterface {
  name = 'Initial20260915000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "source_type_enum" AS ENUM ('MOCK_SIEM','MOCK_EDR','MOCK_IAM')`);
    await queryRunner.query(`CREATE TYPE "severity_enum" AS ENUM ('INFO','LOW','MEDIUM','HIGH','CRITICAL')`);
    await queryRunner.query(`CREATE TYPE "category_enum" AS ENUM ('AUTHENTICATION','MALWARE','PRIVILEGE','NETWORK','POLICY','CONFIGURATION','DATA_ACCESS','ENDPOINT','OTHER')`);
    await queryRunner.query(`CREATE TYPE "event_status_enum" AS ENUM ('OPEN','INVESTIGATING','RESOLVED','FALSE_POSITIVE')`);
    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM ('ADMIN','ANALYST','VIEWER')`);
    await queryRunner.query(`CREATE TYPE "history_action_enum" AS ENUM ('INGESTED','DEDUPLICATED','STATUS_CHANGED','ASSIGNED','UNASSIGNED','NOTE_ADDED','NOTE_EDITED','RESOLVED','REOPENED')`);
    await queryRunner.query(`CREATE TABLE "users" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" varchar NOT NULL, "email" varchar NOT NULL UNIQUE, "passwordHash" varchar NOT NULL, "role" "user_role_enum" NOT NULL DEFAULT 'VIEWER', "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE TABLE "event_sources" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" varchar NOT NULL, "sourceType" "source_type_enum" NOT NULL UNIQUE, "enabled" boolean NOT NULL DEFAULT true, "lastEventAt" timestamptz, "totalEvents" integer NOT NULL DEFAULT 0, "lastError" varchar, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE TABLE "security_events" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "sourceType" "source_type_enum" NOT NULL, "sourceEventId" varchar NOT NULL, "title" varchar NOT NULL, "description" varchar, "severity" "severity_enum" NOT NULL, "category" "category_enum" NOT NULL, "status" "event_status_enum" NOT NULL DEFAULT 'OPEN', "assetName" varchar, "username" varchar, "sourceIp" varchar, "detectedAt" timestamptz NOT NULL, "firstSeenAt" timestamptz NOT NULL, "lastSeenAt" timestamptz NOT NULL, "occurrenceCount" integer NOT NULL DEFAULT 1, "fingerprint" varchar NOT NULL, "rawPayload" jsonb NOT NULL, "assignedToId" uuid, "resolvedAt" timestamptz, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "UQ_security_event_source" UNIQUE ("sourceType","sourceEventId"), CONSTRAINT "FK_security_assignee" FOREIGN KEY ("assignedToId") REFERENCES "users"("id"))`);
    await queryRunner.query(`CREATE TABLE "event_notes" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "eventId" uuid NOT NULL REFERENCES "security_events"("id") ON DELETE CASCADE, "authorId" uuid NOT NULL REFERENCES "users"("id"), "content" text NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE TABLE "event_history" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "eventId" uuid NOT NULL REFERENCES "security_events"("id") ON DELETE CASCADE, "actorId" uuid REFERENCES "users"("id"), "action" "history_action_enum" NOT NULL, "previousValue" jsonb, "newValue" jsonb, "createdAt" timestamptz NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE INDEX "IDX_event_detected" ON "security_events" ("detectedAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_severity" ON "security_events" ("severity")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_status" ON "security_events" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_source" ON "security_events" ("sourceType")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_category" ON "security_events" ("category")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_asset" ON "security_events" ("assetName")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_assignee" ON "security_events" ("assignedToId")`);
    await queryRunner.query(`INSERT INTO "event_sources" ("name", "sourceType") VALUES ('Mock SIEM','MOCK_SIEM'), ('Mock EDR','MOCK_EDR'), ('Mock IAM','MOCK_IAM')`);
    await queryRunner.query(`INSERT INTO "users" ("name", "email", "passwordHash", "role") VALUES ('Admin Analyst','admin@sentinelview.local','$2b$10$5K/XJqGbZ084GG/1VJ.bN.sGoSaXSfwxVIhBIU0BmOboFxATfu/uO','ADMIN'), ('Demo Analyst','analyst@sentinelview.local','$2b$10$5K/XJqGbZ084GG/1VJ.bN.sGoSaXSfwxVIhBIU0BmOboFxATfu/uO','ANALYST'), ('Demo Viewer','viewer@sentinelview.local','$2b$10$5K/XJqGbZ084GG/1VJ.bN.sGoSaXSfwxVIhBIU0BmOboFxATfu/uO','VIEWER')`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "event_history"`);
    await queryRunner.query(`DROP TABLE "event_notes"`);
    await queryRunner.query(`DROP TABLE "security_events"`);
    await queryRunner.query(`DROP TABLE "event_sources"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "history_action_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
    await queryRunner.query(`DROP TYPE "event_status_enum"`);
    await queryRunner.query(`DROP TYPE "category_enum"`);
    await queryRunner.query(`DROP TYPE "severity_enum"`);
    await queryRunner.query(`DROP TYPE "source_type_enum"`);
  }
}

