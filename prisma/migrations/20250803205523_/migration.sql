-- CreateTable
CREATE TABLE "public"."paymentHistory" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "debtorId" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "debtId" TEXT NOT NULL,

    CONSTRAINT "paymentHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."paymentHistory" ADD CONSTRAINT "paymentHistory_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "public"."Debt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."paymentHistory" ADD CONSTRAINT "paymentHistory_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES "public"."Debtor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
