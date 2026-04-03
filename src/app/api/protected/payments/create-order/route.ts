import { createOrder } from "@/controllers/payment.controller"

export async function POST(req: Request) {
  return createOrder(req as any)
}