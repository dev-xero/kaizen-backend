/*
  Warnings:

  - You are about to drop the column `Category` on the `Task` table. All the data in the column will be lost.
  - Added the required column `category` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "Category",
ADD COLUMN     "category" "Category" NOT NULL;
