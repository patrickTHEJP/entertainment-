/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Groomer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Groomer_name_key" ON "Groomer"("name");
