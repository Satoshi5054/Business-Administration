import { verifyPayment } from "@/controllers/payment.controller"

export async function POST(req: Request) {
  return verifyPayment(req as any)
}