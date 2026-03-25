-- AlterTable: add optional daily macro goal fields to the User model
ALTER TABLE "User" ADD COLUMN "proteinGoal"  INTEGER;
ALTER TABLE "User" ADD COLUMN "carbsGoal"    INTEGER;
ALTER TABLE "User" ADD COLUMN "fatGoal"      INTEGER;
ALTER TABLE "User" ADD COLUMN "caloriesGoal" INTEGER;