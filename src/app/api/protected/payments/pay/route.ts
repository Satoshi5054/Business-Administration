import { createSalaryPayment } from "@/controllers/payment.controller"

export async function POST(req: Request) {
  return createSalaryPayment(req as any)
}