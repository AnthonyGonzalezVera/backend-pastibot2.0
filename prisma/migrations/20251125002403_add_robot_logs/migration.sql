-- CreateTable
CREATE TABLE "RobotLog" (
    "id" SERIAL NOT NULL,
    "medicineId" INTEGER,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RobotLog_pkey" PRIMARY KEY ("id")
);
