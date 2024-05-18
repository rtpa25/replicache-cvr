/*
  Warnings:

  - You are about to drop the column `row_version` on the `clients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "row_version";
