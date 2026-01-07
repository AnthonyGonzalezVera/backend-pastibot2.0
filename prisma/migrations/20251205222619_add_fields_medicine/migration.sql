-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "days" TEXT[],
ADD COLUMN     "label" TEXT,
ADD COLUMN     "time" TEXT,
ALTER COLUMN "stock" SET DEFAULT 0;
