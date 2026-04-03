"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { api } from "@/lib/axios"

export default function PayPage() {
  const params = useParams<{ employeeId: string }>()
  const employeeId = params.employeeId
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)

    try {
      //////////////////////////////////////////////////////
      // 1️⃣ CREATE PAYMENT (FIXED ROUTE)
      //////////////////////////////////////////////////////
      const { data: payment } = await api.post(
        "/protected/payments/create",   // ✅ FIXED
        { employeeId }
      )

      //////////////////////////////////////////////////////
      // 2️⃣ CREATE ORDER (FIXED ROUTE)
      //////////////////////////////////////////////////////
      const { data: order } = await api.post(
        "/protected/payments/order",   // ✅ FIXED
        { paymentId: payment.id }
      )

      //////////////////////////////////////////////////////
      // 3️⃣ VERIFY PAYMENT
      //////////////////////////////////////////////////////
      await api.post("/protected/payments/verify", {
        orderId: order.orderId,
        paymentId: "pay_" + Math.random().toString(36).slice(2), // simulate
        signature: order.signature
      })

      //////////////////////////////////////////////////////
      // 4️⃣ REDIRECT BACK
      //////////////////////////////////////////////////////
      router.push("/v1/manager/payments")

    } catch (err) {
      console.error(err)
      alert("Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 flex justify-center items-center h-[80vh]">
      <div className="bg-white p-6 rounded-xl shadow w-96">

        <h2 className="text-lg font-semibold mb-2">
          Mock Payment Gateway
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Secure payment simulation
        </p>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

      </div>
    </div>
  )
}