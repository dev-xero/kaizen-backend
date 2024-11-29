/*
  Warnings:

  - You are about to drop the column `priorityHex` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `priorityLevel` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Task` table. All the data in the column will be lost.
  - Added the required column `Category` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('TODO', 'IN_PROGRESS', 'TESTING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "priorityHex",
DROP COLUMN "priorityLevel",
DROP COLUMN "tags",
ADD COLUMN     "Category" "Category" NOT NULL;

-- DropEnum
DROP TYPE "PriorityLevel";
