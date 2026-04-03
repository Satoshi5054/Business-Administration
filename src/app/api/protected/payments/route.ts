import { getPendingSalaries } from "@/controllers/payment.controller"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  return getPendingSalaries(req)
}
