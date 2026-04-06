-- CreateIndex
CREATE INDEX "Payment_companyId_type_idx" ON "Payment"("companyId", "type");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
