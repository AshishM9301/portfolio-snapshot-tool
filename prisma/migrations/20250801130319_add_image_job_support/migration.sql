-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('url', 'image');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "jobType" "JobType" NOT NULL DEFAULT 'url',
ALTER COLUMN "url" DROP NOT NULL;
